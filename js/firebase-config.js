// ============================================================
// FIREBASE CONFIG — paste your own project's keys here.
// Get these from: Firebase Console → Project Settings → General
// → "Your apps" → Web app → SDK setup and configuration
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyCKTsMTdpX1_MaiSkaI7MgXBVmUeXCPMgw",
  authDomain: "flower-91e74.firebaseapp.com",
  projectId: "flower-91e74",
  storageBucket: "flower-91e74.firebasestorage.app",
  messagingSenderId: "797148117535",
  appId: "1:797148117535:web:c8fc76dddcd9cf6c29f32a"
};
// The ONLY email allowed to sign in and create gifts.
// Change this to your own email address.
const OWNER_EMAIL = "your-email@gmail.com";

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
