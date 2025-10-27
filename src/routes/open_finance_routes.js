const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer_controller');
const accountController = require('../controllers/account_controller');

router.get('/customers/:id', customerController.getCustomerById);
router.get('/customers/:id/accounts', accountController.getAccountsByCustomerId);
router.get('/accounts/:id/balance', accountController.getBalance);
router.get('/accounts/:id/transactions', accountController.getTransactions);

module.exports = router;