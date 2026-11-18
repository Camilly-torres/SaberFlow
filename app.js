const API_URL = "http://127.0.0.1:8000";

let currentUser = null;
let disciplinesData = [];
let pendingReviews = [];
let historyReviews = [];
let editingDisciplineId = null;

let flashcardsData = JSON.parse(localStorage.getItem("saberflow_flashcards") || "null") || [
  { id: 1, discipline: "Banco de Dados", question: "O que é normalização em um banco de dados?", answer: "É o processo de organizar tabelas para reduzir redundância e melhorar a integridade dos dados.", level: "Em revisão", open: false },
  { id: 2, discipline: "Python", question: "Qual é a diferença entre uma lista e uma tupla?", answer: "Listas são mutáveis e usam colchetes; tuplas são imutáveis e usam parênteses.", level: "Dominado", open: false }
];

// --- UTILITÁRIOS ---
function showToast(msg) {
  const box = document.getElementById("toast-box");
  document.getElementById("toast-msg").innerText = msg;
  box.style.display = "flex";
  setTimeout(() => { box.style.display = "none"; }, 3500);
}

function fecharToast() {
  document.getElementById("toast-box").style.display = "none";
}

function togglePass(id) {
  const inp = document.getElementById(id);
  inp.type = inp.type === "password" ? "text" : "password";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("saberflow_theme", theme);
  document.getElementById("btn-theme-light").classList.toggle("selected", theme === "light");
  document.getElementById("btn-theme-dark").classList.toggle("selected", theme === "dark");
}

function toggleCompactMode() {
  const isCompact = document.getElementById("cfg-compact").checked;
  document.body.classList.toggle("compact-mode", isCompact);
  saveSettingsPrefs();
}

function saveSettingsPrefs() {
  const prefs = {
    compact: document.getElementById("cfg-compact").checked,
    notifRev: document.getElementById("cfg-notif-rev").checked,
    notifWeek: document.getElementById("cfg-notif-week").checked,
    lang: document.getElementById("cfg-lang").value,
    weekStart: document.getElementById("cfg-week-start").value
  };
  localStorage.setItem("saberflow_prefs", JSON.stringify(prefs));
  showToast("Preferências atualizadas!");
}

function loadSettingsPrefs() {
  const prefs = JSON.parse(localStorage.getItem("saberflow_prefs") || "null");
  if (!prefs) return;
  document.getElementById("cfg-compact").checked = !!prefs.compact;
  document.body.classList.toggle("compact-mode", !!prefs.compact);
  document.getElementById("cfg-notif-rev").checked = prefs.notifRev !== false;
  document.getElementById("cfg-notif-week").checked = prefs.notifWeek !== false;
  if (prefs.lang) document.getElementById("cfg-lang").value = prefs.lang;
  if (prefs.weekStart) document.getElementById("cfg-week-start").value = prefs.weekStart;
}

