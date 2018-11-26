'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const express = require('express');
const authController = require('../../controllers').auth;
const validation = require('../../validations/auth.validation');
const validate = require('../../middlewares/validation-result');

// ----------------------------------------
// Define Express app
// ----------------------------------------
var api = express.Router();

// ----------------------------------------
// Routes and Controllers
// ----------------------------------------
api.post('/login', validation.login, validate.checkResult, authController.login);
//api.post('/signup', );
//api.post('/forgot', );
//api.post('/reset', );


// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = api;


/**
 * @api {post} v1/auth/refresh-token Refresh Token
 * @apiDescription Refresh expired accessToken
 * @apiVersion 1.0.0
 * @apiName RefreshToken
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}  email         User's email
 * @apiParam  {String}  refreshToken  Refresh token aquired when user logged in
 *
 * @apiSuccess {String}  tokenType     Access Token's type
 * @apiSuccess {String}  accessToken   Authorization Token
 * @apiSuccess {String}  refreshToken  Token to get a new accessToken after expiration time
 * @apiSuccess {Number}  expiresIn     Access Token's expiration time in miliseconds
 *
 * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
 * @apiError (Unauthorized 401)  Unauthorized     Incorrect email or refreshToken
 */
// router.route('/refresh-token')
//   .post(validate(refresh), controller.refresh);





