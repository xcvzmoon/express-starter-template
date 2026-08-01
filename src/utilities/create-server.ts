import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { env } from '../../config/env';
import routes from '../routes/routes';
import { testDatabaseConnection } from './database';

async function createServer(): Promise<Express> {
    const nodeEnv = env.NODE_ENV;
    console.info(`${nodeEnv} environment`.toUpperCase());

    const app: Express = express();

    // Trust proxy (necessary when behind reverse proxies like Nginx/Cloudflare)
    app.set('trust proxy', 1);

    // Security middlewares
    app.use(
        cors({
            origin: true,
            credentials: true,
        })
    );
    app.use(helmet({
        contentSecurityPolicy: false, // Not needed for JSON APIs
    }));

    // Rate limiting — protect against brute-force and abuse
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 100,               // Limit each IP to 100 requests per window
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: {
            success: false,
            error: { message: 'Too many requests, please try again later.' },
        },
    }));

    // Request parsing
    app.use(express.json({ limit: '12kb' }));
    app.use(express.urlencoded({ extended: false }));

    // Compression & logging
    app.use(compression());
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

    // Initialize routes
    routes(app);

    await Promise.all([
        testDatabaseConnection()
    ])

    // 404 Catch-all handler
    app.use((_req: Request, res: Response) => {
        res.status(404).json({
            success: false,
            error: {
                message: 'Route not found',
            },
        });
    });

    // Global Error Handler
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
        console.error('Unhandled Server Error:', err);
        res.status(500).json({
            success: false,
            error: {
                message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
            },
        });
    });

    return app;
}

export default createServer;