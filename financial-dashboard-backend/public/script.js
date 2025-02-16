// public/script.js
async function initializePlaidLink() {
    try {
      // Fetch the link token from your backend
      const response = await fetch('/api/create_link_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      const linkToken = data.link_token;
      console.log('Received link token: ',linkToken);
      
      // Initialize Plaid Link
      const handler = Plaid.create({
        token: linkToken,
        onSuccess: async function(public_token, metadata) {
          console.log('Public Token: ', public_token);
          // Send public_token to backend to exchange for access token
          await fetch('/api/set_access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_token })
          });
          alert('Bank account connected successfully!');
          // You can now call your /api/accounts and /api/transactions endpoints
        },
        onExit: function(err, metadata) {
          if (err != null) {
            // Handle the error
            console.error('Error in Plaid Link:', err);
          }
        }
      });
  
      // Open the Plaid Link widget when a button is clicked (or immediately)
      document.getElementById('link-button').addEventListener('click', function(e) {
        handler.open();
      });
    } catch (error) {
      console.error('Error initializing Plaid Link:', error);
    }
  }

  async function fetchAccounts() {
    const response = await fetch('/api/accounts');
    const data = await response.json();
    console.log('Accounts:', data);
    // Update your dashboard UI accordingly
  }
  
  async function fetchTransactions() {
    const response = await fetch('/api/transactions');
    const data = await response.json();
    console.log('Transactions:', data);
    // Update your dashboard UI accordingly
  }
  
  // Example: Call these functions after successfully connecting a bank account
  async function onBankConnected() {
    await fetchAccounts();
    await fetchTransactions();
  }
  
  
  // Initialize when the page loads
  window.addEventListener('load', initializePlaidLink);
  