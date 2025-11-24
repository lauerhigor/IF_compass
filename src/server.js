require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const openFinanceRoutes = require('./routes/open_finance_routes');
// const customerRoutes = require('./routes/customer_routes'); // Removed
// const accountRoutes = require('./routes/account_routes'); // Removed
// const transactionRoutes = require('./routes/transaction_routes'); // Removed

const app = express();

app.use(express.json());
connectDB();

app.get('/', (req, res) => {
  res.status(200).json({ status: "API está no ar." });
});

// Global Prefix /openfinance
app.use('/openfinance', openFinanceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});