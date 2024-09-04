// Import the Buffer module for handling binary data
import { Buffer } from 'buffer';

// Import the UUID module for generating unique tokens
import { v4 } from 'uuid';

// Import the Redis client from the custom utility module
import redisClient from '../utils/redis';

// Import a utility controller for additional functionality (e.g., hashing)
import UtilController from './UtilController';

// Import the database client from the custom utility module
import dbClient from '../utils/db';

// Define the AuthController class to handle authentication-related requests
export default class AuthController {
  // Static method to handle the 'getConnect' request
  // This method authenticates the user and generates a token if successful
  static async getConnect (request, response) {
    try {
      // Extract the Authorization header and decode the Base64-encoded string
      const encodeAuthPair = request.headers.authorization.split(' ')[1];
      const decodeAuthPair = Buffer.from(encodeAuthPair, 'base64')
        .toString()
        .split(':');

      // Extract the email and password from the decoded string
      const _email = decodeAuthPair[0];
      const pwd = UtilController.SHA1(decodeAuthPair[1]);

      // Query the database to find the user by email
      const user = await dbClient.filterUser({ email: _email });

      // Check if the provided password matches the one in the database
      if (user.password !== pwd) {
        // If the password doesn't match, return a 401 Unauthorized response
        response.status(401).json({ error: 'Unauthorized' }).end();
      } else {
        // If the password matches, generate a new authentication token
        const _token = v4();

        // Store the token in Redis with a 24-hour expiration
        await redisClient.set(`auth_${_token}`, user._id.toString(), 86400);

        // Return the token in the response with a 200 OK status
        response.status(200).json({ token: _token }).end();
      }
    } catch (e) {
      // If any error occurs, return a 401 Unauthorized response
      response.status(401).json({ error: 'Unauthorized' }).end();
    }
  }

  // Static method to handle the 'getDisconnect' request
  // This method logs the user out by deleting their authentication token
  static async getDisconnect (request, response) {
    // Extract the token from the request
    const { token } = request;

    // Delete the token from Redis to log the user out
    await redisClient.del(token);

    // Return a 204 No Content response to indicate successful logout
    response.status(204).end();
  }
}
