const express = require('express');
const router = express.Router();
const { getRigData, addRigData } = require('../controllers/rigController');

router.get('/', getRigData);
router.post('/', addRigData);

module.exports = router;