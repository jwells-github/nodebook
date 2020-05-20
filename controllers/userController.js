var async = require('async');
var User = require ('../models/user');
var Post = require ('../models/post');
 
// Display a page with a list of all users
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

// Display the user's profile page
exports.user_profile = function(req,res,next){
  if(!res.locals.currentUser){
    res.redirect('/');
  }
  async.parallel({
    // Get User
    user: function(callback){
      User.findById(req.params.id)
      .populate('friends')
      .populate('friend_requests')
      .exec(callback);
      },
    // Get user's posts and liked posts
    userPosts: function(callback){
      Post.find({$or: [{'author' : req.params.id}, {'likes':req.params.id}]})
      .populate("comments")
      .populate("likes")
      .populate("author")
      .sort({'posted_date' : -1})
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
                user: results.user, userPosts: results.userPosts
    });
  });

};

// Send or rescind a friend request to another user
exports.send_friend_request = function(req,res,next){
  if(res.locals.currentUser){
    if(req.body.userid){
      if(req.body.userid == res.locals.currentUser.id){
        res.redirect('/users');
      }
      User.findOne({_id: req.body.userid}, function(err,user){
        if(err){return next(err)}
        // Rescind a friend requst
        if(user.friend_requests.includes(res.locals.currentUser.id)){
          user.friend_requests.pull(res.locals.currentUser.id);
          user.save(function(err){
            if(err){return next(err)}
            res.redirect('/users');
          });
        }
        // Send a friend request
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

// Display a list of all of the logged in user's friends
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

// Accept or decline a friend request
exports.friends_post = function(req,res,next){
  if(res.locals.currentUser){
    if(req.body.friend_req_id){
      // Accept button pressed
      if(req.body.acceptButton !== undefined ){
        // Get logged in user
        User.findOne({_id: res.locals.currentUser.id}, function(err,user){
          if (err){return next(err)}
          // Remove the friend request and add as a friend
          user.friend_requests.pull(req.body.friend_req_id);
          user.friends.push(req.body.friend_req_id);
          user.save(function(err){
            if(err){return next(err)}
          });
        });
        // Get the user who sent the friend request
        User.findOne({_id: req.body.friend_req_id}, function(err,user){
          if(err){return next(err)}
          // Add the logged in the user as a friend
          user.friends.push(res.locals.currentUser.id);
          user.save(function(err){
            if(err){return next(err)}
            res.redirect('/users/friends');
          });
        });
      }
      // Decline button pressed
      else if(req.body.declineButton !== undefined ){
        User.findOne({_id: res.locals.currentUser.id}, function(err,user){
          if (err){return next(err)}
          // Remove friend request
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

// Remove a friend
exports.friend_delete = function(req,res,next){
  if(res.locals.currentUser){
    if(req.body.userid){
      if(req.body.userid == res.locals.currentUser.id){
        res.redirect('/users/friends');
      }
      // Get the friend
      User.findOne({_id: req.body.userid}, function(err,user){
        if(err){return next(err)}
        // Remove the logged in user as a friend
         user.friends.pull(res.locals.currentUser.id);
          user.save(function(err){
            if(err){return next(err)}
          });
      });
      // Get the logged in user
      User.findOne({_id: res.locals.currentUser.id}, function(err,user){
        if(err){return next(err)}
        // Remove the friend
         user.friends.pull(req.body.userid);
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
};