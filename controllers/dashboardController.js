const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var ObjectId = require('mongodb').ObjectID;
var Post = require('../models/post');
var Comment = require('../models/comment');
var async = require('async');

exports.dashboard_get = function(req,res,next){
 if(!res.locals.currentUser) {
   res.render('guestDashboard', {title: "Welcome to Nodebook", message: req.flash('info')});
 }
 else{
  async.parallel({
   userPosts: function (callback){
    Post.find({'author' : res.locals.currentUser.id})
    .populate('author')
    .populate({
      path: 'comments',
      populate: {path: 'author'},
     })
     .populate({
      path:'comments',
      populate:{path:'likes'}
     })
    .exec(callback);
   },
  },
   function (err,results){
    if (err) { return next(err);}
    res.render('userDashboard', {title: "Your Dashboard", userPosts: results.userPosts, message: req.flash('info')});
  });
}
};

exports.dashboard_post = [
 body('content', 'Posts must contain a message').trim().notEmpty(),
 sanitizeBody('*').escape(),
 (req,res,next) =>{
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

exports.comment_post = [
 body('content', 'Comments must contain a message').trim().notEmpty(),
 sanitizeBody('*').escape(),

 (req,res,next) =>{
  Post.findOne({_id: req.body.postid}, function (err,post){
   if (err){return next (err)}
   const errors = validationResult(req);
   
   var comment = new Comment({
   content: req.body.content,
   author: res.locals.currentUser
   });
   if(!errors.isEmpty()){
    res.render('userDashboard', {title: "Your Dashboard", errors: errors.array(), comment:comment});
    return;
   }
   else{
    comment.save(function(err){
     if(err){return next(err);}
     console.log(comment.id)

     post.comments.push(comment.id);
     post.save(function(err){
      if(err){return next(err)}{
       res.redirect('/');
      }
    })
    });
   }
  })

 }
 ];