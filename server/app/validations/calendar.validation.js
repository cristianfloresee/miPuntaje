const {
    check
} = require('express-validator/check');

module.exports = {
    createCalendar: [
        check('year')
        .exists().withMessage('Year is a required field.')
        .isLength({min: 4}).withMessage('Name must be at least 4 characters.')
        .isInt().withMessage('Year must be an integer.'),

        check('semester')
        .exists().withMessage('Semester is a required field.')
        .isInt().withMessage('Semester must be an integer.')
    ],
    errorFormatter: ({
        location,
        msg,
        param,
        value,
        nestedErrors
    }) => {
        return {
            location: location,
            message: msg,
            param: param,
            value: value,
            debug_id: 222,
            nestedErrors: nestedErrors,
        }
    }
}


/*function validate(method) {

    switch (method) {
        case 'createCalendar':
            {
                body('year', 'Year is invalid.').exists(),
                body('semester', 'Semester is invalid').exists().isInt(),
                body('status').optional().isIn(['enabled', 'disabled'])
            }
    }
    
}

function validateCalendar(req, res, next){
    req.body('year', 'Invalid email').exists();
    req.body('semester').exists().isInt();

    const errors = req.validationErrors();
    if(errors){

    }
}


module.exports = {
    validateCalendar,
    validate
};

*/