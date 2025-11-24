const Consent = require('../models/consent_model');
const Customer = require('../models/customer_model');

exports.createConsent = async (req, res) => {
    const { customerId, permissions } = req.body;

    try {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Cliente não encontrado." });
        }

        // Generate ID
        let newId = "urn:banco:consent:001";
        const lastConsent = await Consent.findOne().sort({ creationDateTime: -1 });
        if (lastConsent && lastConsent._id.startsWith("urn:banco:consent:")) {
            try {
                const lastIdNum = parseInt(lastConsent._id.split(':').pop());
                const newIdNum = lastIdNum + 1;
                newId = "urn:banco:consent:" + String(newIdNum).padStart(3, '0');
            } catch (e) {
                console.error("Erro ao gerar ID do consentimento:", e);
            }
        }

        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1); // 1 year expiration

        const newConsent = new Consent({
            _id: newId,
            customerId,
            permissions,
            status: 'AUTHORIZED',
            expirationDateTime: expirationDate
        });

        const savedConsent = await newConsent.save();
        res.status(201).json(savedConsent);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getConsent = async (req, res) => {
    const { id } = req.params;
    try {
        const consent = await Consent.findById(id);
        if (!consent) {
            return res.status(404).json({ message: "Consentimento não encontrado." });
        }
        res.status(200).json(consent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteConsent = async (req, res) => {
    const { id } = req.params;
    try {
        const consent = await Consent.findById(id);
        if (!consent) {
            return res.status(404).json({ message: "Consentimento não encontrado." });
        }

        // Option 1: Hard delete
        // await Consent.findByIdAndDelete(id);

        // Option 2: Soft delete / Revoke (Better for audit)
        consent.status = 'REVOKED';
        await consent.save();

        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
