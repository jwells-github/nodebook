const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var Post = require('../models/post');

exports.dashboard_get = function(req,res,next){
 if(!res.locals.currentUser) {
   res.render('guestDashboard', {title: "Welcome to Nodebook", message: req.flash('info')});
 }
 else{
   res.render('userDashboard', {title: "Your Dashboard", message: req.flash('info')});
 }
}

exports.dashboard_post = [
 body('content', 'Posts must contain a message').trim().notEmpty(),
 sanitizeBody('*').escape(),
 (req,res,next) =>{
  console.log(req.body.content);
   const errors = validationResult(req);
   var post = new Post({
    content: req.body.content,
    author: res.locals.currentUser 
   });
   if(!errors.isEmpty()){
    res.render('userDashboard', {title: "Your Dashboard", errors: errors.array(), post:post});
    return;
   }
   else{
    post.save(function(err){
     if(err){return next(err);}
     res.redirect('/');
    });
   }
 }
];