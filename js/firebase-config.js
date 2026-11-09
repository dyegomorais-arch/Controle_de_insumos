// Configuração do projeto Firebase "sillion-estoque".
// Esses valores NÃO são segredo; a segurança vem do Authentication + firestore.rules.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBCzqGufICceTFLD53jO6_EKwLfX4OL0h0",
  authDomain: "sillion-estoque.firebaseapp.com",
  projectId: "sillion-estoque",
  storageBucket: "sillion-estoque.firebasestorage.app",
  messagingSenderId: "326273313293",
  appId: "1:326273313293:web:b242ab24dd44e82a2cc344"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
