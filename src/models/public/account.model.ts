import bcryptjs from 'bcryptjs';
import {
    Table,
    Column,
    DataType,
    Index,
    Model,
} from 'sequelize-typescript';

@Table({
    schema: 'public',
})
class Account extends Model<Account, Partial<Account>> {
    @Column({
        primaryKey: true,
        type: DataType.INTEGER,
        autoIncrement: true,
    })
    declare id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare name: string;

    @Column({
        type: DataType.STRING(800),
        allowNull: false,
    })
    declare password: string;

    @Index
    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: {
            name: 'email',
            msg: 'An account with this email already exists.',
        },
        validate: {
            isEmail: {
                msg: 'The email provided is not valid.',
            },
        },
    })
    declare email: string;

    @Column({
        type: DataType.STRING(10),
        allowNull: false,
        validate: {
            isIn: [['superadmin', 'admin', 'user']],
        },
        defaultValue: 'user',
    })
    declare role: string;

    async compare_password(password: string): Promise<boolean> {
        return await bcryptjs.compare(password, this.password);
    }
}

export default Account;
