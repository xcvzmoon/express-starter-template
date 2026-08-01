# Express TypeScript Starter Template (with Bun)

A production-ready, highly-opinionated Express.js template built with TypeScript and powered by the [Bun](https://bun.com) runtime. It comes pre-configured with essential features for building robust, scalable APIs.

## 🚀 Key Features

- **Runtime & Build**: [Bun](https://bun.com) for ultra-fast dependency installation, execution, and bundling.
- **Framework**: Express.js with full TypeScript support.
- **Database**: PostgreSQL with [Sequelize](https://sequelize.org/) ORM and `sequelize-typescript` decorators.
- **Authentication**: Pre-configured [Passport.js](https://www.passportjs.org/) with Local and JWT strategies.
- **Validation**: Strict runtime schema and environment variable validation using [Zod](https://zod.dev/).
- **Security**: Pre-configured with Helmet (security headers), CORS, and Express Rate Limit.
- **Email Services**: Built-in `nodemailer` setup using Handlebars for HTML templating.
- **WebSockets**: Integrated `socket.io` for real-time communication.
- **Containerization**: Multi-stage `Dockerfile` optimized for Bun deployments.
- **Code Quality**: ESLint pre-configured with TypeScript support.

## 🛠 Tech Stack

- **Core**: Node.js, Bun, TypeScript, Express.js
- **Data**: PostgreSQL, Sequelize, pg
- **Security/Auth**: Passport.js, jsonwebtoken, bcryptjs, Helmet, Express Rate Limit
- **Utilities**: Zod, Nodemailer, Handlebars, Socket.io, Morgan (logging), Compression

## 📂 Project Architecture

```text
.
├── config/             # Configuration files (e.g., Zod environment validation)
├── src/                # Application source code
│   ├── controllers/    # API Route handlers (business logic)
│   ├── middlewares/    # Express middlewares (auth, validation, etc.)
│   ├── models/         # Sequelize database models (using decorators)
│   ├── routes/         # Express route definitions (API versioning, e.g., v1.0)
│   ├── schemas/        # Zod validation schemas for requests
│   ├── strategies/     # Passport authentication strategies (Local, JWT)
│   ├── templates/      # Handlebars HTML templates for emails
│   └── utilities/      # Helper functions, database connection, mailer, base classes
├── .env.sample         # Sample environment variables
├── Dockerfile          # Multi-stage Docker configuration
├── eslint.config.js    # ESLint configuration
├── index.ts            # Application entry point
├── package.json        # Project metadata and scripts
└── tsconfig.json       # TypeScript configuration
```

## ⚙️ Environment Variables

Copy the `.env.sample` to `.env` and fill in the required values:

```bash
cp .env.sample .env
```

### Configuration Options

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode (`development` or `production`) | `development` |
| `PORT` | The port the application will listen on | `5001` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `DATABASE_USE_SSL` | Boolean flag to require SSL for the database | `false` |
| `PRIVATE_ACCESS_KEY` | Private key (Base64) for signing JWTs | - |
| `PUBLIC_ACCESS_KEY` | Public key (Base64) for verifying JWTs | - |
| `SALT_WORK_FACTOR` | Work factor for bcrypt hashing | `10` |
| `JWT_EXPIRES_IN` | Token expiration time | `1d` |
| `SMTP_HOST` | Email SMTP Server Host | `smtp.gmail.com` |
| `SMTP_PORT` | Email SMTP Server Port | `587` |
| `SMTP_USERNAME` | SMTP Auth Username | - |
| `SMTP_PASSWORD` | SMTP Auth Password | - |

*(Note: Environment variables are strictly validated on startup using Zod in `config/env.ts`)*

## 🚦 Getting Started

### Installation

Install the dependencies using Bun:

```bash
bun install
```

### Running the Application

**Development Mode:** (Runs with auto-reload/watch mode)
```bash
bun run dev
```

**Production Mode:** (Requires building the project first)
```bash
bun run build
bun run start
```

### Available Scripts

- `bun run dev`: Starts the server in development mode using Bun's `--watch` flag.
- `bun run build`: Bundles the TypeScript code into `dist/` directory targeting Node.
- `bun run start`: Runs the built application in production mode.
- `bun run lint`: Runs ESLint across the codebase.
- `bun run lint:fix`: Runs ESLint and auto-fixes fixable issues.

## 🐳 Docker / Containerization

A multi-stage `Dockerfile` is included to optimize the build process and reduce the final image size.

To build the Docker image:
```bash
docker build -t express-starter .
```

To run the container:
```bash
docker run -p 5001:5001 --env-file .env express-starter
```
*Note: Ensure your `.env` variables (like `DATABASE_URL`) point to accessible hosts from within the Docker network.*

## 🗄 Database Setup & Migrations

The project uses **Sequelize ORM** for database interactions. 

> **Note**: Database schema synchronisation (`sequelize.sync()`) has been removed from application startup for production safety. You should use explicit migration files (via Sequelize CLI) to manage schema changes and prevent unintended data loss or schema conflicts.

## 🔒 Authentication & Authorization

Authentication is managed via **Passport.js**.
- **Local Strategy**: Validates username/email and password against the database.
- **JWT Strategy**: Secures private endpoints by verifying JSON Web Tokens passed in the `Authorization: Bearer <token>` header. Public and private keys (Base64 encoded) are used for signing and verifying tokens.

## 📚 API Documentation

*Needs Verification:* The project currently handles route definitions in `src/routes/` but lacks automated API documentation generation (e.g., Swagger/OpenAPI). Consider implementing `swagger-ui-express` or similar tools for maintaining endpoint documentation.

## 🤝 Development Workflow & Contribution

1. Create a new branch for your feature (`git checkout -b feature/my-feature`).
2. Make your changes and ensure strict typing.
3. Ensure the code passes the linter: `bun run lint`.
4. Commit your changes with descriptive messages.
5. Push to the branch and submit a Pull Request.

---
*Created and maintained using [Bun](https://bun.com).*
