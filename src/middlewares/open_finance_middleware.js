const Consent = require('../models/consent_model');
const Account = require('../models/account_model');

exports.verifyConsent = async (req, res, next) => {
    try {
        let customerId = req.params.customerId || req.params.id;

        // If accessing via accountId, find the customerId
        if (req.params.accountId) {
            const account = await Account.findById(req.params.accountId);
            if (!account) {
                return res.status(404).json({ message: "Conta não encontrada." });
            }
            customerId = account.customer;
        }

        // If no customerId found (should not happen if routes are correct)
        if (!customerId) {
            // Fallback: try to find customerId in body if it's a POST/PUT (though usually consent is for GETs)
            if (req.body.customerId) {
                customerId = req.body.customerId;
            } else {
                // If we still can't find it, maybe it's a route that doesn't need specific customer context?
                // But this middleware is for protected data.
                return res.status(400).json({ message: "Contexto do cliente não identificado." });
            }
        }

        // Find valid consent
        const consent = await Consent.findOne({
            customerId: customerId,
            status: 'AUTHORIZED',
            expirationDateTime: { $gt: new Date() }
        });

        if (!consent) {
            return res.status(403).json({ message: "Acesso negado. Consentimento não encontrado ou expirado." });
        }

        // Check permissions based on route (simplified mapping)
        const path = req.path;
        let requiredPermission = '';

        if (path.includes('/accounts') && !path.includes('/balance')) {
            requiredPermission = 'ACCOUNTS_READ';
        } else if (path.includes('/balance')) {
            requiredPermission = 'BALANCES_READ';
        } else if (path.includes('/transactions')) {
            // Note: The prompt says /transactions/:accountId requires no specific permission listed? 
            // Wait, the prompt says:
            // GET /openfinance/transactions/:accountId
            // (Requer permissão BALANCES_READ? No, usually TRANSACTIONS_READ but prompt didn't specify. 
            // Let's assume ACCOUNTS_READ or BALANCES_READ or just check if consent exists as prompt says "Middleware de Proteção (Obrigatório)... verificar se existe um consentimento AUTHORIZED")
            // The prompt lists:
            // GET /openfinance/customers/:customerId/accounts (Requer permissão ACCOUNTS_READ)
            // GET /openfinance/customers/:customerId (Requer permissão CUSTOMER_DATA_READ)
            // GET /openfinance/accounts/:accountId/balance (Requer permissão BALANCES_READ)
            // GET /openfinance/transactions/:accountId (No permission specified in prompt text explicitly next to it, but let's assume it needs one. 
            // Actually, looking at the prompt again:
            // "GET /openfinance/transactions/:accountId" is listed under Rotas Protegidas.
            // Let's assume it requires 'ACCOUNTS_READ' or similar if not specified. 
            // However, the prompt says: "Body (Exigido): { "customerId": "...", "permissions": [...] }"
            // So I should check if the consent has the permission.
            // Let's infer 'TRANSACTIONS_READ' or just check for ANY valid consent if not strict?
            // The prompt says: "O middleware deve verificar se existe um consentimento AUTHORIZED e não-expirado para o cliente."
            // It doesn't explicitly say "AND check for specific permission X for route Y" in the *Middleware Logic* section, 
            // but it lists permissions next to routes.
            // "GET /openfinance/customers/:customerId/accounts (Requer permissão ACCOUNTS_READ)"
            // So I MUST check permissions.

        } else if (path.includes('/transactions')) {
            requiredPermission = 'TRANSACTIONS_READ';
        } else if (path.match(/\/customers\/[^/]+$/)) { // /customers/:id
            requiredPermission = 'CUSTOMER_DATA_READ';
        }

        if (requiredPermission && !consent.permissions.includes(requiredPermission)) {
            return res.status(403).json({ message: `Acesso negado. Permissão '${requiredPermission}' necessária.` });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: "Erro interno no middleware de consentimento.", error: error.message });
    }
};
