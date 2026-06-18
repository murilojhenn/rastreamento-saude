import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBcG7UwJS7Fchdhfv7SbgP59AXWlwkmWwE",
    authDomain: "rastreamento-saude.firebaseapp.com",
    projectId: "rastreamento-saude",
    storageBucket: "rastreamento-saude.firebasestorage.app",
    messagingSenderId: "630037928416",
    appId: "1:630037928416:web:616ef55c9e1ca251507385"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export {
    db,
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp
};
