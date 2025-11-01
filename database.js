
// Import the functions you need from the SDKs you need

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

    apiKey: "AIzaSyDpevND_wFdc4ecj0SdSRjBrsnh_Tl6OS8",

    authDomain: "durhackx.firebaseapp.com",

    projectId: "durhackx",

    storageBucket: "durhackx.firebasestorage.app",

    messagingSenderId: "563104646617",

    appId: "1:563104646617:web:904574d136dced668d85c8",

    measurementId: "G-5KBFJMC4D1"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

const auth = getAuth(app);

const db = getFirestore(app);

window.signUp = async function() {
    alert("Hello!");
    const name = document.getElementById("nameInput").value
    const email = document.getElementById("emailInput").value
    const password = document.getElementById("passwordInput").value
    if(name == ""  || email == "" || password == "") {
        return;
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        createdAt: new Date()
    });
}  

window.Testing = async function() {
        alert("Testing");
    } 