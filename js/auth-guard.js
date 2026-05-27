import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAPnP_J2hqgnssG9q6OuzkuCmjTQH0MJAM",
    authDomain: "househuntaarambh.firebaseapp.com",
    projectId: "househuntaarambh",
    storageBucket: "househuntaarambh.firebasestorage.app",
    messagingSenderId: "1016526460565",
    appId: "1:1016526460565:web:35aa697d3bcfdbda872d9c",
    measurementId: "G-XDK334L80G"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Immediate Local Check to prevent flicker
const path = window.location.pathname;
const isLoginPage = path.includes('login.html') || path === '/login' || path === '/html/login';

// Firebase Real-time Check
onAuthStateChanged(auth, (user) => {
    const isLoginPage = window.location.pathname.includes('login.html') || window.location.pathname === '/login' || window.location.pathname === '/html/login';
    
    if (!user) {
        // Not logged in -> Just remove local state, don't force redirect
        localStorage.removeItem('user');
    } else if (user && isLoginPage) {
        // Logged in but on login page -> Redirect to home
        window.location.href = '../index.html';
    }
});
