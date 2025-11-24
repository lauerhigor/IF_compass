const Account = require('../models/account_model');
const Customer = require('../models/customer_model');
const Transaction = require('../models/transaction_model');

// =============================================
// SUBSTITUA A FUNÇÃO createAccount POR ESTA
// =============================================
exports.createAccount = async (req, res) => {
    // 1. Lê customerId do body (como o Teste 3 envia)
    //    e NÃO lê mais o _id do body
    const { customerId, type, branch, number } = req.body;

    try {
        //
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Cliente não encontrado. Impossível criar a conta." });
        }

        // 2. Lógica do contador (nova)
        let newId = "acc_001";
        // Encontra a última conta criada para gerar o ID
        const lastAccount = await Account.findOne().sort({ _id: -1 });

        if (lastAccount && lastAccount._id.startsWith("acc_")) {
            try {
                const lastIdNum = parseInt(lastAccount._id.substring(4));
                const newIdNum = lastIdNum + 1;
                newId = "acc_" + String(newIdNum).padStart(3, '0');
            } catch (e) {
                console.error("Erro ao parsear o último ID da conta:", e);
                // (Você pode querer uma lógica mais robusta aqui)
            }
        }

        // 3. Salva com o _id gerado
        const newAccount = new Account({
            _id: newId, // <-- ID gerado
            type,
            branch,
            number,
            balance: 0,
            customer: customerId // Salva referência do customer
        });

        const savedAccount = await newAccount.save();
        customer.accounts.push(savedAccount._id);
        await customer.save();
        res.status(201).json(savedAccount);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getBalance = async (req, res) => {
    const { accountId } = req.params;
    try {
        const account = await Account.findById(accountId).select('balance');
        if (!account) {
            return res.status(404).json({ message: "Conta não encontrada." });
        }
        res.status(200).json({ balance: account.balance });
    } catch (error) {
        res.status(400).json({ message: "Erro ao buscar saldo", error: error.message });
    }
};

exports.createTransaction = async (req, res) => {
    // 1. Lê os campos do body (como estava)
    const { accountId, amount, type, description, category } = req.body;

    try {
        // 2. Validação de Valor Positivo (implementada anteriormente)
        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({
                message: "Valor da transação inválido. O valor deve ser um número maior que zero."
            });
        }

        // =============================================
        // NOVO: VALIDAÇÃO DE CASAS DECIMAIS (Corrige Teste 30)
        // =============================================
        const amountStr = String(amount);
        // Verifica se o valor tem um ponto decimal
        if (amountStr.includes('.')) {
            // Pega a parte depois do ponto
            const decimalPart = amountStr.split('.')[1];
            // Verifica se essa parte tem mais de 2 caracteres
            if (decimalPart.length > 2) {
                return res.status(400).json({
                    message: "Valor da transação inválido. O valor não pode ter mais que duas casas decimais."
                });
            }
        }
        // =============================================
        // FIM DA NOVA VALIDAÇÃO
        // =============================================

        const account = await Account.findById(accountId);
        if (!account) {
            return res.status(404).json({ message: "Conta não encontrada." }); //
        }

        // 3. Lógica de crédito/débito (como estava)
        if (type === 'credit') {
            // Opcional: Arredondar o valor antes de somar para garantir
            account.balance += Math.round(amount * 100) / 100;
        } else if (type === 'debit') {
            const amountInCents = Math.round(amount * 100);
            const balanceInCents = Math.round(account.balance * 100);

            if (balanceInCents < amountInCents) {
                return res.status(400).json({ message: "Saldo insuficiente." }); //
            }
            account.balance -= (amountInCents / 100); //
        } else {
            return res.status(400).json({ message: "Tipo de transação inválido. Use 'credit' ou 'debit'." }); //
        }

        // Arredonda o saldo final para 2 casas decimais
        account.balance = Math.round(account.balance * 100) / 100;

        // 4. Lógica do contador (implementada anteriormente)
        let newId = "trn_001";
        // ... (resto da lógica do contador)
        const lastTransaction = await Transaction.findOne().sort({ _id: -1 });
        if (lastTransaction && lastTransaction._id.startsWith("trn_")) {
            try {
                const lastIdNum = parseInt(lastTransaction._id.substring(4));
                const newIdNum = lastIdNum + 1;
                newId = "trn_" + String(newIdNum).padStart(3, '0');
            } catch (e) {
                console.error("Erro ao parsear o último ID da transação:", e);
            }
        }

        // 5. Salva com o _id gerado (implementado anteriormente)
        const newTransaction = new Transaction({
            _id: newId,
            date: new Date(),
            description,
            amount, // Valor agora validado
            type,
            category,
            account: accountId // Salva referência da conta
        });

        const savedTransaction = await newTransaction.save();
        account.transactions.push(savedTransaction._id); //
        await account.save(); //

        res.status(200).json({
            message: "Transação realizada com sucesso.",
            newBalance: account.balance // Saldo agora arredondado
        });

    } catch (error) {
        res.status(400).json({ message: error.message }); //
    }
};

exports.getTransactions = async (req, res) => {
    const { accountId } = req.params;
    try {
        const account = await Account.findById(accountId).populate('transactions');
        if (!account) {
            return res.status(404).json({ message: "Conta não encontrada." });
        }
        res.status(200).json(account.transactions);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAccountsByCustomerId = async (req, res) => {
    const { id } = req.params;
    try {
        const customer = await Customer.findById(id).populate('accounts');
        if (!customer) {
            return res.status(404).json({ message: "Cliente não encontrado." });
        }
        res.status(200).json(customer.accounts);
    } catch (error) {
        res.status(400).json({ message: "Erro ao buscar contas do cliente", error: error.message });
    }
};