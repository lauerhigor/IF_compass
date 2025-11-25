require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const openFinanceRoutes = require('./routes/open_finance_routes');

const app = express();

app.use(express.json());
connectDB();

app.get('/', (req, res) => {
  res.status(200).json({ status: "API está no ar." });
});

app.use('/openfinance', openFinanceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});