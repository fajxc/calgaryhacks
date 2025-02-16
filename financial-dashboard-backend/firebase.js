const admin = require('firebase-admin');
const serviceAccount = require('./nextchapter-aa3e2-firebase-adminsdk-fbsvc-ccfa74469c.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://console.firebase.google.com/u/0/project/nextchapter-aa3e2/database/nextchapter-aa3e2-default-rtdb/data/~2F"
});

const db = admin.firestore();

module.exports = { admin, db };
