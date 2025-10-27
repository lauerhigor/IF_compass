const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account_controller');

router.post('/', accountController.createTransaction);
router.get('/:accountId', accountController.getTransactions);

module.exports = router;