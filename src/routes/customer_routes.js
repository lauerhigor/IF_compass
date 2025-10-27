const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer_controller');

router.post('/', customerController.createCustomer);

module.exports = router;