require('dotenv').config();

console.log('PLAID_CLIENT_ID:', process.env.PLAID_CLIENT_ID);
console.log('PLAID_SECRET:', process.env.PLAID_SECRET);
console.log('PLAID_ENV:', process.env.PLAID_ENV);


const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

app.use(express.static('public'));

const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(configuration);


// Temporary storage
let ACCESS_TOKEN = null;
let ITEM_ID = null;

app.post('/api/create_link_token', async (req, res) => {
  try {
    console.log("Creating link token with environment:", process.env.PLAID_ENV);
    const response = await client.linkTokenCreate({
      user: { client_user_id: 'unique-user-id' },
      client_name: 'Financial Dashboard App',
      products: ['transactions', 'auth'],
      country_codes: ['US'],
      language: 'en',
    });
    console.log("Link token created:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error creating link token:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message });
  }
});


// Exchange Public Token
app.post('/api/set_access_token', async (req, res) => {
  try {
    const response = await client.itemPublicTokenExchange({
      public_token: req.body.public_token,
    });
    ACCESS_TOKEN = response.data.access_token;
    ITEM_ID = response.data.item_id;
    res.json({ message: 'Access token set', item_id: ITEM_ID });
  } catch (error) {
    console.error('Error exchanging token:', error.response.data);
    res.status(500).json(error.response.data);
  }
});

// Get Accounts
app.get('/api/accounts', async (req, res) => {
  try {
    if (!ACCESS_TOKEN) throw new Error('No access token');
    const response = await client.accountsGet({
      access_token: ACCESS_TOKEN,
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error getting accounts:', error.response?.data || error);
    res.status(500).json(error.response?.data || { error: error.message });
  }
});

/*
// Get Transactions (update date range)
app.get('/api/transactions', async (req, res) => {
  try {
    if (!ACCESS_TOKEN) throw new Error('No access token');
    const startDate = '2023-01-01';  // Updated date range
    const endDate = '2023-12-31';
    const response = await client.transactionsGet({
      access_token: ACCESS_TOKEN,
      start_date: startDate,
      end_date: endDate,
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error getting transactions:', error.response?.data || error);
    res.status(500).json(error.response?.data || { error: error.message });
  }
});
*/

app.get('/api/transactions', async (req, res) => {
  try {
    if (!ACCESS_TOKEN) {
      // Return sample data for testing if no access token is set
      return res.json({
        transactions: [
          { name: 'Test Transaction', date: '2023-01-01', amount: 50.00 },
          { name: 'Another Transaction', date: '2023-01-02', amount: 75.00 }
        ]
      });
    }
    // Otherwise, call the Plaid API
    const response = await client.transactionsGet({
      access_token: ACCESS_TOKEN,
      start_date: '2023-01-01',
      end_date: '2023-12-31',
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error getting transactions:', error.response?.data || error);
    res.status(500).json(error.response?.data || { error: error.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));