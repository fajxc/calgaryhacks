require('dotenv').config();


console.log('PLAID_CLIENT_ID:', process.env.PLAID_CLIENT_ID);
console.log('PLAID_SECRET:', process.env.PLAID_SECRET);
console.log('PLAID_ENV:', process.env.PLAID_ENV);


const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const { db } = require('./firebase');
const admin = require('firebase-admin');

// Middleware
app.use(bodyParser.json());
app.use(cors());

app.use(express.static('public'));

app.post('/api/register', async (req, res) => {
  try {
    const { name, age, city, education, salary, spending } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const docRef = await db.collection('users').add({
      name,
      age,
      city,
      education,
      salary,
      spending,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ message: 'User registered successfully', id: docRef.id });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: error.message });
  }
});



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

app.get('/api/transactions', async (req, res) => {
  try {
    if (!ACCESS_TOKEN) throw new Error('No access token');
    const startDate = '2000-01-01';
    const endDate = '2025-02-10';
    const response = await client.transactionsGet({
      access_token: ACCESS_TOKEN,
      start_date: startDate,
      end_date: endDate,
    });
    // If no transactions are returned, send sample data for testing:
    if (!response.data.transactions || response.data.transactions.length === 0) {
      console.log('No transactions found; returning sample transactions for testing.');
      return res.json({
        transactions: [
          { name: 'Test Transaction 1', date: '2023-01-15', amount: 50.00, category: ["Restaurants", "Food"] },
          { name: 'Test Transaction 2', date: '2023-02-20', amount: 75.00, category: ["Utilities"] }
        ]
      });
    }
    res.json(response.data);
  } catch (error) {
    console.error('Error getting transactions:', error.response?.data || error);
    res.status(500).json(error.response?.data || { error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));