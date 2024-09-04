import express from 'express';  // Import Express framework
import { env } from 'process';  // Import environment variables

// Import the main routes for the application
const mainRoute = require('./routes/index');

// Create an instance of the Express application
const app = express();

// Define the port for the server to listen on, defaulting to 5000 if not specified in environment variables
const port = env.PORT || 5000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Use the main routes defined in the 'routes/index' module
app.use(mainRoute);

// Start the server and listen for incoming requests on the specified port and host
app.listen(port, '127.0.0.1', () => {
  console.log(`Server is running on http://127.0.0.1:${port}`);
});

// Export the Express application instance for use in other modules or tests
export default app;
