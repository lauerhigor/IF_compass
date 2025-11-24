const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer_controller');
const accountController = require('../controllers/account_controller');
const consentController = require('../controllers/consent_controller');
const openFinanceMiddleware = require('../middlewares/open_finance_middleware');

// Public Routes
router.post('/consents', consentController.createConsent);
router.get('/customers/lookup/by-cpf/:cpf', customerController.lookupByCpf);

// Creation Routes (Moved from individual files to here to be under /openfinance)
router.post('/customers', customerController.createCustomer);
router.post('/accounts', accountController.createAccount);
router.post('/transactions', accountController.createTransaction);

// Protected Routes (Apply Middleware)
router.get('/customers/:id/accounts', openFinanceMiddleware.verifyConsent, accountController.getAccountsByCustomerId);
router.get('/customers/:id', openFinanceMiddleware.verifyConsent, customerController.getCustomerById);
router.get('/accounts/:accountId/balance', openFinanceMiddleware.verifyConsent, accountController.getBalance);
router.get('/transactions/:accountId', openFinanceMiddleware.verifyConsent, accountController.getTransactions);

// Consent management
router.get('/consents/:id', consentController.getConsent);
router.delete('/consents/:id', consentController.deleteConsent);

module.exports = router;