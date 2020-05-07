const { body,validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
const { check } = require('express-validator');
const bcrypt = require("bcryptjs");

var User = require('../models/user');

exports.user_create_get = function (req,res,next){
    if (res.locals.currentUser){
        res.redirect('/');
    }
    res.render('signup_form', {title: 'Signup'});
};

exports.user_create_post = [
    
    body('first_name', 'Require a firstname').trim(),
    body('surname', 'Require a surname').trim(),
    body('email', 'Require an Email').trim().isEmail(),
    body('password', 'Password must be longer than 4 characters').trim().isLength({min:4}),
    check('confirm_password', 'Passwords must match').trim().custom((value, {req}) => value === req.body.password),
    sanitizeBody('*').escape(),
    
    (req,res,next) => {
        const errors = validationResult(req);
        bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
            if (err){
                return next(err);
            }
            var user = new User({
                first_name: req.body.first_name,
                surname: req.body.surname,
                email: req.body.email,
                password: hashedPassword,
                });
            if(!errors.isEmpty()){
                res.render('signup_form', {title: 'Signup', errors:errors.array(), user: user});
                return;
            }
            else{
                User.findOne({'username': req.body.username})
                .exec(function(err,found_user){
                    if (err){ return next (err);}
                    if(found_user){
                        res.render('signup_form', {title: 'Username in use', errors:errors.array()});
                    }
                    else{
                        user.save(function (err){
                            console.log("User saved");
                            if(err){return next(err);}
                            res.redirect('/');
                        });
                    }
                });
            }
        });

    }
    
];