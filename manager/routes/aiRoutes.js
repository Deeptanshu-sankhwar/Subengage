const express = require('express')
const {
    promptTrigger
} = require('../controller/aiController');

const router = express.Router();

router.get('/triger', promptTrigger);

module.exports = router;