import { db } from "./firebase-config.js";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Estado em memória, alimentado em tempo real pelo Firestore (nada de localStorage).
export const S = { ins: [], tec: [], mov: [] };
const COL = { ins: "insumos", tec: "tecnicos", mov: "movimentacoes" };

export function subscribe(onChange) {
  const offs = Object.keys(COL).map(k =>
    onSnapshot(collection(db, COL[k]),
      snap => { S[k] = snap.docs.map(d => ({ id: d.id, ...d.data() })); onChange(); },
      err => console.error("Firestore (" + COL[k] + "):", err))
  );
  return () => offs.forEach(f => f());
}
export const add = (k, data) => addDoc(collection(db, COL[k]), data);
export const upd = (k, id, data) => updateDoc(doc(db, COL[k], id), data);
export const del = (k, id) => deleteDoc(doc(db, COL[k], id));

// Helpers de consulta
export const ins = id => S.ins.find(i => i.id === id);
export const tec = id => S.tec.find(t => t.id === id);
export const est = id => S.mov.reduce((a, m) => m.insId === id ? a + (m.tipo === "entrada" ? m.qtd : -m.qtd) : a, 0);
export const lowOf = i => i.min > 0 && est(i.id) <= i.min;
