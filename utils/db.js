import { env } from 'process';  // Import environment variables from the process module
import { MongoClient, ObjectId } from 'mongodb';  // Import MongoDB client and ObjectId for MongoDB operations

// DBClient class to manage database operations
export class DBClient {
  constructor() {
    // Set database connection details with default values if not provided in environment variables
    const host = env.DB_PORT ? env.DB_PORT : '127.0.0.1';
    const port = env.DB_HOST ? env.DB_HOST : 27017;
    const database = env.DB_DATABASE ? env.DB_DATABASE : 'files_manager';
    
    // Initialize MongoDB client connection
    this.myClient = MongoClient(`mongodb://${host}:${port}/${database}`);
    this.myClient.connect();  // Establish the connection
  }

  // Check if the MongoDB client is connected
  isAlive() {
    return this.myClient.isConnected();
  }

  // Get the number of users in the 'users' collection
  async nbUsers() {
    const myDB = this.myClient.db();  // Get the database instance
    const myCollection = myDB.collection('users');  // Access the 'users' collection
    return myCollection.countDocuments();  // Return the count of documents
  }

  // Get the number of files in the 'files' collection
  async nbFiles() {
    const myDB = this.myClient.db();  // Get the database instance
    const myCollection = myDB.collection('files');  // Access the 'files' collection
    return myCollection.countDocuments();  // Return the count of documents
  }

  // Check if a user with the given email exists in the 'users' collection
  async userExists(email) {
    const myDB = this.myClient.db();  // Get the database instance
    const myCollection = myDB.collection('users');  // Access the 'users' collection
    return myCollection.findOne({ email });  // Return the document matching the email
  }

  // Create a new user with the given email and password hash in the 'users' collection
  async newUser(email, passwordHash) {
    const myDB = this.myClient.db();  // Get the database instance
    const myCollection = myDB.collection('users');  // Access the 'users' collection
    return myCollection.insertOne({ email, passwordHash });  // Insert the new user and return the result
  }

  // Find a user based on the provided filters, converting _id to ObjectId if present
  async filterUser(filters) {
    const myDB = this.myClient.db();  // Get the database instance
    const myCollection = myDB.collection('users');  // Access the 'users' collection
    if ('_id' in filters) {
      // Convert _id from string to ObjectId
      filters._id = ObjectId(filters._id);
    }
    return myCollection.findOne(filters);  // Return the document matching the filters
  }

  // Find a file based on the provided filters, converting certain fields to ObjectId if present
  async filterFiles(filters) {
    const myDB = this.myClient.db();  // Get the database instance
    const myCollection = myDB.collection('files');  // Access the 'files' collection
    const idFilters = ['_id', 'userId', 'parentId'].filter(
      (prop) => prop in filters && filters[prop] !== '0'
    );
    idFilters.forEach((i) => {
      // Convert fields from string to ObjectId
      filters[i] = ObjectId(filters[i]);
    });
    return myCollection.findOne(filters);  // Return the document matching the filters
  }
}

// Instantiate the DBClient class and export it as a singleton
const dbClient = new DBClient();

export default dbClient;
