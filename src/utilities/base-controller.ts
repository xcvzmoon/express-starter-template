import sequelize from './database';
import type { Request, Response } from 'express';
import { boolFromStr, buildIncludes, csv, normSortOrder, num, getPrimaryKeyWhere } from '@/utilities/helpers';
import { type IncludeOptions, literal, Model, type ModelStatic, Op, type WhereOptions, type OrderItem } from 'sequelize';

type WhereWithOr = WhereOptions & { [K in typeof Op.or]?: WhereOptions[] };

export const create =
    (model: ModelStatic<Model>) =>
    async (req: Request, res: Response): Promise<void> => {
        const transaction = await sequelize.transaction();

        try {
            const record = await model.create({ ...req.body }, { transaction });

            await transaction.commit();

            res.status(201).json({ message: `${model.name} created successfully`, data: record });
        } catch (error: unknown) {
            await transaction.rollback();
            res.status(500).json({ message: `${model.name} could not be created.`, data: error instanceof Error ? error.message : String(error) });
        }
    };

export const update =
    (model: ModelStatic<Model>) =>
    async (req: Request, res: Response): Promise<void> => {
        const transaction = await sequelize.transaction();

        try {
            const where = getPrimaryKeyWhere(model, req);
            const record = await model.findOne({ where, transaction });

            if (!record) {
                throw new Error(`${model.name} not found.`);
            }

            const updatedRecord = await record.update(req.body, { transaction });

            await transaction.commit();

            res.status(200).json({ message: `${model.name} has been updated successfully.`, data: updatedRecord });
        } catch (error: unknown) {
            await transaction.rollback();
            res.status(500).json({ message: `${model.name} could not be updated.`, data: error instanceof Error ? error.message : String(error) });
        }
    };

export const readOne =
    (model: ModelStatic<Model>) =>
    async (req: Request, res: Response): Promise<void> => {
        try {
            const where = getPrimaryKeyWhere(model, req) as Record<string, unknown>;

            let include: IncludeOptions[] = [];
            try {
                include = buildIncludes(model, req.query.includes);
            } catch (err) {
                // keep original early-error behavior for bad association paths
                res.status(500).json({ message: `${model.name} could not be retrieved.`, data: err instanceof Error ? err.message : String(err) });
                return;
            }

            const record = await model.findOne({ where, include });

            if (!record) {
                res.status(404).json({ message: `${model.name} does not exist.`, data: false });
                return;
            }

            res.status(200).json({ message: `${model.name} retrieved successfully.`, data: record });
        } catch (error) {
            res.status(500).json({ message: `${model.name} could not be retrieved.`, data: error instanceof Error ? error.message : String(error) });
        }
    };

export const readAll =
    (model: ModelStatic<Model>) =>
    async (req: Request, res: Response): Promise<void> => {
        try {
            // Extract known params; keep the rest as filters
            const {
                page = '1',
                limit = '10',
                paginate = 'true',
                searchKeyword = '',
                searchColumns = '',
                includes = '',
                fields = '',
                sortBy = 'created_at',
                sortOrder = 'DESC',
                random = 'false',
                ...rawFilters
            } = req.query;

            // Pagination
            const shouldPaginate = boolFromStr(paginate, true);
            const pageNum = shouldPaginate ? num(page, 1) : 1;
            const limitNum = shouldPaginate ? num(limit, 10) : 10;
            const offset = shouldPaginate ? (pageNum - 1) * limitNum : 0;

            // Base filters
            const where: WhereWithOr = { ...(rawFilters as Record<string, unknown>) };

            // Search (requires searchColumns when keyword is provided)
            if (String(searchKeyword).length > 0) {
                const cols = csv(searchColumns);
                if (cols.length === 0) {
                    res.status(400).json({
                        message:
                            'No columns specified for search. Please provide at least one column name in the searchColumns parameter.',
                    });
                    return;
                }
                const kw = String(searchKeyword);

                // Build OR conditions across provided columns
                const orConditions: WhereOptions[] = cols.map((column) =>
                    Number.isFinite(Number(kw)) ? { [column]: kw } : { [column]: { [Op.iLike]: `%${kw}%` } },
                );

                // Assign with symbol key safely
                where[Op.or] = orConditions;
            }

            // Includes + field selection
            const include = buildIncludes(model, includes);
            const attributes = csv(fields);
            const hasAttributes = attributes.length > 0;

            // Sorting (or RANDOM)
            const isRandom = boolFromStr(random, false);
            const orderBy = isRandom ? literal('RANDOM()') : [[String(sortBy), normSortOrder(sortOrder)] as OrderItem];

            // Query options (conditionals via spreads)
            const findAllOptions = {
                where,
                order: orderBy,
                include,
                distinct: true, // Prevents wrong counts when using includes
                col: model.primaryKeyAttribute || 'id',
                ...(shouldPaginate && { limit: limitNum, offset }),
                ...(hasAttributes && { attributes }),
            };

            const { rows: records, count: totalCount } = await model.findAndCountAll(findAllOptions);

            res.status(200).json({
                totalCount,
                data: records,
                message: `${model.name} retrieved successfully.`,
            });
        } catch (error) {
            res.status(500).json({ message: `${model.name} could not be retrieved.`, data: error instanceof Error ? error.message : String(error) });
        }
    };

export const destroy =
    (model: ModelStatic<Model>) =>
    async (req: Request, res: Response): Promise<void> => {
        try {
            const where = getPrimaryKeyWhere(model, req);
            const destroyedRecord = await model.destroy({ where });

            if (destroyedRecord < 1) {
                res.status(404).json({ message: 'Record not found. Failed to delete.', data: false });
                return;
            }

            res.status(200).json({ message: `${model.name} deleted successfully`, data: true });
        } catch (error: unknown) {
            res.status(500).json({ message: `${model.name} could not be deleted.`, data: error instanceof Error ? error.message : String(error) });
        }
    };
