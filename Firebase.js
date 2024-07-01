
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {

    apiKey: "AIzaSyBtVNwCbdoss0YgrI3viruzcVh25-EhSj8",
    authDomain: "todolist-4900a.firebaseapp.com",
    projectId: "todolist-4900a",
    storageBucket: "todolist-4900a.appspot.com",
    messagingSenderId: "839019030111",
    appId: "1:839019030111:web:3f7ae8faf2eaa096341dea",
    measurementId: "G-QQSJM7CV3Q"

};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore  = getFirestore(app);
