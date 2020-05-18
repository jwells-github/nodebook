const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var Post = require('../models/post');
var User = require('../models/user');
var Comment = require('../models/comment');
var async = require('async');

exports.dashboard_get = function(req,res,next){
 if(!res.locals.currentUser) {
   res.render('guestDashboard', {title: "Welcome to Nodebook", message: req.flash('info')});
 }
 else{
  console.log(res.locals.currentUser.friends[1]);
  var usersToDisplay = [];
  usersToDisplay.push(res.locals.currentUser.id);
  for (var i = 0; i < res.locals.currentUser.friends.length; i++) {
   usersToDisplay.push(res.locals.currentUser.friends[i]);
   console.log(i + " " + usersToDisplay);
  }
  async.parallel({
   userPosts: function (callback){
    Post.find({'author' : usersToDisplay})
    .populate('author')
    .populate({
      path: 'comments',
      populate: {path: 'author'},
     })
     .populate({
      path:'comments',
      populate:{path:'likes'}
     })
     .populate('likes')
     .sort({'posted_date' : -1})
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
    var backURL=req.header('Referer') || '/';
    res.redirect(backURL);
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
 
 exports.like = function(req,res,next){
  if(res.locals.currentUser){
   if(req.body.postid){
    Post.findOne({_id: req.body.postid}, function (err,post){
     if(err){return next(err)}
     if (post.likes.includes(res.locals.currentUser.id)){
      post.likes.pull(res.locals.currentUser.id);
      post.save(function(err){
       if(err){return next(err)}
       res.redirect('/');
      });
     }
     else{
      post.likes.push(res.locals.currentUser.id);
      post.save(function(err){
      if(err){return next(err)}
       res.redirect('/');
      });
     }
    });
   }
   else if(req.body.commentid){
    Comment.findOne({_id: req.body.commentid}, function (err,comment){
     if(err){return next(err)}
     if (comment.likes.includes(res.locals.currentUser.id)){
      comment.likes.pull(res.locals.currentUser.id);
      comment.save(function(err){
       if(err){return next(err)}
       res.redirect('/');
      });
     }
     else{
      comment.likes.push(res.locals.currentUser.id);
      comment.save(function(err){
      if(err){return next(err)}
       res.redirect('/');
      });
     }
    });
   }
   
  }
  else{
   res.redirect('/');
  }
};