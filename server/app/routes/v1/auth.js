'use strict'

// ----------------------------------------
// Load modules
// ----------------------------------------
const express = require('express');

// ----------------------------------------
// Load controllers
// ----------------------------------------
const authController = require('../../controllers').auth;

// ----------------------------------------
// Define Express app
// ----------------------------------------
var api = express.Router();

// ----------------------------------------
// Routes and controllers
// ----------------------------------------
api.post('/login', authController.login);
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





