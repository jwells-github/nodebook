const { body,validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
const { check } = require('express-validator');
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const nodemailer = require('nodemailer');


var User = require('../models/user');
var Token = require('../models/emailTokenSchema');

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
			  
				User.findOne({'email': req.body.email})
				.exec(function(err,found_user){
					if (err){ return next (err);}
					if(found_user){
					  console.log(found_user);
						res.render('signup_form', {title: 'Username in use', errors:errors.array()});
					}
					else{
						user.save(function (err){

						if(err){return next(err);}
						var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
						
						token.save(function (err){
							if (err){
									return next(err);
							}
							var transporter = nodemailer.createTransport({ service: 'Gmail', auth: { user: process.env.MY_TESTING_EMAIL, pass: process.env.MY_TESTING_EMAIL_PASSSWORD } });
							var mailOptions = { from: 'no-reply@localhost.com',
							to: user.email, 
							subject: 'Account Verification Token', 
							text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/signup\/confirmation\/' + token.token + '\n' };
							transporter.sendMail(mailOptions, function (err) {
  							if (err) { return next(err); }
					    	  res.redirect('/');
					  	});   
						});
						
				  });
					}
			});
			}
	});

	}
		
];

exports.email_confirmation = function(req,res,next){
  // Find a matching token
  Token.findOne({ token: req.params.token }, function (err, token) {
    if(err){return next(err);}
    if (!token) return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token. Your token my have expired.' });

    // If we found a token, find a matching user
    User.findOne({ _id: token._userId}, function (err, user) {
      if(err){return next(err);}
    
      if (!user) return res.status(400).send({ msg: 'We were unable to find a user for this token.' });
      if (user.isVerified) return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.' });
  
      // Verify and save the user
      user.is_verified = true;
      
      // findandupdate
      User.findByIdAndUpdate(token._userId, user, {}, function(err, theuser){
        if (err) { return next(err);}
        res.send("email verified");
      });
    });
  });
};

exports.email_confirmation_resend_get = function(req,res,next){
		if (res.locals.currentUser){
				res.redirect('/');
		}
		res.render('email_confirmation_resend_form', {title: 'Resend Email Confirmation'});
};

exports.email_confirmation_resend_post = [
  body('email', 'Require an Email').trim().isEmail(),
  body('password', 'Password must be longer than 4 characters').trim().notEmpty(),
  sanitizeBody('*').escape(),
  (req,res,next) => {
    const errors = validationResult(req);
      if(!errors.isEmpty()){
        res.render('email_confirmation_resend_form', {title: 'Resend Email Confirmation', errors:errors.array()});
        return;
      }
      else{
        User.findOne({ email: req.body.email }, function (err, user) {
          if(err){return next(err);}
          if (!user){
            return res.status(400).send({ msg: 'We were unable to find a user with that email.' });
          } 
          bcrypt.compare(req.body.password, user.password, (err, data) => {
            if (err){
              console.log("error");
              return;
            }
            if (data) {
              if (user.isVerified){
                 res.render('email_confirmation_resend_form', {title: 'Email already verified', errors:errors.array()});
                 return;
              } 
              // Create a verification token, save it, and send email
              var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
    
              // Save the token
              token.save(function (err) {
                if (err) { return next(err) }
                // Send the email
  	            var transporter = nodemailer.createTransport({ service: 'Gmail', auth: { user: process.env.MY_TESTING_EMAIL, pass: process.env.MY_TESTING_EMAIL_PASSSWORD } });
  							var mailOptions = { from: 'no-reply@localhost.com',
  							to: user.email, 
  							subject: 'Account Verification Token', 
  							text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/signup\/confirmation\/' + token.token};
                transporter.sendMail(mailOptions, function (err) {
                  if (err) { return next(err); }
                  req.flash('info','Email Verification Resent');
                  res.redirect('/');
                });

              });
            } 
            else {
              // passwords do not match!
              req.flash('info','Incorrect password');
              res.render('email_confirmation_resend_form', {title: 'Resend Email Confirmation', message: req.flash('info')});
              return;
            }
          });
          
        });
      }

  }
];

exports.email_confirmation_resend = function (req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('email', 'Email cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({ remove_dots: false });
 
    // Check for validation errors    
    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors);
 
    User.findOne({ email: req.body.email }, function (err, user) {
      if(err){return next(err);}
      if (!user) return res.status(400).send({ msg: 'We were unable to find a user with that email.' });
      if (user.isVerified) return res.status(400).send({ msg: 'This account has already been verified. Please log in.' });

      // Create a verification token, save it, and send email
      var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });

      // Save the token
      token.save(function (err) {
        if (err) { return res.status(500).send({ msg: err.message }); }

        // Send the email
        var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });
        var mailOptions = { from: 'no-reply@codemoto.io', to: user.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/signup\/confirmation\/' + token.token + '.\n' };
        transporter.sendMail(mailOptions, function (err) {
            if (err) { return res.status(500).send({ msg: err.message }); }
            res.status(200).send('A verification email has been sent to ' + user.email + '.');
        });
      });
    });
};
		