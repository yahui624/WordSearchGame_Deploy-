var express = require('express');
var router = express.Router();


let index = require('../controllers/index');

/* GET home page. */
router.get('/', index.enter_input);
router.post('/', index.post_request);
//get users
router.post ('/output', index.direct_result);


module.exports = router;
