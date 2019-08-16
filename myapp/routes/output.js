var express = require('express');
var router = express.Router();

/* The link doesnt work by entering */
router.get('/', function(req, res, next) {
  res.redirect('/')
  //res.send('Nothing to show at this mement');
});

module.exports = router;
