import createServer from './src/utilities/create-server';

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Exported as a Node request handler so srvx can serve it directly
// (the `dev`/`start` scripts own listening + graceful shutdown).
export default await createServer();
