// Só gera HTML (sem acessar o Firebase). Quem reage aos cliques é o app.js, via data-a="ação".
import { S, ins, tec, est, lowOf } from "./db.js";

export const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export const fd = s => (s ? s.split("-").reverse().join("/") : "");
// "maria.souza@x.com" -> "Maria Souza"
export const nomeDe = e => String(e || "").split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "—";
export const UN = "un"; // única unidade usada no sistema

export function authErr(code) {
  const m = {
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/user-disabled": "Usuário desativado.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco.",
    "auth/network-request-failed": "Sem conexão com a internet."
  };
  return m[code] || "Não foi possível entrar. (" + code + ")";
}

export const loginView = () =>
  `<div class="login"><form id="lf" class="lc">
    <div class="lg"><img src="assets/logo.svg" alt="Sillion"></div>
    <h1>Controle de Estoque</h1>
    <label>E-mail</label><input id="em" type="email" autocomplete="username" required>
    <label>Senha</label><input id="pw" type="password" autocomplete="current-password" required>
    <div class="msg" id="lmsg"></div>
    <button class="pri" style="width:100%" type="submit">Entrar</button>
  </form></div>`;

export const shell = email =>
  `<header class="top-h"><div>
    <span class="brand"><img alt="Sillion" src="assets/logo.svg"><span>Controle de Estoque</span></span>
    <span class="who"><small>${esc(email)}</small><button class="out" data-a="logout">Sair</button></span>
  </div></header>
  <main><nav id="nav"></nav><div id="app"></div></main><div id="modal"></div>`;

export const nav = tab =>
  [["est", "📦 Estoque"], ["tec", "👷 Técnicos"], ["ent", "📤 Retiradas"]]
    .map(t => `<button class="${t[0] === tab ? "on" : ""}" data-a="tab" data-id="${t[0]}">${t[1]}</button>`).join("");

export function tabView(st) {
  if (st.tab === "est")
    return `<div class="bar"><h2>Insumos (<span id="cnt">0</span>)</h2><button class="pri" data-a="novo">+ Novo insumo</button></div>
      <input class="f" data-in="busca" placeholder="🔍 Buscar insumo ou categoria" value="${esc(st.Q)}">
      <div class="chips">
        <button class="chip${st.FL === "todos" ? " on" : ""}" data-a="setFl" data-id="todos">Todos</button>
        <button class="chip${st.FL === "repor" ? " on" : ""}" data-a="setFl" data-id="repor">⚠ Repor (<span id="nl">0</span>)</button>
      </div><div id="il"></div>`;
  if (st.tab === "tec")
    return `<div class="item" style="margin-bottom:14px"><b>Novo técnico</b>
      <label>Nome</label><input id="tn" placeholder="Nome do técnico">
      <label>Telefone (opcional)</label><input id="tf">
      <button class="pri" style="margin-top:14px;width:100%" data-a="addTec">Cadastrar técnico</button></div>
      <div class="bar"><h2>Técnicos cadastrados</h2></div><div id="tl"></div>`;
  const tp = st.TP, chip = (id, t) => `<button class="chip${tp === id ? " on" : ""}" data-a="setTp" data-id="${id}">${t}</button>`;
  return `<div class="bar"><h2>${tp === "saida" ? "Retiradas de material" : tp === "entrada" ? "Entradas de material" : "Todas as movimentações"}</h2></div>
    ${tp === "saida" ? `<div class="mut" style="margin:-6px 0 12px">Quem liberou a retirada é registrado automaticamente (quem estava logado).</div>` : ""}
    <div class="chips">${chip("saida", "Retiradas")}${chip("entrada", "Entradas")}${chip("todas", "Todas")}</div>
    <input class="f" data-in="hf" placeholder="🔍 Buscar por insumo, técnico ou quem liberou" value="${esc(st.F)}">
    <div class="dt"><div><label>De</label><input type="date" data-in="df" value="${st.DF}"></div>
    <div><label>Até</label><input type="date" data-in="dt" value="${st.DT}"></div></div>
    <div class="chips">
      <button class="chip" data-a="rapido" data-id="0">Hoje</button><button class="chip" data-a="rapido" data-id="7">7 dias</button>
      <button class="chip" data-a="rapido" data-id="30">30 dias</button><button class="chip" data-a="rapido" data-id="all">Tudo</button>
    </div><div id="el"></div>`;
}

export function listaIns(st) {
  const q = st.Q.toLowerCase();
  const L = S.ins.filter(i => (!q || (i.nome + " " + (i.cat || "")).toLowerCase().includes(q)) && (st.FL !== "repor" || lowOf(i)))
    .sort((a, b) => (lowOf(b) - lowOf(a)) || a.nome.localeCompare(b.nome));
  if (!L.length) return `<div class="empty">${st.FL === "repor" && !q ? "Nada para repor. 👍" : "Nenhum insumo encontrado."}</div>`;
  return L.map(i => { const low = lowOf(i);
    return `<div class="li${low ? " low" : ""}"><div class="n"><b>${esc(i.nome)}</b><div class="mut">${esc(i.cat) || "Sem categoria"}</div></div>
      <div class="q"><b>${est(i.id)}</b> ${UN}<span>${low ? "Repor · " : ""}mín ${i.min}</span></div>
      <div class="bt"><button class="b in" title="Entrada" data-a="entrada" data-id="${i.id}">+</button>
      <button class="b out" title="Retirada" data-a="saida" data-id="${i.id}">−</button>
      <button class="ed" title="Editar" data-a="edit" data-id="${i.id}">✎</button></div></div>`; }).join("");
}

