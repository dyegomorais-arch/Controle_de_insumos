import { onUser, login, logout, currentEmail } from "./auth.js";
import { S, subscribe, add, upd, del, ins, est, lowOf } from "./db.js";
import * as V from "./ui.js";

const $ = id => document.getElementById(id);
const v = id => { const e = $(id); return e ? e.value.trim() : ""; };
const ymd = n => { const d = new Date(); d.setDate(d.getDate() - n); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const hoje = () => ymd(0);
const agora = () => new Date().toTimeString().slice(0, 5);

let st = { tab: "est", M: null, msg: "", F: "", Q: "", FL: "todos", TP: "saida", DF: "", DT: "" };
let unsub = null;

// ---------- sessão ----------
onUser(u => {
  if (unsub) { unsub(); unsub = null; }
  if (!u) { $("root").innerHTML = V.loginView(); return; }
  $("root").innerHTML = V.shell(u.email);
  unsub = subscribe(refresh);
  renderTab();
});

// ---------- renderização ----------
function renderTab() {
  $("nav").innerHTML = V.nav(st.tab);
  $("app").innerHTML = V.tabView(st);
  refresh(); drawModal();
}
// Atualiza só as listas (não apaga o que a pessoa está digitando quando o Firestore sincroniza)
function refresh() {
  const set = (id, html) => { const e = $(id); if (e) e.innerHTML = html; };
  set("il", V.listaIns(st)); set("tl", V.listaTec()); set("el", V.listaEnt(st));
  set("cnt", S.ins.length); set("nl", S.ins.filter(lowOf).length);
}
function drawModal() { $("modal").innerHTML = V.modalView(st.M, st.msg, hoje(), currentEmail()); }
function open(k, id) { st.M = { k, id: id || null }; st.msg = ""; drawModal(); }
function fechar() { st.M = null; st.msg = ""; drawModal(); }
function erro(m) { st.msg = m; const e = $("msg"); if (e) e.textContent = m; }

// ---------- gravações ----------
async function salvar() {
  const M = st.M, por = currentEmail(); let i;
  try {
    if (M.k === "novo") {
      const n = v("n"); if (!n) return erro("Digite o nome do insumo.");
      if (S.ins.some(x => x.nome.toLowerCase() === n.toLowerCase())) return erro("Esse insumo já existe.");
      const ref = await add("ins", { nome: n, un: v("u") || "un", cat: v("c"), min: parseFloat(v("mn")) || 0 });
      const q0 = parseFloat(v("q0"));
      if (q0 > 0) await add("mov", { tipo: "entrada", insId: ref.id, tecId: "", qtd: q0, data: hoje(), obs: "Estoque inicial", por, hora: agora() });
    } else if (M.k === "edit") {
      const n = v("n"); if (!n) return erro("Digite o nome.");
      i = ins(M.id);
      await upd("ins", M.id, { nome: n, un: v("u") || i.un, cat: v("c"), min: parseFloat(v("mn")) || 0 });
    } else {
      const q = parseFloat(v("q")), d = v("d"), t = v("t");
      if (!(q > 0)) return erro("Digite a quantidade.");
      if (!d) return erro("Escolha a data.");
      if (M.k === "saida") {
        if (!t) return erro("Escolha quem está retirando.");
        const e = est(M.id); if (q > e) return erro("Só tem " + e + " " + ins(M.id).un + " no estoque.");
      }
      await add("mov", { tipo: M.k, insId: M.id, tecId: M.k === "saida" ? t : "", qtd: q, data: d, obs: v("o"), por, hora: agora() });
    }
  } catch (e) { return erro("Erro ao salvar: " + e.message); }
  fechar();
}

const A = {
  tab: t => { st.tab = t; renderTab(); },
  logout: () => logout(),
  novo: () => open("novo"), entrada: id => open("entrada", id), saida: id => open("saida", id), edit: id => open("edit", id),
  fechar, salvar,
  irTec: () => { st.M = null; st.tab = "tec"; renderTab(); },
  setTp: x => { st.TP = x; renderTab(); },
  setFl: x => { st.FL = x; renderTab(); },
  rapido: n => { if (n === "all") { st.DF = ""; st.DT = ""; } else { st.DF = ymd(+n); st.DT = ymd(0); } renderTab(); },
  async delIns(id) {
    const i = ins(id);
    if (S.mov.some(m => m.insId === id)) return alert("Não dá para excluir: " + i.nome + " já tem movimentações no histórico.");
    if (!confirm("Excluir " + i.nome + "?")) return;
    await del("ins", id); fechar();
  },
  async addTec() {
    const n = v("tn"); if (!n) return alert("Digite o nome do técnico.");
    await add("tec", { nome: n, fone: v("tf") }); $("tn").value = ""; $("tf").value = "";
  },
  async delTec(id) {
    if (S.mov.some(m => m.tecId === id)) return alert("Não dá para excluir: esse técnico já tem retiradas no histórico.");
    if (confirm("Excluir este técnico?")) await del("tec", id);
  },
  async delMov(id) { if (confirm("Apagar este registro? O estoque será recalculado.")) await del("mov", id); }
};

// ---------- eventos (delegação) ----------
document.addEventListener("click", e => {
  if (e.target.classList.contains("ov")) return fechar();
  const t = e.target.closest("[data-a]");
  if (t && A[t.dataset.a]) A[t.dataset.a](t.dataset.id);
});
document.addEventListener("input", e => {
  const k = e.target.dataset.in;
  if (k === "busca") { st.Q = e.target.value; refresh(); }
  if (k === "hf") { st.F = e.target.value; refresh(); }
});
document.addEventListener("change", e => {
  const k = e.target.dataset.in;
  if (k === "df") { st.DF = e.target.value; refresh(); }
  if (k === "dt") { st.DT = e.target.value; refresh(); }
});
document.addEventListener("submit", async e => {
  if (e.target.id !== "lf") return;
  e.preventDefault();
  const b = e.target.querySelector("button"); b.disabled = true;
  try { await login(v("em"), $("pw").value); }
  catch (err) { $("lmsg").textContent = V.authErr(err.code); b.disabled = false; }
});
