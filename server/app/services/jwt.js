'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secret = 'secret_string_crsoq';

exports.createToken = function (user) {
    var payload = {
        sub: user._id,
        name: user.name,
        last_name: user.last_name,
        middle_name: user.middle_name,
        email: user.email,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix()
    }

    return jwt.encode(payload, secret)
};