var express = require('express');
var router = express.Router();

var signup_controller = require('../controllers/signupController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/signup', signup_controller.user_create_get);

router.post('/signup', signup_controller.user_create_post);


module.exports = router;
