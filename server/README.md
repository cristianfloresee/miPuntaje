
<h1 align="center">API</h1>

<div align="center">
  :steam_locomotive::train::train::train::train::train:
</div>
<div align="center">
  <strong>Fun functional programming</strong>
</div>
<div align="center">
  A classroom response system (CRS) for your institution.
</div>

<br />

<div align="center">
  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square"
      alt="API stability" />
  </a>
  <!-- NPM version -->
  <a href="https://npmjs.org/package/choo">
    <img src="https://img.shields.io/npm/v/choo.svg?style=flat-square"
      alt="NPM version" />
  </a>
  <!-- Build Status -->
  <a href="https://travis-ci.org/choojs/choo">
    <img src="https://img.shields.io/travis/choojs/choo/master.svg?style=flat-square"
      alt="Build Status" />
  </a>
  <!-- Test Coverage -->
  <a href="https://codecov.io/github/choojs/choo">
    <img src="https://img.shields.io/codecov/c/github/choojs/choo/master.svg?style=flat-square"
      alt="Test Coverage" />
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/choo">
    <img src="https://img.shields.io/npm/dt/choo.svg?style=flat-square"
      alt="Download" />
  </a>
  <!-- Standard -->
  <a href="https://standardjs.com">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square"
      alt="Standard" />
  </a>
</div>


<div align="center">
  <h3>
  <a href="#">
      Website
    </a>
    <span> | </span>
    <a href="#">
      Frontend
    </a>
    <span> | </span>
    <a href="#">
      User Manual
    </a>
    <span> | </span>
    <a href="https://github.com/choojs/choo/blob/master/.github/CONTRIBUTING.md">
      Contributing
    </a>
    <span> | </span>
    <a href="#">
      Chat
    </a>
  </h3>
</div>

<div align="center">
  <sub>An innovative software for education and learning. Built with ❤︎ by
  <a href="https://twitter.com/yoshuawuyts">Cristian Flores</a> and
  <a href="https://github.com/choojs/choo/graphs/contributors">
    Contributors
  </a>
</div>

## Table of Contents 🚩

- [Introduction](#introduction)
- [Features](#features)
- [Feedback](#feedback)
- [Contributors](#contributors)
- [Build Process](#build-process)
- [Backers](#backers-)
- [Sponsors](#sponsors-)
- [Acknowledgments](#acknowledgments)

## Overview

This is a boilerplate application for building REST APIs in Node.js using ES6 and Express. Intended for use with Postgres using Sequelize ORM.

### Features

| Feature                                | Summary                                                                                                                                                                                                                                                     |
|----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ES6 via Babel                  	 	 | ES6 support using [Babel](https://babeljs.io/).  |
| Authentication via JsonWebToken                  	 	 | Supports authentication using [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken).  |
| Code Linting               			 | Uses the airbnb-base style guide with ESLint parsing modern ES6 syntax                                                                                              |
| Auto server restart                  	 | Restart the server using [nodemon](https://github.com/remy/nodemon) in real-time anytime an edit is made, with babel compilation and eslint.                                                                                                                                                                            |
| ES6 Code Coverage via [istanbul](https://www.npmjs.com/package/istanbul)                  | Supports code coverage of ES6 code using istanbul and mocha. Code coverage reports are saved in `coverage/` directory post `yarn test` execution. Open `coverage/lcov-report/index.html` to view coverage report. `yarn test` also displays code coverage summary on console. Code coverage can also be enforced overall and per file as well, configured via .istanbul.yml                                                                                                                                                                            |
| Debugging via [debug](https://www.npmjs.com/package/debug)           | Instead of inserting and deleting console.log you can replace it with the debug function and just leave it there. You can then selectively debug portions of your code by setting DEBUG env variable. If DEBUG env variable is not set, nothing is displayed to the console.                       |
| Promisified Code via [bluebird](https://github.com/petkaantonov/bluebird)           | We love promise, don't we ? All our code is promisified and even so our tests via [supertest-as-promised](https://www.npmjs.com/package/supertest-as-promised).                       |
| API parameter validation via [express-validation](https://www.npmjs.com/package/express-validation)           | Validate body, params, query, headers and cookies of a request (via middleware) and return a response with errors; if any of the configured validation rules fail. You won't anymore need to make your route handler dirty with such validations. |
| Pre-commit hooks           | Runs lint and tests before any commit is made locally, making sure that only tested and quality code is committed
| Secure app via [helmet](https://github.com/helmetjs/helmet)           | Helmet helps secure Express apps by setting various HTTP headers. |
| Uses [yarn](https://yarnpkg.com) over npm            | Uses new released yarn package manager by facebook. You can read more about it [here](https://code.facebook.com/posts/1840075619545360) |

- CORS support via [cors](https://github.com/expressjs/cors)
- Uses [http-status](https://www.npmjs.com/package/http-status) to set http status code. It is recommended to use `httpStatus.INTERNAL_SERVER_ERROR` instead of directly using `500` when setting status code.
- Has `.editorconfig` which helps developers define and maintain consistent coding styles between different editors and IDEs.

## Getting Started 💾

Instalación de Dependencias

npm install -g nodemon
npm instal --save express
npm install jsonwebtoken --save

```sh
$ npm install choo
```

## FAQ

### Why is it called Choo?
Because I thought it sounded cute. All these programs talk about being
_"performant"_, _"rigid"_, _"robust"_ - I like programming to be light, fun and
non-scary. Choo embraces that.

## Built with 

- [Express.js](http://www.w3schools.com/jquery/jquery_ref_ajax.asp) - jQuery simplifies HTML document traversing, event handling, animating, and Ajax interactions for rapid web development.
- [Google Chart API](https://developers.google.com/chart/interactive/docs/quick_start) - Free , Rich Gallery , Customizable and Cross-browser compatible.
- [Bootstrap](http://getbootstrap.com/) - Extensive list of components and  Bundled Javascript plugins.

## See Also

- [](https://github.com/choojs/bankai) - streaming asset compiler

## Backers ❤️
Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/git-point#backer)]

## Sponsors ❤️
Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/git-point#sponsor)]

## Acknowledgments
Thanks to:
- [JetBrains](https://www.jetbrains.com) for supporting us with a [Free Open Source License](https://www.jetbrains.com/buy/opensource).

## License 📜
Nu is made available under the [MIT©](https://tldrlegal.com/license/mit-license)
