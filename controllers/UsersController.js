import UtilController from './UtilController'; // Importing the utility controller for utility functions
import dbClient from '../utils/db'; // Importing the database client for database operations

// This class handles user-related operations, such as creating new users and retrieving user information
export default class UsersController {
  // Handles the creation of a new user account
  static async postNew (request, response) {
    const { email, password } = request.body; // Extracting email and password from the request body

    // Check if either email or password is missing from the request
    if (!email || !password) {
      // Respond with a 400 status and a descriptive error message
      response.status(400).json({ error: `Missing ${!email ? 'email' : 'password'}` }).end();
    }
    // Check if a user with the given email already exists in the database
    else if (await dbClient.userExists(email)) {
      // Respond with a 400 status indicating the user already exists
      response.status(400).json({ error: 'Already exist' }).end();
    } else {
      try {
        // Hash the password using a utility function before storing it
        const passwordHash = UtilController.SHA1(password);

        // Insert the new user into the database with the hashed password
        const insert = await dbClient.newUser(email, passwordHash);

        // Extract the user's ID and email from the database response
        const { _id } = insert.ops[0];
        const _email = insert.ops[0].email;

        // Respond with a 201 status, indicating the user was successfully created
        response.status(201).json({ id: _id, email: _email }).end();
      } catch (err) {
        // In case of an error, respond with a 400 status and the error message
        response.status(400).json({ error: err.message }).end();
      }
    }
  }

  // Retrieves the information of the currently authenticated user
  static async getMe (request, response) {
    const { usr } = request; // Extracting the user object from the request

    // Remove sensitive information such as the password from the user object
    delete usr.password;

    // Add the user ID to the user object and remove the MongoDB-specific _id field
    usr.id = usr._id;
    delete usr._id;

    // Respond with a 200 status and the sanitized user object
    response.status(200).json(usr).end();
  }
}
