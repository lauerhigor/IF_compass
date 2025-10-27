require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const customerRoutes = require('./routes/customer_routes');
const accountRoutes = require('./routes/account_routes');
const openFinanceRoutes = require('./routes/open_finance_routes');
const transactionRoutes = require('./routes/transaction_routes');
const app = express();

app.use(express.json()); 
connectDB(); 
app.get('/', (req, res) => {
    res.status(200).json({ status: "API está no ar." });
});
app.use('/customers', customerRoutes); 
app.use('/accounts', accountRoutes); 
app.use('/openfinance', openFinanceRoutes); 
app.use('/transactions', transactionRoutes);

const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); 
});