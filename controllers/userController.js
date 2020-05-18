var async = require('async');
var User = require ('../models/user');
var Post = require ('../models/post');
 
 
exports.user_list = function (req,res,next){
  if(res.locals.currentUser){
    User.find()
    .exec(function (err, list_users){
      if (err){return next(err)}
      res.render('user_list', {title: 'User List', user_list: list_users});
    });
  }
  else{
    res.redirect('/');
  }
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


// user.friend_requests
exports.send_friend_request = function(req,res,next){
  if(res.locals.currentUser){
    console.log('send friend req')
    if(req.body.userid){
      if(req.body.userid == res.locals.currentUser.id){
        res.redirect('/users');
      }
      User.findOne({_id: req.body.userid}, function(err,user){
        if(err){return next(err)}
        if(user.friend_requests.includes(res.locals.currentUser.id)){
          user.friend_requests.pull(res.locals.currentUser.id);
          user.save(function(err){
            if(err){return next(err)}
            res.redirect('/users');
          });
        }
        else{
          user.friend_requests.push(res.locals.currentUser.id);
          user.save(function(err){
            if(err){return next(err)}
            res.redirect('/users');
          });
        }

      });
    }
  }
};

exports.friends_get = function(req,res,next){
  if(res.locals.currentUser){
    User.findById(res.locals.currentUser.id)
    .populate('friend_requests')
    .populate('friends')
    .exec(function(err, user){
      if(err){return next(err)}
      res.render('friend_list', {title: 'Friend List', user:user});
    });
  }
  else{
    res.redirect('/');
  }
};

exports.friends_post = function(req,res,next){
  if(res.locals.currentUser){
    if(req.body.friend_req_id){
      if(req.body.acceptButton !== undefined ){
        User.findOne({_id: res.locals.currentUser.id}, function(err,user){
          if (err){return next(err)}
          user.friend_requests.pull(req.body.friend_req_id);
          user.friends.push(req.body.friend_req_id);
          user.save(function(err){
            if(err){return next(err)}
          });
        });
        User.findOne({_id: req.body.friend_req_id}, function(err,user){
          if(err){return next(err)}
          user.friends.push(res.locals.currentUser.id);
          user.save(function(err){
            if(err){return next(err)}
            res.redirect('/users/friends');
          });
        });
      }
      else if(req.body.declineButton !== undefined ){
        User.findOne({_id: res.locals.currentUser.id}, function(err,user){
          if (err){return next(err)}
          user.friend_requests.pull(req.body.friend_req_id);
          user.save(function(err){
          if(err){return next(err)}
            res.redirect('/users/friends');
          });
        });
      }
    }
    else{
       res.redirect('/');
    }
  }
  else{
      res.redirect('/');
  }

};