export function listaTec() {
  if (!S.tec.length) return `<div class="empty">Nenhum técnico cadastrado.</div>`;
  return S.tec.slice().sort((a, b) => a.nome.localeCompare(b.nome)).map(t => {
    const c = S.mov.filter(m => m.tecId === t.id).length;
    return `<div class="row"><div class="ic p">👷</div><div><b>${esc(t.nome)}</b><div class="mut">${esc(t.fone) || "Sem telefone"} · ${c} retirada${c === 1 ? "" : "s"}</div></div>
      <button class="x" title="Excluir" data-a="delTec" data-id="${t.id}">×</button></div>`; }).join("");
}

export function listaEnt(st) {
  const f = st.F.toLowerCase();
  const L = S.mov.filter(m => st.TP === "todas" || m.tipo === st.TP)
    .sort((a, b) => (b.data + (b.hora || "")).localeCompare(a.data + (a.hora || ""))).filter(m => {
      const i = ins(m.insId), t = tec(m.tecId);
      if (st.DF && m.data < st.DF) return false;
      if (st.DT && m.data > st.DT) return false;
      return !f || ((i ? i.nome : "") + " " + (t ? t.nome : "") + " " + (m.obs || "") + " " + nomeDe(m.por) + " " + (m.por || "")).toLowerCase().includes(f);
    });
  const nome = st.TP === "saida" ? "retirada" : st.TP === "entrada" ? "entrada" : "registro";
  if (!L.length) return `<div class="empty">Nenhum registro encontrado.</div>`;
  return `<div class="mut" style="margin-bottom:8px">${L.length} ${nome}${L.length === 1 ? "" : "s"}</div>` + L.map(m => {
    const i = ins(m.insId), t = tec(m.tecId), e = m.tipo === "entrada";
    const quando = fd(m.data) + (m.hora ? " às " + m.hora : "") + (m.obs ? " · " + esc(m.obs) : "");
    return `<div class="row"><div class="ic ${e ? "in" : "out"}">${e ? "+" : "📤"}</div><div>
      <b>${e ? "Entrada de " : ""}${m.qtd} ${UN} de ${esc(i ? i.nome : "(removido)")}</b>
      ${e ? `<div class="mut">Registrada por: <b>${esc(nomeDe(m.por))}</b></div>`
          : `<div class="mut">Retirado por: <b>${t ? esc(t.nome) : "?"}</b></div>
             <div class="mut">Liberado por: <b>${esc(nomeDe(m.por))}</b>${m.por ? " (" + esc(m.por) + ")" : ""}</div>`}
      <div class="mut">${quando}</div></div>
      <button class="x" title="Apagar" data-a="delMov" data-id="${m.id}">×</button></div>`; }).join("");
}

export function modalView(M, msg, hoje, quem) {
  if (!M) return "";
  const i = M.id ? ins(M.id) : null;
  let h = `<div class="ov"><div class="md">`;
  if (M.k === "novo" || M.k === "edit") {
    const e = M.k === "edit";
    h += `<h3>${e ? "Editar insumo" : "Novo insumo"}</h3>
      <label>Nome</label><input id="n" placeholder="Ex.: Fita isolante" value="${e ? esc(i.nome) : ""}">
      <label>Categoria (opcional)</label><input id="c" placeholder="Ex.: Elétrica" value="${e ? esc(i.cat) : ""}">
      <label>Avisar quando chegar em (estoque mínimo)</label><input id="mn" type="number" min="0" step="any" value="${e ? i.min : ""}" placeholder="0">` +
      (e ? `<button class="lk" style="margin-top:14px" data-a="delIns" data-id="${i.id}">Excluir este insumo</button>`
         : `<label>Quantos já tem agora? (opcional)</label><input id="q0" type="number" min="0" step="any" placeholder="0">`);
  } else if (M.k === "saida" && !S.tec.length) {
    return h + `<h3>Retirada</h3><p>Antes de retirar, cadastre pelo menos um técnico.</p>
      <div class="fb" style="grid-template-columns:1fr 1fr"><button class="cx" data-a="fechar">Fechar</button><button class="ok" data-a="irTec">Cadastrar técnico</button></div></div></div>`;
  } else {
    const s = M.k === "saida";
    h += `<h3>${s ? "Retirada" : "Entrada"}: ${esc(i.nome)}</h3><div class="mut">Disponível agora: <b>${est(i.id)} ${UN}</b></div>` +
      (s ? `<div class="mut" style="margin-top:8px">Liberado por: <b>${esc(nomeDe(quem))}</b> (você, automático)</div><label>Quem está retirando?</label><select id="t"><option value="">Escolha...</option>${S.tec.map(x => `<option value="${x.id}">${esc(x.nome)}</option>`).join("")}</select>` : "") +
      `<label>Quantidade (${UN})</label><input id="q" type="number" min="0" step="any" placeholder="0">
       <label>Data</label><input id="d" type="date" value="${hoje}">
       <label>Observação (opcional)</label><input id="o" placeholder="${s ? "Ex.: obra, cliente, OS" : "Ex.: nota fiscal"}">`;
  }
  return h + `<div class="msg" id="msg">${esc(msg)}</div><div class="fb"><button class="cx" data-a="fechar">Cancelar</button><button class="ok" data-a="salvar">Salvar</button></div></div></div>`;
}
