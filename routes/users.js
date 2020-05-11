var express = require('express');
var router = express.Router();

var user_controller = require('../controllers/userController');

router.get('/', user_controller.user_list);

router.get('/:id', user_controller.user_profile);



module.exports = router;
