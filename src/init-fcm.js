import firebase from "firebase/app"
import "firebase/messaging";
import "firebase/storage";
import 'firebase/analytics';
import 'firebase/auth';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjIj4u4Ueg4ZSAem7eQDZ9bEJmx9jG--g",
  authDomain: "facial-login.firebaseapp.com",
  projectId: "facial-login",
  storageBucket: "facial-login.appspot.com",
  messagingSenderId: "280044952377",
  appId: "1:280044952377:web:1559dbd647839e4b16a6e8",
  measurementId: "G-WF0R8VXDDR"
};

const app = firebase.initializeApp(firebaseConfig)
const analyticsRef = firebase.analytics(app);
const messagingRef = firebase.messaging(app)
const storageRef = firebase.storage(app);


export { analyticsRef, messagingRef , storageRef}