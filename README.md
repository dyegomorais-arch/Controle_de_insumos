# Sillion · Controle de Estoque (Firebase)

Site estático (HTML + CSS + JS modules) com **Firebase Authentication** (login) e **Firestore** (dados em tempo real).

## Estrutura
```
index.html            página única
css/style.css         estilos
js/firebase-config.js configuração do projeto  <-- preencher
js/auth.js            login / logout
js/db.js              Firestore (tempo real) + helpers
js/ui.js              telas (só HTML)
js/app.js             lógica e eventos
firestore.rules       regras de segurança
assets/logo.png
```

## Configurar o Firebase
1. console.firebase.google.com → **Criar projeto**.
2. **Authentication → Método de login → E-mail/senha** (ativar). Em **Usuários**, adicione os e-mails da equipe (não há cadastro público).
3. **Firestore Database → Criar banco** (modo produção) → aba **Regras** → cole o conteúdo de `firestore.rules` → Publicar.
4. **Configurações do projeto → Seus apps → Web (</>)** → copie o `firebaseConfig` para `js/firebase-config.js`.

## Publicar no GitHub Pages
1. Crie um repositório e envie os arquivos (`git init`, `git add .`, `git commit`, `git push`).
2. Repositório → **Settings → Pages → Deploy from a branch → main / (root)**.
3. Firebase → **Authentication → Configurações → Domínios autorizados** → adicione `SEUUSUARIO.github.io`.

## Testar no PC
Módulos JS não funcionam abrindo o arquivo direto; rode `python3 -m http.server 8000` na pasta e abra http://localhost:8000.
