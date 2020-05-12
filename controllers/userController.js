var async = require('async');
var User = require ('../models/user');
var Post = require ('../models/post');
 
 
exports.user_list = function (req,res,next){
  User.find()
  .exec(function (err, list_users){
    if (err){return next(err)}

    res.render('user_list', {title: 'User List', user_list: list_users});
  });
};

exports.user_profile = function(req,res,next){
  async.parallel({
    user: function(callback){
      User.findById(req.params.id)
      .populate('friends')
      .populate('friend_requests')
      .exec(callback);
      },
    user_posts: function(callback){
      Post.find({'author' : req.params.id})
      .populate("comments")
      .populate("likes")
      .populate("author")
      .exec(callback);
    },
    liked_posts: function(callback){
      Post.find({'likes': req.params.id})
      .populate("comments")
      .populate("likes")
      .populate("author")
      .exec(callback);
    },
    liked_comments: function(callback){
      Post.find({'likes': req.params.id})
      .populate("comments")
      .populate("likes")
      .populate("author")
      .exec(callback);
    }
  },
  function(err,results){
    if(err) {return next (err);}
    if(results.user==null){
      var err = new Error('User not found');
      err.status = 404;
      return next(err);
    }
    res.render('user_profile', {title: results.user.full_name,
                user: results.user, user_posts: results.user_posts
    });
  });

};