import { Router } from 'express';  // Importing the Router class from Express

import AppController from '../controllers/AppController';  // Importing the AppController for application-wide endpoints
import UsersController from '../controllers/UsersController';  // Importing the UsersController for user-related endpoints
import AuthController from '../controllers/AuthController';  // Importing the AuthController for authentication-related endpoints
import FilesController from '../controllers/FilesController';  // Importing the FilesController for file-related endpoints
import UtilController from '../controllers/UtilController';  // Importing the UtilController for utility functions

const router = Router();  // Creating a new router instance

// Middleware to check authorization for specific paths
router.use((request, response, next) => {
  const paths = ['/connect'];
  if (!paths.includes(request.path)) {
    next();  // Proceed if the path doesn't require authorization
  } else if (!request.headers.authorization) {
    response.status(401).json({ error: 'Unauthorized' }).end();  // Return 401 if authorization header is missing
  } else {
    next();  // Proceed if authorization is provided
  }
});

// Middleware to check for token in headers for specific paths
router.use((request, response, next) => {
  const paths = ['/disconnect', '/users/me', '/files'];
  if (!paths.includes(request.path)) {
    next();  // Proceed if the path doesn't require a token
  } else if (!request.headers['x-token']) {
    response.status(401).json({ error: 'Unauthorized' }).end();  // Return 401 if token is missing
  } else {
    next();  // Proceed if token is provided
  }
});

// Application routes
router.get('/status', AppController.getStatus);  // Route to get the application status
router.get('/stats', AppController.getStats);  // Route to get application statistics
router.post('/users', UsersController.postNew);  // Route to create a new user
router.get('/connect', AuthController.getConnect);  // Route to handle user login
router.get('/disconnect', AuthController.getDisconnect);  // Route to handle user logout
router.post('/files', FilesController.postUpload);  // Route to upload a new file
router.get('/files/:id', FilesController.getShow);  // Route to retrieve a file by ID
router.get('/files', FilesController.getIndex);  // Route to list all files

// Routes to publish and unpublish files, with token validation
router.put('/files/:id/publish', UtilController.token, FilesController.putPublish);  
router.put('/files/:id/unpublish', UtilController.token, FilesController.putUnpublish);

module.exports = router;  // Exporting the router to be used in the application
