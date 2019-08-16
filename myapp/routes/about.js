var express = require('express');
var router = express.Router();

/* About page */
router.get('/', function(req, res, next) {
  res.send('Nothing to show at this moment');
});

module.exports = router;
