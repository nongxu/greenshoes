//Development use only
const express = require('express');
const router = express.Router();

router.get('/addresses', (req, res) => {
  res.status(200).json([
    "123 Green Street, NY",
    "456 Blue Ave, LA"
  ]);
});

module.exports = router;