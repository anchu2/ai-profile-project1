// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAPVTKnvEJ829nS9zfgmH1pbBdk7T2QaLY",
  authDomain: "ai-profile-project.firebaseapp.com",
  projectId: "ai-profile-project",
  storageBucket: "ai-profile-project.firebasestorage.app",
  messagingSenderId: "635884364466",
  appId: "1:635884364466:web:1203c0761645a2f15adfab",
  measurementId: "G-QMKP7Q4EQ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { app, storage };

