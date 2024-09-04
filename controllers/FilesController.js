/* eslint-disable no-param-reassign */

// Import the contentType function from the mime-types package to handle MIME types
import { contentType } from 'mime-types';

// Import the custom database client for interacting with the database
import dbClient from '../utils/db';

// Import a utility controller for additional operations like reading files
import UtilController from './UtilController';

// Define the FilesController class to manage file-related requests
export default class FilesController {
  // Static method to handle file uploads
  static async postUpload (request, response) {
    // Extract user ID from the request
    const userId = request.user.id;

    // Extract file details from the request body
    const {
      name, type, parentId, isPublic, data
    } = request.body;

    // Validate the required fields and check if the file type is valid
    if (!name || !type || (!['folder', 'file', 'image'].includes(type)) || (!data && type !== 'folder')) {
      // Return a 400 Bad Request error if validation fails
      response.status(400).send(`error: ${!name
? 'Missing name'
: (!type || (!['folder', 'file', 'image'].includes(type)))
        ? 'Missing type'
: 'Missing data'}`);
    } else {
      try {
        let flag = false; // Initialize a flag to track validation issues

        // Check if the parentId is provided and valid
        if (parentId) {
          const folder = await dbClient.filterFiles({ _id: parentId });

          // If the parent folder doesn't exist or isn't a folder, return an error
          if (!folder) {
            response.status(400).json({ error: 'Parent not found' }).end();
            flag = true;
          } else if (folder.type !== 'folder') {
            response.status(400).json({ error: 'Parent is not a folder' }).end();
            flag = true;
          }
        }

        // If no validation issues, proceed to insert the new file into the database
        if (!flag) {
          const insRes = await dbClient.newFile(userId, name, type, isPublic, parentId, data);

          // Extract the inserted document and prepare it for the response
          const docs = insRes.ops[0];
          delete docs.localPath; // Remove the localPath field for security reasons
          docs.id = docs._id; // Assign the _id value to id for client-side usage
          delete docs._id; // Remove the _id field from the response

          // Return the newly created file's details with a 201 Created status
          response.status(201).json(docs).end();
        }
      } catch (err) {
        // If an error occurs, return a 400 Bad Request error with the error message
        response.status(400).json({ error: err.message }).end();
      }
    }
  }

  // Static method to retrieve file details by ID
  static async getShow (request, response) {
    // Extract user ID and file ID from the request
    const usrId = request.user._id;
    const { id } = request.params;

    // Query the database for the file by ID
    const file = await dbClient.filterFiles({ _id: id });

    // If the file doesn't exist or doesn't belong to the user, return a 404 error
    if (!file) {
      response.status(404).json({ error: 'Not found' }).end();
    } else if (String(file.userId) !== String(usrId)) {
      response.status(404).json({ error: 'Not found' }).end();
    } else {
      // If the file is found and belongs to the user, return the file details
      response.status(200).json(file).end();
    }
  }

  // Static method to retrieve a list of files for a user, optionally filtered by parentId
  static async getIndex (request, response) {
    // Extract user ID and query parameters from the request
    const usrId = request.user._id;
    const _parentId = request.query.parentId ? request.query.parentId : '0';
    const page = request.query.page ? request.query.page : 0;

    // Query the database for files matching the parentId and userId, with pagination
    const cursor = await dbClient.findFiles(
      { parentId: _parentId, userId: usrId },
      { limit: 20, skip: 20 * page }
    );

    // Convert the cursor to an array of results and clean up the file objects
    const res = await cursor.toArray();
    res.map((i) => {
      i.id = i._id; // Assign the _id value to id for client-side usage
      delete i._id; // Remove the _id field from the response
      return i;
    });

    // Return the list of files with a 200 OK status
    response.status(200).json(res).end();
  }

  // Static method to publish a file, making it publicly accessible
  static async putPublish (request, response) {
    // Extract user ID from the request and find the file by ID
    const userId = request.usr._id;
    const file = await dbClient.filterFiles({ _id: request.params.id });

    // If the file doesn't exist or doesn't belong to the user, return a 404 error
    if (!file || String(file.userId) !== String(userId)) {
      response.status(404).json({ error: 'Not found' }).end();
    } else {
      // Update the file to set it as public and return the updated file details
      const newFile = await dbClient.updatefiles({ _id: file._id }, { isPublic: true });
      response.status(200).json(newFile).end();
    }
  }

  // Static method to unpublish a file, making it private
  static async putUnpublish (request, response) {
    // Extract user ID from the request and find the file by ID
    const userId = request.usr._id;
    const file = await dbClient.filterFiles({ _id: request.params.id });

    // If the file doesn't exist or doesn't belong to the user, return a 404 error
    if (!file || String(file.userId) !== String(userId)) {
      response.status(404).json({ error: 'Not found' }).end();
    } else {
      // Update the file to set it as private and return the updated file details
      const newFile = await dbClient.updatefiles({ _id: file._id }, { isPublic: false });
      response.status(200).json(newFile).end();
    }
  }

  // Static method to retrieve the content of a file by ID
  static async getFile (request, response) {
    // Extract user ID and find the file by ID
    const usrId = request.usr._id;
    const file = await dbClient.filterFiles({ _id: request.params.id });

    // If the file doesn't exist, return a 404 error
    if (!file) {
      response.status(404).json({ error: 'Not found' }).end();
    } else if (file.type === 'folder') {
      // If the file is a folder, return a 400 Bad Request error
      response.status(400).json({ error: "A folder doesn't have content" }).end();
    } else if ((String(file.userId) === String(usrId)) || file.isPublic) {
      try {
        // Read the file content and set the appropriate content-type header
        const content = await UtilController.readFile(file.localPath);
        const header = { 'Content-Type': contentType(file.name) };

        // Return the file content with a 200 OK status
        response.set(header).status(200).send(content).end();
      } catch (err) {
        // If an error occurs while reading the file, return a 404 error
        response.status(404).json({ error: 'Not found' }).end();
      }
    } else {
      // If the file doesn't belong to the user and isn't public, return a 404 error
      response.status(404).json({ error: 'Not found' }).end();
    }
  }
}
