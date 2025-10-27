const Customer = require('../models/customer_model');


exports.createCustomer = async (req, res) => {
    // 1. Leitura do corpo (como estava)
    const { name, cpf, email } = req.body;
    
    try {
        // 2. Validação de existência (como estava)
        if (!name || !cpf || !email) {
            return res.status(400).json({ message: "Os campos name, cpf e email são obrigatórios." });
        }

        // =============================================
        // NOVO: VALIDAÇÃO DE NOME (Corrige Testes 20 e 21)
        // =============================================
        
        // Define um comprimento máximo para o nome (Teste 20)
        const MAX_NAME_LENGTH = 100; 
        if (name.length > MAX_NAME_LENGTH) {
            return res.status(400).json({ 
                message: `Nome inválido. O nome não pode exceder ${MAX_NAME_LENGTH} caracteres.` 
            });
        }

        // Regex para permitir letras (incluindo acentuadas) e espaços. Rejeita números e caracteres especiais. (Teste 21)
        const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
        if (!nameRegex.test(name)) {
            return res.status(400).json({ 
                message: "Nome inválido. O nome deve conter apenas letras e espaços." 
            });
        }
        // =============================================
        // FIM DA VALIDAÇÃO DE NOME
        // =============================================

        // 3. Validação de Email (Adicionada anteriormente)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: "Email inválido. Forneça um email em um formato válido (ex: nome@dominio.com)." 
            });
        }
        
        // 4. Validação de CPF (Adicionada anteriormente)
        const cpfRegex = /^\d{11}$/;
        if (!cpfRegex.test(cpf)) {
            return res.status(400).json({ 
                message: "CPF inválido. O CPF deve conter exatamente 11 dígitos numéricos, sem pontos, traços ou espaços." 
            });
        }
        // =============================================

        // 5. Lógica do contador (como você implementou)
        let newId = "cus_001";
        const lastCustomer = await Customer.findOne().sort({ _id: -1 });

        if (lastCustomer && lastCustomer._id.startsWith("cus_")) {
            try {
                const lastIdNum = parseInt(lastCustomer._id.substring(4));
                const newIdNum = lastIdNum + 1;
                newId = "cus_" + String(newIdNum).padStart(3, '0');
            } catch (e) {
                console.error("Erro ao parsear o último ID do cliente:", e);
            }
        }

        // 6. Salva com o novo _id gerado
        const newCustomer = new Customer({
            _id: newId,
            name, // Nome agora validado
            cpf,  // CPF validado
            email // Email validado
        });

        const savedCustomer = await newCustomer.save();
        res.status(201).json(savedCustomer);

    } catch (error) {
        // 7. TRATAMENTO DE ERRO DE CPF DUPLICADO (Adicionado anteriormente)
        if (error.code === 11000 && error.keyPattern && error.keyPattern.cpf) {
            return res.status(409).json({ // 409 Conflict
                message: "Erro ao criar cliente: O CPF informado já está cadastrado." 
            });
        }
        
        // Retorno genérico para outros erros
        res.status(400).json({ message: error.message });
    }
};

exports.getCustomerById = async (req, res) => {
    const { id } = req.params;
    try {
        // .select('-accounts') é uma boa prática para não expor dados internos
        const customer = await Customer.findById(id).select('-accounts'); 
        
        if (!customer) {
            return res.status(404).json({ message: "Cliente não encontrado." });
        }
        res.status(200).json(customer);
    } catch (error) {
        res.status(400).json({ message: "Erro ao buscar cliente", error: error.message });
    }
};