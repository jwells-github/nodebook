var express = require('express');
var router = express.Router();

var user_controller = require('../controllers/userController');

router.get('/', user_controller.user_list);

router.get('/friends', user_controller.friends_get);

router.post('/friend_request',  user_controller.send_friend_request);

router.get('/:id', user_controller.user_profile);






module.exports = router;
