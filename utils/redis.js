import { createClient } from 'redis'; // Import Redis client creation function
import { promisify } from 'util'; // Import promisify function to convert callback-based functions to promises

// Class to manage Redis client operations
class RedisClient {
  constructor () {
    // Create a Redis client instance
    this.myClient = createClient();

    // Handle Redis client errors
    this.myClient.on('error', (error) => console.error('Redis Client Error:', error));
  }

  // Check if the Redis client is connected
  isAlive () {
    return this.myClient.connected; // Return the connection status of the Redis client
  }

  /**
   * Get the value associated with the specified key from Redis.
   * @param {string} key - The key to retrieve the value for.
   * @returns {Promise<string>} - A promise that resolves to the value associated with the key.
   */
  async get (key) {
    // Convert the Redis client's GET method to a promise-based method
    const getAsync = promisify(this.myClient.GET).bind(this.myClient);
    return getAsync(key); // Return the value associated with the key
  }

  /**
   * Set a value for the specified key in Redis with an expiration time.
   * @param {string} key - The key to set the value for.
   * @param {string} val - The value to set.
   * @param {number} time - The expiration time in seconds.
   * @returns {Promise<string>} - A promise that resolves to the status of the SET operation.
   */
  async set (key, val, time) {
    // Convert the Redis client's SET method to a promise-based method
    const setAsync = promisify(this.myClient.SET).bind(this.myClient);
    return setAsync(key, val, 'EX', time); // Set the value with an expiration time
  }

  /**
   * Delete the specified key from Redis.
   * @param {string} key - The key to delete.
   * @returns {Promise<number>} - A promise that resolves to the number of keys that were removed.
   */
  async del (key) {
    // Convert the Redis client's DEL method to a promise-based method
    const delAsync = promisify(this.myClient.DEL).bind(this.myClient);
    return delAsync(key); // Delete the key and return the number of keys removed
  }
}

// Instantiate the RedisClient class and export it as a singleton
const redisClient = new RedisClient();

export default redisClient;