// --- AUTENTICAÇÃO ---
function switchAuth(mode) {
  ["login", "register", "recover"].forEach(m => {
    document.getElementById(`auth-${m}`).style.display = m === mode ? "block" : "none";
  });
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const senha = document.getElementById("login-senha").value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });
    if (!res.ok) {
      const err = await res.json();
      return showToast(err.detail || "E-mail ou senha inválidos.");
    }
    currentUser = await res.json();
    iniciarSessao();
  } catch (err) {
    showToast("Erro ao conectar com a API FastAPI. Verifique se o uvicorn está rodando.");
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const nome = document.getElementById("reg-nome").value;
  const email = document.getElementById("reg-email").value;
  const senha = document.getElementById("reg-senha").value;

  try {
    const res = await fetch(`${API_URL}/auth/cadastro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha })
    });
    if (!res.ok) {
      const err = await res.json();
      return showToast(err.detail || "Erro ao cadastrar.");
    }
    showToast("Conta criada com sucesso! Faça seu login.");
    switchAuth("login");
  } catch (err) {
    showToast("Erro de conexão com o servidor.");
  }
}

async function handleRecover(e) {
  e.preventDefault();
  const email = document.getElementById("rec-email").value;
  const nova_senha = document.getElementById("rec-senha").value;

  try {
    const res = await fetch(`${API_URL}/auth/redefinir-senha`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, nova_senha })
    });
    if (!res.ok) return showToast("E-mail não encontrado.");
    showToast("Senha alterada com sucesso!");
    switchAuth("login");
  } catch (err) {
    showToast("Erro de conexão com o servidor.");
  }
}

function logout() {
  currentUser = null;
  document.getElementById("view-app").style.display = "none";
  document.getElementById("view-auth").style.display = "grid";
}

function iniciarSessao() {
  document.getElementById("view-auth").style.display = "none";
  document.getElementById("view-app").style.display = "grid";

  const iniciais = currentUser.nome.slice(0, 2).toUpperCase();
  document.getElementById("user-initials").innerText = iniciais;
  document.getElementById("user-name-top").innerText = currentUser.nome;
  document.getElementById("welcome-title").innerText = `Olá, ${currentUser.nome.split(" ")[0]}! Bom estudo.`;

  document.getElementById("prof-avatar").innerText = iniciais;
  document.getElementById("prof-name-card").innerText = currentUser.nome;
  document.getElementById("prof-email-card").innerText = currentUser.email || "";
  document.getElementById("prof-input-name").value = currentUser.nome;
  document.getElementById("prof-input-email").value = currentUser.email || "";
  document.getElementById("prof-input-meta").value = currentUser.meta_diaria || 3;

  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  document.getElementById("today-date-label").innerText = hoje;

  loadSettingsPrefs();
  loadAllData();
}

// --- NAVEGAÇÃO ---
function navigate(viewName) {
  document.querySelectorAll(".app-page").forEach(p => p.style.display = "none");
  document.getElementById(`page-${viewName}`).style.display = "block";

  document.querySelectorAll("#sidebar-nav button").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-view") === viewName);
  });

  if (viewName === "performance") renderPerformance();
  if (viewName === "flashcards") renderFlashcards();
}

// --- CARREGAMENTO DE DADOS ---
async function loadAllData() {
  if (!currentUser) return;
  try {
    const [resDisc, resRev] = await Promise.all([
      fetch(`${API_URL}/disciplinas/${currentUser.id}`),
      fetch(`${API_URL}/revisoes/${currentUser.id}`)
    ]);

    disciplinesData = await resDisc.json();
    const revJson = await resRev.json();
    pendingReviews = revJson.pendentes || [];
    historyReviews = revJson.historico || [];

    atualizarSelectsDisciplinas();
    renderOverview();
    renderDisciplines();
    renderReviews();
    renderHistory();
    renderPerformance();
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
  }
}

function atualizarSelectsDisciplinas() {
  const selects = ["filter-rev-disc", "fc-filter-disc", "fc-disc-select"];
  selects.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const isFilter = id !== "fc-disc-select";
    el.innerHTML = (isFilter ? `<option value="Todas">Todas</option>` : "") +
      disciplinesData.map(d => `<option value="${d.nome}">${d.nome}</option>`).join("");
  });
}

// --- RENDER: VISÃO GERAL ---
function renderOverview() {
  document.getElementById("welcome-subtitle").innerText = `Você tem ${pendingReviews.length} revisões pendentes na fila.`;
  document.getElementById("ov-pending-badge").innerText = `${pendingReviews.length} pendentes`;

  const ovList = document.getElementById("ov-pending-list");
  ovList.innerHTML = pendingReviews.slice(0, 3).map(r => `
    <button class="mini-row" onclick="navigate('reviews')">
      <span class="initial">${r.disciplina.slice(0, 2).toUpperCase()}</span>
      <span><b>${r.disciplina}</b><small>${r.topico}</small></span>
      <em>Ciclo ${r.intervalo_dias}d</em>
    </button>
  `).join("") || `<p class="text-muted small mt-3">Nenhuma revisão pendente no momento.</p>`;

  const totalCiclos = pendingReviews.length + historyReviews.length;
  const pct = totalCiclos > 0 ? Math.round((historyReviews.length / totalCiclos) * 100) : 0;

  document.getElementById("ov-percent").innerText = `${pct}%`;
  document.getElementById("ov-progress-bar").style.width = `${pct}%`;
  document.getElementById("ov-meta-display").innerText = `${currentUser.meta_diaria || 3}/dia`;
  document.getElementById("ov-done-ratio").innerText = `${historyReviews.length} / ${totalCiclos}`;

  const subjList = document.getElementById("ov-subjects-list");
  subjList.innerHTML = disciplinesData.slice(0, 4).map(d => {
    const concluidasDisc = historyReviews.filter(h => h.disciplina === d.nome).length;
    const pendentesDisc = pendingReviews.filter(p => p.disciplina === d.nome).length;
    const tot = concluidasDisc + pendentesDisc;
    const prog = tot > 0 ? Math.round((concluidasDisc / tot) * 100) : 0;

    return `
      <button class="subject-row" onclick="navigate('disciplines')">
        <span class="initial">${d.nome.slice(0, 2).toUpperCase()}</span>
        <span class="subject-name"><b>${d.nome}</b><small>${tot} ciclos programados</small></span>
        <span class="row-progress"><div class="progress-sf"><i style="width:${prog}%"></i></div></span>
        <b>${prog}%</b>
        <i class="fa-solid fa-chevron-right" style="font-size:11px;color:#94a3b8;"></i>
      </button>
    `;
  }).join("") || `<p class="text-muted small mt-2">Cadastre sua primeira disciplina para começar.</p>`;

  document.getElementById("prof-stat-discs").innerText = disciplinesData.length;
  document.getElementById("prof-stat-meta").innerText = currentUser.meta_diaria || 3;
  document.getElementById("prof-stat-done").innerText = historyReviews.length;
}

// --- RENDER: DISCIPLINAS ---
function renderDisciplines() {
  const grid = document.getElementById("disciplines-grid");
  if (!disciplinesData.length) {
    grid.innerHTML = `<div class="empty card-sf"><h4>Nenhuma disciplina cadastrada</h4><p>Clique em "+ Nova disciplina" para começar sua jornada.</p></div>`;
    return;
  }

  grid.innerHTML = disciplinesData.map(d => {
    const concluidas = historyReviews.filter(h => h.disciplina === d.nome).length;
    const pendentes = pendingReviews.filter(p => p.disciplina === d.nome).length;
    const total = concluidas + pendentes;
    const prog = total > 0 ? Math.round((concluidas / total) * 100) : 0;

    return `
      <article class="card-sf discipline-card">
        <div class="discipline-top">
          <span class="large-initial">${d.nome.slice(0, 2).toUpperCase()}</span>
          <div>
            <h2>${d.nome}</h2>
            <p>${d.topico_titulo || "Ciclos ativos"}</p>
          </div>
          <div class="icon-actions">
            <button onclick="openEditDisciplineModal(${d.id})" title="Editar disciplina"><i class="fa-solid fa-pen"></i></button>
            <button onclick="deleteDiscipline(${d.id})" title="Excluir"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
        <div class="discipline-meta">
          <span><b>${d.total_topicos || 1}</b> tópicos</span>
          <span><b>${pendentes}</b> revisões pendentes</span>
        </div>
        <div class="progress-label"><span>Progresso geral</span><b>${prog}%</b></div>
        <div class="progress-sf"><i style="width:${prog}%"></i></div>
      </article>
    `;
  }).join("");
}

function openDisciplineModal() {
  editingDisciplineId = null;
  document.getElementById("modal-disc-overline").innerText = "NOVA DISCIPLINA";
  document.getElementById("modal-disc-title").innerText = "Cadastro de estudo";
  document.getElementById("modal-disc-submit").innerText = "Salvar e agendar revisões";
  document.getElementById("modal-disc-name").value = "";
  document.getElementById("modal-topic-name").value = "";
  document.getElementById("modal-study-date").value = new Date().toISOString().split("T")[0];
  document.querySelectorAll('input[name="ciclo-opt"]').forEach(cb => cb.checked = true);
  document.getElementById("modal-discipline").style.display = "grid";
}

function openEditDisciplineModal(id) {
  const disc = disciplinesData.find(d => d.id === id);
  if (!disc) return;

  editingDisciplineId = id;
  document.getElementById("modal-disc-overline").innerText = "EDITAR DISCIPLINA";
  document.getElementById("modal-disc-title").innerText = "Atualize os dados";
  document.getElementById("modal-disc-submit").innerText = "Salvar alterações";
  document.getElementById("modal-disc-name").value = disc.nome;
  document.getElementById("modal-topic-name").value = disc.topico_titulo || "";
  document.getElementById("modal-study-date").value = disc.data_inicial || new Date().toISOString().split("T")[0];

  const ativos = disc.ciclos_ativos || [1, 7, 15, 30];
  document.querySelectorAll('input[name="ciclo-opt"]').forEach(cb => {
    cb.checked = ativos.includes(parseInt(cb.value));
  });

  document.getElementById("modal-discipline").style.display = "grid";
}

function closeDisciplineModal() {
  document.getElementById("modal-discipline").style.display = "none";
}

async function saveDiscipline(e) {
  e.preventDefault();
  const nome = document.getElementById("modal-disc-name").value;
  const topico_titulo = document.getElementById("modal-topic-name").value;
  const data_inicial = document.getElementById("modal-study-date").value;
  const ciclos = Array.from(document.querySelectorAll('input[name="ciclo-opt"]:checked')).map(cb => parseInt(cb.value));

  if (!ciclos.length) {
    return showToast("Selecione pelo menos um ciclo de revisão.");
  }

  try {
    if (editingDisciplineId) {
      await fetch(`${API_URL}/disciplinas/${editingDisciplineId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, topico_titulo, data_inicial, ciclos })
      });
      showToast("Disciplina atualizada com sucesso!");
    } else {
      await fetch(`${API_URL}/disciplinas/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, usuario_id: currentUser.id, topico_titulo, data_inicial, ciclos })
      });
      showToast(`${nome} cadastrada com ciclos automáticos!`);
    }

    closeDisciplineModal();
    loadAllData();
  } catch (err) {
    showToast("Erro ao salvar disciplina.");
  }
}

async function deleteDiscipline(id) {
  if (!confirm("Deseja realmente excluir esta disciplina e seus ciclos?")) return;
  await fetch(`${API_URL}/disciplinas/${id}`, { method: "DELETE" });
  showToast("Disciplina removida.");
  loadAllData();
}

// --- RENDER: REVISÕES ---
function renderReviews() {
  const fDisc = document.getElementById("filter-rev-disc").value;
  const fStat = document.getElementById("filter-rev-status").value;

  const filtradas = pendingReviews.filter(r => {
    const matchD = fDisc === "Todas" || r.disciplina === fDisc;
    const matchS = fStat === "Todos" || r.status === fStat;
    return matchD && matchS;
  });

  const list = document.getElementById("reviews-list");
  if (!filtradas.length) {
    list.innerHTML = `<div class="empty card-sf"><h4>Tudo em dia!</h4><p>Nenhuma revisão encontrada para os filtros selecionados.</p></div>`;
    return;
  }

  list.innerHTML = filtradas.map(r => {
    const isLate = r.status === "Atrasado";
    const isToday = r.status === "Hoje";
    const badgeClass = isLate ? "atrasado" : (isToday ? "hoje" : "pendente");

    return `
      <article class="card-sf review-item ${badgeClass}">
        <div class="status-rail"></div>
        <span class="status-tag ${badgeClass}">${r.status}</span>
        <div class="review-info">
          <small>${r.disciplina}</small>
          <h2>${r.topico}</h2>
          <p>Ciclo de ${r.intervalo_dias} dias · Prevista para ${r.data_prevista}</p>
        </div>
        <div class="review-actions">
          <button class="btn-sf outline" onclick="adiarRevisao(${r.ciclo_id})">
            Adiar 7 dias
          </button>
          <button class="btn-sf primary" onclick="concluirRevisao(${r.ciclo_id})">
            <i class="fa-solid fa-check"></i> Concluir revisão
          </button>
        </div>
      </article>
    `;
  }).join("");
}

async function concluirRevisao(cicloId) {
  await fetch(`${API_URL}/revisoes/concluir/${cicloId}`, { method: "PUT" });
  showToast("Revisão concluída e enviada ao histórico!");
  loadAllData();
}

async function adiarRevisao(cicloId) {
  await fetch(`${API_URL}/revisoes/adiar/${cicloId}`, { method: "PUT" });
  showToast("Revisão adiada em 7 dias.");
  loadAllData();
}

// --- RENDER: HISTÓRICO ---
function renderHistory() {
  const q = (document.getElementById("history-search")?.value || "").toLowerCase();
  const filtrados = historyReviews.filter(h =>
    `${h.disciplina} ${h.topico}`.toLowerCase().includes(q)
  );

  document.getElementById("history-tbody").innerHTML = filtrados.map(h => `
    <tr>
      <td>${h.data_realizada}</td>
      <td><b>${h.disciplina}</b></td>
      <td>${h.topico}</td>
      <td>${h.intervalo_dias} dias</td>
      <td><span class="table-status ok">Concluído</span></td>
    </tr>
  `).join("") || `<tr><td colspan="5" class="text-center text-muted py-4">Nenhum estudo concluído registrado ainda.</td></tr>`;
}

// --- RENDER: FLASHCARDS ---
function saveFlashcardsLocal() {
  localStorage.setItem("saberflow_flashcards", JSON.stringify(flashcardsData));
}

function addFlashcard(e) {
  e.preventDefault();
  const disc = document.getElementById("fc-disc-select").value || "Geral";
  const question = document.getElementById("fc-question").value;
  const answer = document.getElementById("fc-answer").value;

  flashcardsData.unshift({ id: Date.now(), discipline: disc, question, answer, level: "Novo", open: false });
  saveFlashcardsLocal();
  document.getElementById("fc-question").value = "";
  document.getElementById("fc-answer").value = "";
  showToast("Flashcard criado com sucesso!");
  renderFlashcards();
}

function toggleFlashcard(id) {
  flashcardsData = flashcardsData.map(c => c.id === id ? { ...c, open: !c.open } : c);
  renderFlashcards();
}

function masterFlashcard(id) {
  flashcardsData = flashcardsData.map(c => c.id === id ? { ...c, level: "Dominado" } : c);
  saveFlashcardsLocal();
  showToast("Cartão marcado como dominado!");
  renderFlashcards();
}

function removeFlashcard(id) {
  flashcardsData = flashcardsData.filter(c => c.id !== id);
  saveFlashcardsLocal();
  showToast("Flashcard excluído.");
  renderFlashcards();
}

function renderFlashcards() {
  const fDisc = document.getElementById("fc-filter-disc").value;
  const fLev = document.getElementById("fc-filter-level").value;

  const visiveis = flashcardsData.filter(c =>
    (fDisc === "Todas" || c.discipline === fDisc) &&
    (fLev === "Todos" || c.level === fLev)
  );

  document.getElementById("fc-count").innerText = `${visiveis.length} cartões disponíveis`;
  const grid = document.getElementById("flashcards-grid");

  if (!visiveis.length) {
    grid.innerHTML = `<div class="empty card-sf"><p>Nenhum flashcard encontrado.</p></div>`;
    return;
  }

  grid.innerHTML = visiveis.map(c => `
    <article class="card-sf study-card">
      <div class="study-card-top">
        <span>${c.discipline}</span>
        <em class="${c.level === "Dominado" ? "level-dominado" : ""}">${c.level}</em>
      </div>
      <div class="study-card-content">
        <small>${c.open ? "Resposta" : "Pergunta"}</small>
        <h2>${c.open ? c.answer : c.question}</h2>
      </div>
      <button class="flip-button" type="button" onclick="toggleFlashcard(${c.id})">
        <i class="fa-solid fa-rotate"></i> ${c.open ? "Ocultar resposta" : "Mostrar resposta"}
      </button>
      <div class="study-card-actions">
        <button type="button" onclick="masterFlashcard(${c.id})"><i class="fa-solid fa-check"></i> Dominado</button>
        <button type="button" onclick="removeFlashcard(${c.id})"><i class="fa-solid fa-trash"></i></button>
      </div>
    </article>
  `).join("");
}

// --- RENDER: DESEMPENHO ---
function renderPerformance() {
  const done = historyReviews.length;
  const pend = pendingReviews.filter(r => r.status !== "Atrasado").length;
  const late = pendingReviews.filter(r => r.status === "Atrasado").length;
  const total = done + pend + late;
  const rate = total > 0 ? Math.round((done / total) * 100) : 0;

  document.getElementById("perf-discs").innerText = disciplinesData.length;
  document.getElementById("perf-rate").innerText = `${rate}%`;
  document.getElementById("perf-meta").innerText = currentUser?.meta_diaria || 3;
  document.getElementById("perf-done").innerText = done;

  const barChart = document.getElementById("perf-bar-chart");
  barChart.innerHTML = disciplinesData.map(d => {
    const dDone = historyReviews.filter(h => h.disciplina === d.nome).length;
    const dTot = dDone + pendingReviews.filter(p => p.disciplina === d.nome).length;
    const score = dTot > 0 ? Math.round((dDone / dTot) * 100) : 15;
    return `
      <div class="bar-column">
        <span>${score}%</span>
        <div><i style="height:${score}%"></i></div>
        <small>${d.nome.split(" ")[0]}</small>
      </div>
    `;
  }).join("") || `<p class="text-muted small">Cadastre disciplinas para visualizar o gráfico.</p>`;

  const pDone = total > 0 ? (done / total) * 100 : 0;
  const pPend = total > 0 ? (pend / total) * 100 : 0;
  document.getElementById("perf-donut").style.background =
    total > 0
      ? `conic-gradient(#2563eb 0 ${pDone}%, #8b5cf6 ${pDone}% ${pDone + pPend}%, #ef4444 ${pDone + pPend}% 100%)`
      : `#e2e8f0`;
  document.getElementById("perf-donut-val").innerText = `${rate}%`;
  document.getElementById("leg-done").innerText = done;
  document.getElementById("leg-pend").innerText = pend;
  document.getElementById("leg-late").innerText = late;
}

// --- PERFIL & SENHA ---
async function saveProfile(e) {
  e.preventDefault();
  const novaMeta = parseInt(document.getElementById("prof-input-meta").value) || 3;
  await fetch(`${API_URL}/usuarios/${currentUser.id}/meta`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ meta_diaria: novaMeta })
  });
  currentUser.meta_diaria = novaMeta;
  showToast("Perfil e meta diária atualizados!");
  renderOverview();
}

function openPasswordModal() {
  document.getElementById("modal-new-pass").value = "";
  document.getElementById("modal-password").style.display = "grid";
}

function closePasswordModal() {
  document.getElementById("modal-password").style.display = "none";
}

async function submitChangePassword(e) {
  e.preventDefault();
  const nova_senha = document.getElementById("modal-new-pass").value;
  try {
    const res = await fetch(`${API_URL}/auth/redefinir-senha`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: currentUser.email, nova_senha })
    });
    if (!res.ok) return showToast("Não foi possível alterar a senha.");
    closePasswordModal();
    showToast("Senha alterada com sucesso!");
  } catch {
    showToast("Erro ao conectar com o servidor.");
  }
}

function exportDataJSON() {
  const payload = { usuario: currentUser, disciplinas: disciplinesData, pendentes: pendingReviews, historico: historyReviews, flashcards: flashcardsData };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "saberflow-backup.json";
  a.click();
}

function filtrarGlobal() {
  const termo = document.getElementById("global-search-input").value.toLowerCase();
  if (!termo) return;
  navigate("disciplines");
}

const savedTheme = localStorage.getItem("saberflow_theme");
if (savedTheme === "dark") setTheme("dark");