import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

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
const provider = new GoogleAuthProvider();

// Sign In Function
window.signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        localStorage.setItem('user', JSON.stringify({
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photo: user.photoURL
        }));
        window.location.href = '../index.html';
    } catch (error) {
        console.error("Auth Error:", error.code, error.message);
        alert("Authentication failed: " + error.message);
    }
};

// Sign Out Function
window.userLogout = async () => {
    try {
        await signOut(auth);
        localStorage.removeItem('user');
        // Check if we are in html/ folder or root
        if (window.location.pathname.includes('/html/')) {
            window.location.href = 'login.html';
        } else {
            window.location.href = 'html/login.html';
        }
    } catch (e) {
        console.error("Logout error", e);
        localStorage.removeItem('user');
        window.location.href = '/html/login.html';
    }
};

// Check Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        localStorage.setItem('user', JSON.stringify({
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photo: user.photoURL
        }));
    } else {
        localStorage.removeItem('user');
    }
});
