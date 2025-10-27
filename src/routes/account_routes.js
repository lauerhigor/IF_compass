const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account_controller');

router.post('/', accountController.createAccount);
router.get('/:accountId/balance', accountController.getBalance);

module.exports = router;