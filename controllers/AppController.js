// Import the Redis client from the custom utility module
import redisClient from '../utils/redis';

// Import the database client from the custom utility module
import dbClient from '../utils/db';

// Define a controller class to handle application-related requests
class AppController {
  // Static method to handle the 'getStatus' request
  // This method checks the status of Redis and the database
  static async getStatus(request, response) {
    // Check if the Redis server is alive and store the result
    const redisStatus = redisClient.isAlive();
    
    // Check if the database server is alive and store the result
    const dbStatus = dbClient.isAlive();
    
    // Set the response content type to JSON
    response.set('Content-Type', 'application/json');
    
    // Send a 200 OK response with the status of Redis and the database
    response.status(200).json({ redis: redisStatus, db: dbStatus }).end();
  }

  // Static method to handle the 'getStats' request
  // This method retrieves and returns statistics about users and files
  static async getStats(request, response) {
    // Get the number of users from the database
    const users = await dbClient.nbUsers();
    
    // Get the number of files from the database
    const files = await dbClient.nbFiles();
    
    // Set the response content type to JSON
    response.set('Content-Type', 'application/json');
    
    // Send a 200 OK response with the user and file statistics
    response.status(200).json({ users, files }).end();
  }
}

// Export the AppController class for use in other parts of the application
export default AppController;
