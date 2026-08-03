const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzf1TjxIBrBNJ6fTY5NNciAlWCl0PFKYgCpRXcdRg2S9aYKjMqDxeVCgC1JlcZet8iLNA/exec";
const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1KCzz2B59PN3IvcyM2_G2uvTi8nA759oV7rUsaXvrcSY/edit?gid=0#gid=0";
const TOKEN_KEY = "pron_session_token";
const LOCAL_DB_KEY = "pron_local_database_v1";
const LOCAL_TOKEN_PREFIX = "local-";
const SUPERADMIN_EMAIL_SHA256 =
  "88e0ce076c34f4b41124bf348680fcaf025f8bda0e1e13ad7339be6d6f359cec";
const PASSWORD_SALT = "pron-apps-script-password-v1";
const SUPERADMIN_PASSWORD_SHA256 =
  "105682a7333783a9e62bee3a503321582a8df6b9ca899512c1f8f53c3b59803f";
const JSONP_TIMEOUT_MS = 60000;
const SUMMARY_ALL = "__all__";
const PIE_COLORS = ["#0f766e", "#315f9f", "#f2b84b", "#d95f43", "#5b7f67", "#7c5c9e"];
const MOVEMENT_CATEGORIES = {
  Gasto: [
    "Operacion",
    "Activos",
    "Personal",
    "Marketing",
    "Arriendo",
    "Servicios",
    "Transporte",
    "Mantenimiento",
    "Impuestos",
    "Tecnologia",
    "Contingencia",
  ],
  Ingreso: [
    "Ventas",
    "Patrocinio",
    "Reserva",
    "Contrato",
    "Servicio",
    "Comision",
    "Recuperacion",
    "Otro ingreso",
  ],
  Inversion: [
    "Aporte inicial",
    "Capital de socios",
    "Credito",
    "Equipamiento",
    "Adecuaciones",
    "Expansion",
    "Fondo operativo",
  ],
};
const INVENTORY_CATEGORIES = [
  "Activo fijo",
  "Inventario",
  "Mobiliario",
  "Tecnologia",
  "Cocina",
  "Herramientas",
  "Insumos",
  "Mercaderia",
  "Lenceria",
  "Produccion",
];

const fallbackData = {
  settings: {
    language: "es",
    country: "Ecuador",
    currency: "USD",
    timezone: "America/Guayaquil",
    moneyFormat: "$1.250,00",
    dateFormat: "DD/MM/AAAA",
  },
  projects: [
    {
      id: "hotel-manta",
      name: "Hotel Boutique Manta",
      type: "Negocio",
      country: "Ecuador",
      currency: "USD",
      timezone: "America/Guayaquil",
      status: "Activo",
      budget: 185000,
      objective: "Apertura controlada con seguimiento financiero semanal.",
      createdAt: "2026-08-01",
      updatedAt: "2026-08-03",
    },
    {
      id: "evento-quito",
      name: "Festival Corporativo Quito",
      type: "Evento",
      country: "Ecuador",
      currency: "USD",
      timezone: "America/Guayaquil",
      status: "En revision",
      budget: 64000,
      objective: "Planificar proveedores, ingresos por patrocinio y accesos.",
      createdAt: "2026-08-01",
      updatedAt: "2026-08-03",
    },
    {
      id: "local-guayaquil",
      name: "Restaurante ProN Guayaquil",
      type: "Apertura de local",
      country: "Ecuador",
      currency: "USD",
      timezone: "America/Guayaquil",
      status: "Activo",
      budget: 98000,
      objective: "Medir punto de equilibrio, inventario critico y personal.",
      createdAt: "2026-08-01",
      updatedAt: "2026-08-03",
    },
  ],
  movements: [
    {
      id: "mov-001",
      projectId: "hotel-manta",
      type: "Inversion",
      category: "Aporte inicial",
      concept: "Capital de socios para adecuaciones",
      amount: 52000,
      movementDate: "2026-08-01",
      status: "Aprobado",
      createdAt: "2026-08-01",
    },
    {
      id: "mov-002",
      projectId: "hotel-manta",
      type: "Gasto",
      category: "Activos",
      concept: "Equipamiento de habitaciones",
      amount: 18750,
      movementDate: "2026-08-02",
      status: "Registrado",
      createdAt: "2026-08-02",
    },
    {
      id: "mov-003",
      projectId: "evento-quito",
      type: "Ingreso",
      category: "Patrocinio",
      concept: "Primer acuerdo de patrocinio",
      amount: 24000,
      movementDate: "2026-08-02",
      status: "Aprobado",
      createdAt: "2026-08-02",
    },
    {
      id: "mov-004",
      projectId: "local-guayaquil",
      type: "Gasto",
      category: "Personal",
      concept: "Reserva nomina operativa",
      amount: 9200,
      movementDate: "2026-08-03",
      status: "Registrado",
      createdAt: "2026-08-03",
    },
  ],
  partners: [
    {
      id: "soc-001",
      projectId: "hotel-manta",
      name: "Socio fundador A",
      type: "Socio",
      contribution: 32000,
      participation: 42,
      status: "Activo",
    },
    {
      id: "soc-002",
      projectId: "local-guayaquil",
      name: "Inversionista operativo",
      type: "Inversionista",
      contribution: 18000,
      participation: 24,
      status: "Activo",
    },
  ],
  inventory: [
    {
      id: "inv-001",
      projectId: "local-guayaquil",
      item: "Mesas de servicio",
      category: "Activo fijo",
      quantity: 24,
      unitCost: 135,
      status: "Disponible",
    },
    {
      id: "inv-002",
      projectId: "hotel-manta",
      item: "Kit lenceria habitacion",
      category: "Inventario",
      quantity: 80,
      unitCost: 26,
      status: "Controlado",
    },
  ],
  users: [
    {
      id: "usr-owner",
      name: "Administrador General",
      role: "Superadministrador",
      status: "Activo",
      projectId: null,
      createdAt: "2026-08-03",
    },
    {
      id: "usr-guest",
      name: "Usuario Invitado",
      role: "Invitado",
      status: "Activo",
      projectId: null,
      createdAt: "2026-08-03",
    },
  ],
  audit: [
    {
      id: "aud-001",
      action: "Sistema inicializado",
      detail: "ProN preparo usuarios iniciales, proyectos base y catalogos.",
      actorRole: "Superadministrador",
      projectId: null,
      createdAt: "2026-08-03",
    },
  ],
};

const state = {
  token: sessionStorage.getItem(TOKEN_KEY) || "",
  user: null,
  data: loadLocalData(),
  activeTab: "resumen",
  selectedProjectId: fallbackData.projects[0].id,
  summaryScopeId: SUMMARY_ALL,
  search: "",
  busy: false,
  backend: "checking",
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function loadLocalData() {
  try {
    const stored = localStorage.getItem(LOCAL_DB_KEY);
    return stored ? normalizeData(JSON.parse(stored)) : cloneData(fallbackData);
  } catch {
    return cloneData(fallbackData);
  }
}

function saveLocalData() {
  localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(state.data));
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function money(value) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function numberValue(value) {
  const parsed = Number(String(value || "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function projectName(projectId) {
  if (!projectId) {
    return "Global";
  }

  return (
    state.data.projects.find((project) => project.id === projectId)?.name ||
    "Proyecto"
  );
}

function summaryProjectId() {
  return state.summaryScopeId === SUMMARY_ALL ? "" : state.summaryScopeId;
}

function inSummaryScope(projectId) {
  const scopedId = summaryProjectId();
  return !scopedId || projectId === scopedId;
}

function scopedProjects() {
  const scopedId = summaryProjectId();
  return scopedId
    ? state.data.projects.filter((project) => project.id === scopedId)
    : state.data.projects;
}

function scopedMovements() {
  return state.data.movements.filter((movement) => inSummaryScope(movement.projectId));
}

function scopedPartners() {
  return state.data.partners.filter((partner) => inSummaryScope(partner.projectId));
}

function scopedInventory() {
  return state.data.inventory.filter((item) => inSummaryScope(item.projectId));
}

function currentScopeLabel() {
  return summaryProjectId() ? projectName(summaryProjectId()) : "Todo ProN";
}

function setMessage(message, tone = "info") {
  const notice = $("#notice");
  if (!notice) {
    return;
  }
  notice.textContent = message;
  notice.className = `notice show ${
    tone === "error" ? "error" : tone === "warning" ? "warning" : ""
  }`;
}

function setLoginMessage(message) {
  $("#loginMessage").textContent = message;
}

function setTextIfExists(selector, value) {
  const node = document.querySelector(selector);
  if (node) {
    node.textContent = value;
  }
}

function updateConnection(label, tone = "checking") {
  const badge = document.querySelector("#connectionBadge");
  if (badge) {
    badge.textContent = label;
    badge.className = `connection-badge ${tone}`;
  }

  const pill = document.querySelector("#syncPill");
  if (pill) {
    pill.textContent = tone === "ok" ? "Sheets activo" : label;
    pill.className = `pill ${tone === "error" || tone === "local" ? "warning" : ""}`;
  }
}

function setBusy(isBusy) {
  state.busy = isBusy;
  $$("button").forEach((button) => {
    if (!["logoutButton", "topLogoutButton"].includes(button.id)) {
      button.disabled = isBusy;
    }
  });
}

async function callBackend(action, payload = {}, auth = true) {
  const body = {
    action,
    ...payload,
    token: auth ? state.token : payload.token,
  };

  let result;
  try {
    result = await jsonpRequest(body);
  } catch (error) {
    if (["health", "login", "get-data"].includes(action)) {
      await delay(1200);
      result = await jsonpRequest(body);
    } else {
      throw error;
    }
  }

  if (result.ok === false) {
    throw new Error(result.error || "No se pudo completar la operacion.");
  }

  return result;
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function jsonpRequest(payload) {
  return new Promise((resolve, reject) => {
    const callbackName = `pronCallback_${Date.now()}_${Math.round(
      Math.random() * 100000,
    )}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Apps Script no respondio a tiempo. Reintenta la sincronizacion."));
    }, JSONP_TIMEOUT_MS);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (result) => {
      cleanup();
      resolve(result);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Apps Script no respondio. Revisa la publicacion del Web App."));
    };

    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.set("callback", callbackName);
    url.searchParams.set("payload", JSON.stringify(payload));
    script.src = url.toString();
    document.head.append(script);
  });
}

async function checkBackend() {
  try {
    const result = await callBackend("health", {}, false);
    state.backend = result.ok ? "ready" : "pending";
    setTextIfExists(
      "#backendStatus",
      result.ok
        ? "Apps Script listo: Google Sheets activo"
        : "Apps Script pendiente de publicacion",
    );
    updateConnection(
      result.ok ? "Google Sheets activo" : "Apps Script pendiente",
      result.ok ? "ok" : "local",
    );
  } catch {
    state.backend = "retry";
    setTextIfExists("#backendStatus", "Google Sheets tarda en responder; reintenta si hace falta");
    updateConnection("Reintentar Sheets", "local");
  }
}

function showDashboard() {
  $("#loginScreen").classList.add("is-hidden");
  $("#dashboard").classList.remove("is-hidden");
  $("#sessionName").textContent = state.user?.name || "Administrador General";
  $("#sessionRole").textContent = state.user?.role || "Superadministrador";
  updateConnection(
    isLocalSession() ? "Requiere reconexion" : "Google Sheets activo",
    isLocalSession() ? "local" : "ok",
  );
  render();
}

function showLogin(message = "") {
  $("#dashboard").classList.add("is-hidden");
  $("#loginScreen").classList.remove("is-hidden");
  if (message) {
    setLoginMessage(message);
  }
}

async function login(event) {
  event.preventDefault();
  setLoginMessage("");
  setBusy(true);
  const emailHash = await sha256Hex($("#emailInput").value.trim().toLowerCase());
  const passwordHash = await sha256Hex(`${$("#passwordInput").value}:${PASSWORD_SALT}`);
  const remember = $("#rememberInput").checked;

  if (
    emailHash !== SUPERADMIN_EMAIL_SHA256 ||
    passwordHash !== SUPERADMIN_PASSWORD_SHA256
  ) {
    setLoginMessage("Credenciales invalidas.");
    setBusy(false);
    return;
  }

  try {
    setLoginMessage("Conectando ProN con Google Sheets...");
    updateConnection("Conectando Sheets", "checking");
    const result = await callBackend(
      "login",
      {
        emailHash,
        passwordHash,
        remember,
      },
      false,
    );
    state.token = result.token;
    state.user = result.user;
    sessionStorage.setItem(TOKEN_KEY, result.token);
    setLoginMessage("Acceso validado. Cargando base de Google Sheets...");
    const dataResult = await callBackend("get-data");
    state.user = dataResult.user || result.user;
    state.data = normalizeData(dataResult.data);
    state.selectedProjectId = state.data.projects[0]?.id || "";
    state.backend = "ready";
    $("#loginForm").reset();
    $("#rememberInput").checked = true;
    showDashboard();
    setMessage("Google Sheets activo. Datos sincronizados desde la base de datos.");
    updateConnection("Google Sheets activo", "ok");
  } catch (error) {
    state.token = "";
    state.user = null;
    sessionStorage.removeItem(TOKEN_KEY);
    setLoginMessage(
      `${error.message} No se abrio sesion sin Google Sheets; vuelve a intentar.`,
    );
    updateConnection("Reintentar Sheets", "error");
  } finally {
    setBusy(false);
  }
}

async function refreshData() {
  if (isLocalSession()) {
    logout("Sesion anterior limpiada. Entra de nuevo para conectar Google Sheets.");
    return;
  }

  setBusy(true);
  setMessage("Sincronizando con Google Sheets...");
  updateConnection("Sincronizando Sheets", "checking");

  try {
    const result = await callBackend("get-data");
    state.data = normalizeData(result.data);
    state.backend = "ready";
    setMessage("Datos actualizados desde Google Sheets.");
    updateConnection("Google Sheets activo", "ok");
    render();
  } catch (error) {
    if (/sesion/i.test(error.message)) {
      logout("Sesion expirada. Entra de nuevo para sincronizar Google Sheets.");
      return;
    }
    setMessage(
      "Google Sheets no respondio en este intento. Se mantienen los datos cargados; pulsa Sincronizar Sheets otra vez.",
      "warning",
    );
    updateConnection("Reintentar Sheets", "local");
  } finally {
    setBusy(false);
  }
}

async function resumeSession() {
  if (!state.token) {
    showLogin();
    return;
  }

  if (isLocalSession()) {
    sessionStorage.removeItem(TOKEN_KEY);
    state.token = "";
    state.user = null;
    showLogin("Sesion anterior limpiada. Entra para conectar ProN con Google Sheets.");
    checkBackend();
    return;
  }

  try {
    const result = await callBackend("get-data");
    state.user = result.user || {
      name: "Administrador General",
      role: "Superadministrador",
      access: "Completo",
    };
    state.data = normalizeData(result.data);
    state.backend = "ready";
    showDashboard();
    setMessage("Google Sheets activo. Sesion restaurada.");
    updateConnection("Google Sheets activo", "ok");
  } catch {
    sessionStorage.removeItem(TOKEN_KEY);
    state.token = "";
    showLogin("Inicia sesion para conectar ProN con Google Sheets.");
    updateConnection("Reintentar Sheets", "local");
  }
}

async function submitAction(action, payload, successMessage) {
  if (isLocalSession()) {
    logout("Sesion anterior limpiada. Entra de nuevo para guardar en Google Sheets.");
    return;
  }

  setBusy(true);

  try {
    const result = await callBackend(action, payload);
    state.data = normalizeData(result.data);
    state.backend = "ready";
    if (!state.data.projects.some((project) => project.id === state.selectedProjectId)) {
      state.selectedProjectId = state.data.projects[0]?.id || "";
    }
    setMessage(successMessage);
    updateConnection("Google Sheets activo", "ok");
    render();
  } catch (error) {
    if (/sesion/i.test(error.message)) {
      logout("Sesion expirada. Entra de nuevo para guardar en Google Sheets.");
      return;
    }
    setMessage(error.message, "warning");
    updateConnection("Reintentar Sheets", "local");
  } finally {
    setBusy(false);
  }
}

function isLocalSession() {
  return state.token.startsWith(LOCAL_TOKEN_PREFIX);
}

function localId(prefix) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function addAudit(action, detail, projectId = null) {
  state.data.audit = [
    {
      id: localId("aud"),
      action,
      detail,
      actorRole: "Superadministrador",
      projectId,
      createdAt: today(),
    },
    ...state.data.audit,
  ];
}

function applyLocalAction(action, payload) {
  state.data = cloneData(state.data);

  if (action === "create-project") {
    const id = localId("pro");
    state.data.projects = [
      {
        id,
        name: payload.name,
        type: payload.type || "Proyecto personalizado",
        country: payload.country || "Ecuador",
        currency: payload.currency || "USD",
        timezone: payload.timezone || "America/Guayaquil",
        status: "Activo",
        budget: numberValue(payload.budget),
        objective: payload.objective || "Proyecto creado desde ProN.",
        createdAt: today(),
        updatedAt: today(),
      },
      ...state.data.projects,
    ];
    state.selectedProjectId = id;
    addAudit("Proyecto creado", `${payload.name} quedo activo.`, id);
    return;
  }

  if (action === "create-movement") {
    state.data.movements = [
      {
        id: localId("mov"),
        projectId: payload.projectId,
        type: payload.type || "Gasto",
        category: payload.category || "Operacion",
        concept: payload.concept,
        amount: numberValue(payload.amount),
        movementDate: payload.movementDate || today(),
        status: "Registrado",
        createdAt: today(),
      },
      ...state.data.movements,
    ];
    addAudit(
      "Movimiento registrado",
      `${payload.type || "Gasto"}: ${payload.concept}.`,
      payload.projectId,
    );
    return;
  }

  if (action === "create-partner") {
    state.data.partners = [
      {
        id: localId("soc"),
        projectId: payload.projectId,
        name: payload.name,
        type: payload.type || "Socio",
        contribution: numberValue(payload.contribution),
        participation: numberValue(payload.participation),
        status: "Activo",
      },
      ...state.data.partners,
    ];
    addAudit("Socio agregado", `${payload.name} fue vinculado al proyecto.`, payload.projectId);
    return;
  }

  if (action === "create-inventory") {
    state.data.inventory = [
      {
        id: localId("inv"),
        projectId: payload.projectId,
        item: payload.item,
        category: payload.category || "Inventario",
        quantity: numberValue(payload.quantity),
        unitCost: numberValue(payload.unitCost),
        status: "Disponible",
      },
      ...state.data.inventory,
    ];
    addAudit("Inventario agregado", `${payload.item} quedo registrado.`, payload.projectId);
    return;
  }

  if (action === "create-user") {
    state.data.users = [
      {
        id: localId("usr"),
        name: payload.name,
        role: payload.role || "Invitado",
        status: "Invitado",
        projectId: payload.projectId || null,
        createdAt: today(),
      },
      ...state.data.users,
    ];
    addAudit("Usuario invitado", `${payload.name} fue agregado como ${payload.role}.`);
    return;
  }

  if (action === "update-project-status") {
    state.data.projects = state.data.projects.map((project) =>
      project.id === payload.projectId
        ? { ...project, status: payload.status, updatedAt: today() }
        : project,
    );
    addAudit("Estado actualizado", `Estado cambiado a ${payload.status}.`, payload.projectId);
  }
}

function normalizeData(data) {
  const next = data || fallbackData;
  return {
    settings: { ...fallbackData.settings, ...(next.settings || {}) },
    projects: Array.isArray(next.projects) ? next.projects : [],
    movements: Array.isArray(next.movements) ? next.movements : [],
    partners: Array.isArray(next.partners) ? next.partners : [],
    inventory: Array.isArray(next.inventory) ? next.inventory : [],
    users: Array.isArray(next.users) ? next.users : [],
    audit: Array.isArray(next.audit) ? next.audit : [],
  };
}

function filteredProjects() {
  const search = state.search.toLowerCase();
  return scopedProjects().filter((project) =>
    `${project.name} ${project.type} ${project.status}`.toLowerCase().includes(search),
  );
}

function filteredMovements() {
  const search = state.search.toLowerCase();
  return scopedMovements().filter((movement) =>
    `${projectName(movement.projectId)} ${movement.type} ${movement.category} ${movement.concept}`
      .toLowerCase()
      .includes(search),
  );
}

function totals(projectId = summaryProjectId()) {
  const movements = projectId
    ? state.data.movements.filter((movement) => movement.projectId === projectId)
    : state.data.movements;
  const projects = projectId
    ? state.data.projects.filter((project) => project.id === projectId)
    : state.data.projects;
  const income = movements
    .filter((movement) => movement.type === "Ingreso")
    .reduce((sum, movement) => sum + numberValue(movement.amount), 0);
  const expenses = movements
    .filter((movement) => movement.type === "Gasto")
    .reduce((sum, movement) => sum + numberValue(movement.amount), 0);
  const investment = movements
    .filter((movement) => movement.type === "Inversion")
    .reduce((sum, movement) => sum + numberValue(movement.amount), 0);
  const budget = projects.reduce(
    (sum, project) => sum + numberValue(project.budget),
    0,
  );

  return {
    income,
    expenses,
    investment,
    budget,
    balance: income + investment - expenses,
  };
}

function selectedTotals(projectId) {
  const rows = state.data.movements.filter((movement) => movement.projectId === projectId);
  const income = rows
    .filter((movement) => movement.type === "Ingreso")
    .reduce((sum, movement) => sum + numberValue(movement.amount), 0);
  const investment = rows
    .filter((movement) => movement.type === "Inversion")
    .reduce((sum, movement) => sum + numberValue(movement.amount), 0);
  const project = state.data.projects.find((item) => item.id === projectId);
  const budget = numberValue(project?.budget);

  return budget ? Math.min(100, Math.round(((income + investment) / budget) * 100)) : 0;
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);

  Object.entries(attrs).forEach(([key, value]) => {
    if (key === "class") {
      node.className = value;
    } else if (key === "text") {
      node.textContent = value;
    } else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) {
      node.setAttribute(key, "");
    } else if (value === false || value === null || value === undefined) {
      return;
    } else {
      node.setAttribute(key, value);
    }
  });

  children.forEach((child) => {
    node.append(child);
  });
  return node;
}

function replaceChildren(selector, children) {
  const node = $(selector);
  node.replaceChildren(...children);
}

function render() {
  renderMetrics();
  renderProjectSelects();
  renderCategorySelects();
  renderSummary();
  renderProjects();
  renderMovements();
  renderPartners();
  renderInventory();
  renderUsers();
  renderReports();
  renderSettings();
}

function renderMetrics() {
  const current = totals();
  const projects = scopedProjects();
  const inventory = scopedInventory();
  const activeProjects = projects.filter(
    (project) => project.status !== "Archivado",
  ).length;
  const inventoryValue = inventory.reduce(
    (sum, item) =>
      sum + numberValue(item.quantity) * numberValue(item.unitCost),
    0,
  );

  $("#metricBudget").textContent = money(current.budget);
  $("#metricIncome").textContent = money(current.income);
  $("#metricInvestment").textContent = money(current.investment);
  $("#metricExpenses").textContent = money(current.expenses);
  $("#balanceBadge").textContent = `${currentScopeLabel()} ${money(current.balance)}`;
  setTextIfExists("#metricActiveProjects", String(activeProjects));
  setTextIfExists("#metricPartners", String(scopedPartners().length));
  setTextIfExists("#metricInventoryValue", money(inventoryValue));
  setTextIfExists("#metricAudit", String(state.data.audit.length));
}

function renderProjectSelects() {
  const options = state.data.projects.map((project) =>
    el("option", { value: project.id, text: project.name }),
  );
  const projectSelect = $("#projectSelect");
  projectSelect.replaceChildren(...options);
  if (!state.data.projects.some((project) => project.id === state.selectedProjectId)) {
    state.selectedProjectId = state.data.projects[0]?.id || "";
  }
  projectSelect.value = state.selectedProjectId;

  const scopeOptions = [
    el("option", { value: SUMMARY_ALL, text: "Todo ProN" }),
    ...options.map((option) => option.cloneNode(true)),
  ];
  const scopeSelect = $("#summaryScopeSelect");
  scopeSelect.replaceChildren(...scopeOptions);
  if (
    state.summaryScopeId !== SUMMARY_ALL &&
    !state.data.projects.some((project) => project.id === state.summaryScopeId)
  ) {
    state.summaryScopeId = SUMMARY_ALL;
  }
  scopeSelect.value = state.summaryScopeId;

  const userProjectInput = $("#userProjectInput");
  userProjectInput.replaceChildren(
    el("option", { value: "", text: "Todos los proyectos" }),
    ...options.map((option) => option.cloneNode(true)),
  );
  userProjectInput.value = state.selectedProjectId;
}

function renderCategorySelects() {
  const movementForm = $("#movementForm");
  const movementType = movementForm.elements.type.value || "Gasto";
  const movementCategory = movementForm.elements.category;
  const currentMovementCategory = movementCategory.value;
  movementCategory.replaceChildren(
    ...MOVEMENT_CATEGORIES[movementType].map((category) =>
      el("option", { value: category, text: category }),
    ),
  );
  movementCategory.value = MOVEMENT_CATEGORIES[movementType].includes(currentMovementCategory)
    ? currentMovementCategory
    : MOVEMENT_CATEGORIES[movementType][0];

  const inventoryCategory = $("#inventoryForm").elements.category;
  const currentInventoryCategory = inventoryCategory.value;
  inventoryCategory.replaceChildren(
    ...INVENTORY_CATEGORIES.map((category) =>
      el("option", { value: category, text: category }),
    ),
  );
  inventoryCategory.value = INVENTORY_CATEGORIES.includes(currentInventoryCategory)
    ? currentInventoryCategory
    : INVENTORY_CATEGORIES[0];
}

function renderPie(selector, items) {
  const total = items.reduce((sum, item) => sum + Math.max(0, item.value), 0);
  let start = 0;
  const gradient = total
    ? items
        .map((item) => {
          const end = start + (Math.max(0, item.value) / total) * 100;
          const segment = `${item.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
          start = end;
          return segment;
        })
        .join(", ")
    : "#e8eeeb 0 100%";
  $(selector).style.background = `conic-gradient(${gradient})`;
}

function renderLegend(selector, items) {
  replaceChildren(
    selector,
    items.map((item) =>
      el("div", {}, [
        el("i", { style: `background: ${item.color}` }),
        el("span", { text: item.label }),
        el("strong", { text: money(item.value) }),
      ]),
    ),
  );
}

function renderSummary() {
  const current = totals();
  const projects = scopedProjects();
  const movements = scopedMovements();
  const auditRows = state.data.audit.filter((entry) => inSummaryScope(entry.projectId));
  const financeItems = [
    { label: "Ingresos", value: current.income, color: PIE_COLORS[1] },
    { label: "Inversiones", value: current.investment, color: PIE_COLORS[2] },
    { label: "Gastos", value: current.expenses, color: PIE_COLORS[3] },
  ];
  const budgetItems = projects.map((project, index) => ({
    label: project.name,
    value: numberValue(project.budget),
    color: PIE_COLORS[index % PIE_COLORS.length],
  }));

  renderPie("#financePie", financeItems);
  renderLegend("#financeLegend", financeItems);
  renderPie("#budgetPie", budgetItems);
  renderLegend("#budgetLegend", budgetItems);

  replaceChildren(
    "#planBoard",
    projects.map((project) => {
      const projectMovements = movements.filter((movement) => movement.projectId === project.id);
      const projectSpent = projectMovements
        .filter((movement) => movement.type === "Gasto")
        .reduce((sum, movement) => sum + numberValue(movement.amount), 0);
      const projectCapital = projectMovements
        .filter((movement) => movement.type !== "Gasto")
        .reduce((sum, movement) => sum + numberValue(movement.amount), 0);

      return el("article", {}, [
        el("span", { text: project.type }),
        el("strong", { text: project.name }),
        el("p", { text: project.objective || "Sin objetivo operativo registrado." }),
        el("p", {
          text: `Capital ${money(projectCapital)} | Gasto ${money(projectSpent)} | Estado ${project.status}`,
        }),
      ]);
    }),
  );

  replaceChildren(
    "#breakevenList",
    projects.map((project) => {
      const percent = selectedTotals(project.id);
      return el("div", {}, [
        el("small", { text: project.name }),
        el("strong", { text: `${percent}%` }),
        el("i", { style: `--value: ${percent}%` }),
      ]);
    }),
  );

  replaceChildren(
    "#activityList",
    movements.slice(0, 7).map((movement) =>
      el("li", {}, [
        el("b", { text: movement.concept }),
        el("strong", { text: money(movement.amount) }),
        el("span", {
          text: `${projectName(movement.projectId)} - ${movement.type}`,
        }),
      ]),
    ),
  );

  replaceChildren(
    "#auditList",
    auditRows.slice(0, 7).map((entry) =>
      el("li", {}, [
        el("strong", { text: entry.action }),
        el("span", { text: `${entry.createdAt || ""} - ${entry.detail}` }),
      ]),
    ),
  );

  const activeProjects = projects.filter(
    (project) => project.status !== "Archivado",
  ).length;
  const newestMovement = movements[0];
  const dbReady = state.backend === "ready" && !isLocalSession();

  replaceChildren("#executiveSignals", [
    el("div", {}, [
      el("b", { text: "DB" }),
      el("strong", {
        text: dbReady ? "Google Sheets operativo" : "Conexion en revision",
      }),
      el("span", {
        text: dbReady
          ? "Lectura y escritura salen desde la hoja publicada."
          : "ProN intentara reconectar antes de operar.",
      }),
    ]),
    el("div", {}, [
      el("b", { text: "$" }),
      el("strong", { text: `Caja disponible ${money(current.balance)}` }),
      el("span", {
        text: `${activeProjects} proyectos activos con presupuesto consolidado.`,
      }),
    ]),
    el("div", {}, [
      el("b", { text: "OP" }),
      el("strong", { text: newestMovement?.concept || "Sin movimientos recientes" }),
      el("span", {
        text: newestMovement
          ? `${projectName(newestMovement.projectId)} - ${newestMovement.type}`
          : "Registra ingresos, gastos e inversiones por proyecto.",
      }),
    ]),
  ]);
}

function renderProjects() {
  replaceChildren(
    "#projectsBody",
    filteredProjects().map((project) =>
      el("tr", {}, [
        el("td", { text: project.name }),
        el("td", { text: project.type }),
        el("td", { text: money(project.budget) }),
        el("td", {}, [
          el("span", {
            class: `pill ${project.status === "Archivado" ? "archived" : ""}`,
            text: project.status,
          }),
        ]),
        el("td", {}, [
          el("div", { class: "row-actions" }, [
            el("button", {
              type: "button",
              text: "Abrir",
              onclick: () => {
                state.selectedProjectId = project.id;
                state.summaryScopeId = project.id;
                $("#projectSelect").value = project.id;
                $("#summaryScopeSelect").value = project.id;
                setMessage(`Vista activa: ${project.name}.`);
                render();
              },
            }),
            el("button", {
              type: "button",
              text: "Descargar",
              onclick: () => downloadProjectReport(project.id),
            }),
            el("button", {
              type: "button",
              text: project.status === "Archivado" ? "Restaurar" : "Archivar",
              onclick: () =>
                submitAction(
                  "update-project-status",
                  {
                    projectId: project.id,
                    status: project.status === "Archivado" ? "Activo" : "Archivado",
                  },
                  "Estado del proyecto actualizado.",
                ),
            }),
            el("button", {
              type: "button",
              class: "danger",
              text: "Eliminar",
              onclick: () =>
                confirmDelete(
                  `Eliminar ${project.name} y sus registros vinculados?`,
                  "delete-project",
                  { projectId: project.id },
                  "Proyecto eliminado de Google Sheets.",
                ),
            }),
          ]),
        ]),
      ]),
    ),
  );
}

function renderMovements() {
  replaceChildren(
    "#movementsBody",
    filteredMovements().map((movement) =>
      el("tr", {}, [
        el("td", { text: movement.movementDate }),
        el("td", { text: projectName(movement.projectId) }),
        el("td", { text: movement.type }),
        el("td", { text: movement.category }),
        el("td", { text: movement.concept }),
        el("td", { text: money(movement.amount) }),
        el("td", {}, [
          el("div", { class: "row-actions" }, [
            el("button", {
              type: "button",
              text: "Descargar",
              onclick: () => downloadMovementReceipt(movement.id),
            }),
            el("button", {
              type: "button",
              class: "danger",
              text: "Eliminar",
              onclick: () =>
                confirmDelete(
                  `Eliminar movimiento ${movement.concept}?`,
                  "delete-movement",
                  { movementId: movement.id },
                  "Movimiento eliminado de Google Sheets.",
                ),
            }),
          ]),
        ]),
      ]),
    ),
  );
}

function renderPartners() {
  replaceChildren(
    "#partnersCards",
    scopedPartners().map((partner) =>
      el("div", {}, [
        el("span", { text: partner.type }),
        el("b", { text: partner.name }),
        el("small", { text: projectName(partner.projectId) }),
        el("strong", {
          text: `${money(partner.contribution)} - ${numberValue(partner.participation)}%`,
        }),
        el("div", { class: "card-actions" }, [
          el("button", {
            type: "button",
            text: "Descargar",
            onclick: () => downloadPartnerCard(partner.id),
          }),
          el("button", {
            type: "button",
            class: "danger",
            text: "Eliminar",
            onclick: () =>
              confirmDelete(
                `Eliminar socio ${partner.name}?`,
                "delete-partner",
                { partnerId: partner.id },
                "Socio eliminado de Google Sheets.",
              ),
          }),
        ]),
      ]),
    ),
  );
}

function renderInventory() {
  replaceChildren(
    "#inventoryBody",
    scopedInventory().map((item) =>
      el("tr", {}, [
        el("td", { text: projectName(item.projectId) }),
        el("td", { text: item.item }),
        el("td", { text: item.category }),
        el("td", { text: String(item.quantity) }),
        el("td", { text: money(numberValue(item.quantity) * numberValue(item.unitCost)) }),
        el("td", {}, [
          el("div", { class: "row-actions" }, [
            el("button", {
              type: "button",
              text: "Descargar",
              onclick: () => downloadInventoryCard(item.id),
            }),
            el("button", {
              type: "button",
              class: "danger",
              text: "Eliminar",
              onclick: () =>
                confirmDelete(
                  `Eliminar item ${item.item}?`,
                  "delete-inventory",
                  { inventoryId: item.id },
                  "Inventario eliminado de Google Sheets.",
                ),
            }),
          ]),
        ]),
      ]),
    ),
  );
}

function renderUsers() {
  replaceChildren(
    "#usersBody",
    state.data.users
      .filter((user) => inSummaryScope(user.projectId))
      .map((user) =>
        el("tr", {}, [
          el("td", { text: user.name }),
          el("td", { text: user.role }),
          el("td", { text: projectName(user.projectId) }),
          el("td", { text: user.status }),
          el("td", {}, [
            el("div", { class: "row-actions" }, [
              el("button", {
                type: "button",
                text: "Descargar",
                onclick: () => downloadUserCard(user.id),
              }),
              el("button", {
                type: "button",
                class: "danger",
                text: "Eliminar",
                disabled: user.role === "Superadministrador",
                onclick: () =>
                  confirmDelete(
                    `Eliminar usuario ${user.name}?`,
                    "delete-user",
                    { userId: user.id },
                    "Usuario eliminado de Google Sheets.",
                  ),
              }),
            ]),
          ]),
        ]),
      ),
  );
}

function renderReports() {
  const current = totals();
  replaceChildren(
    "#chartBars",
    scopedProjects().map((project) => {
      const width = Math.max(
        8,
        Math.round((numberValue(project.budget) / Math.max(current.budget, 1)) * 100),
      );
      return el("div", {}, [
        el("span", { text: project.name }),
        el("i", { style: `width: ${width}%` }),
        el("b", { text: money(project.budget) }),
      ]);
    }),
  );
}

function renderSettings() {
  $("#scriptUrlInput").value = APPS_SCRIPT_URL;
  $("#sheetUrlInput").value = SHEET_URL;
  $("#countryInput").value = state.data.settings.country;
  $("#currencyInput").value = state.data.settings.currency;
  $("#timezoneInput").value = state.data.settings.timezone;
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function csvEscape(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function downloadText(filename, mime, content) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function logout(message = "Sesion cerrada.") {
  sessionStorage.removeItem(TOKEN_KEY);
  state.token = "";
  state.user = null;
  updateConnection("Verificando Google Sheets", "checking");
  showLogin(message);
  checkBackend();
}

function safeFileName(value) {
  return String(value || "pron")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function rowsForProject(collection, projectId) {
  return projectId ? collection.filter((row) => row.projectId === projectId) : collection;
}

function buildCsv(projectId = summaryProjectId()) {
  const movements = rowsForProject(state.data.movements, projectId);
  const rows = [
    ["Proyecto", "Tipo", "Categoria", "Concepto", "Valor", "Fecha", "Estado"],
    ...movements.map((movement) => [
      projectName(movement.projectId),
      movement.type,
      movement.category,
      movement.concept,
      movement.amount,
      movement.movementDate,
      movement.status,
    ]),
  ];

  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function buildReport(projectId = summaryProjectId()) {
  const current = totals(projectId);
  const projects = projectId
    ? state.data.projects.filter((project) => project.id === projectId)
    : state.data.projects;
  const movements = rowsForProject(state.data.movements, projectId);
  const partners = rowsForProject(state.data.partners, projectId);
  const inventory = rowsForProject(state.data.inventory, projectId);
  return [
    `ProN - Informe ejecutivo (${projectId ? projectName(projectId) : "Todo ProN"})`,
    `Fecha: ${today()}`,
    `Presupuesto total: ${money(current.budget)}`,
    `Ingresos: ${money(current.income)}`,
    `Inversiones: ${money(current.investment)}`,
    `Gastos: ${money(current.expenses)}`,
    `Balance: ${money(current.balance)}`,
    "",
    "Proyectos:",
    ...projects.map(
      (project) =>
        `- ${project.name}: ${project.status}, ${money(project.budget)} | ${project.objective}`,
    ),
    "",
    "Movimientos:",
    ...movements.map(
      (movement) =>
        `- ${movement.movementDate} | ${projectName(movement.projectId)} | ${movement.type} | ${movement.category} | ${movement.concept} | ${money(movement.amount)}`,
    ),
    "",
    "Socios:",
    ...partners.map(
      (partner) =>
        `- ${partner.name} | ${partner.type} | ${money(partner.contribution)} | ${numberValue(partner.participation)}%`,
    ),
    "",
    "Inventario:",
    ...inventory.map(
      (item) =>
        `- ${item.item} | ${item.category} | ${item.quantity} x ${money(item.unitCost)} | ${projectName(item.projectId)}`,
    ),
  ].join("\n");
}

function downloadScopeReport() {
  const label = safeFileName(currentScopeLabel());
  downloadText(`pron-${label}.txt`, "text/plain;charset=utf-8", buildReport());
}

function downloadProjectReport(projectId) {
  const label = safeFileName(projectName(projectId));
  downloadText(`pron-proyecto-${label}.txt`, "text/plain;charset=utf-8", buildReport(projectId));
}

function downloadMovementReceipt(movementId) {
  const movement = state.data.movements.find((item) => item.id === movementId);
  if (!movement) {
    return;
  }
  downloadText(
    `pron-movimiento-${safeFileName(movement.concept)}.txt`,
    "text/plain;charset=utf-8",
    [
      "ProN - Comprobante de movimiento",
      `Proyecto: ${projectName(movement.projectId)}`,
      `Fecha: ${movement.movementDate}`,
      `Tipo: ${movement.type}`,
      `Categoria: ${movement.category}`,
      `Concepto: ${movement.concept}`,
      `Valor: ${money(movement.amount)}`,
      `Estado: ${movement.status}`,
    ].join("\n"),
  );
}

function downloadPartnerCard(partnerId) {
  const partner = state.data.partners.find((item) => item.id === partnerId);
  if (!partner) {
    return;
  }
  downloadText(
    `pron-socio-${safeFileName(partner.name)}.txt`,
    "text/plain;charset=utf-8",
    [
      "ProN - Ficha de socio",
      `Nombre: ${partner.name}`,
      `Tipo: ${partner.type}`,
      `Proyecto: ${projectName(partner.projectId)}`,
      `Aporte: ${money(partner.contribution)}`,
      `Participacion: ${numberValue(partner.participation)}%`,
      `Estado: ${partner.status}`,
    ].join("\n"),
  );
}

function downloadInventoryCard(inventoryId) {
  const item = state.data.inventory.find((entry) => entry.id === inventoryId);
  if (!item) {
    return;
  }
  downloadText(
    `pron-inventario-${safeFileName(item.item)}.txt`,
    "text/plain;charset=utf-8",
    [
      "ProN - Ficha de inventario",
      `Item: ${item.item}`,
      `Categoria: ${item.category}`,
      `Proyecto: ${projectName(item.projectId)}`,
      `Cantidad: ${item.quantity}`,
      `Costo unitario: ${money(item.unitCost)}`,
      `Valor total: ${money(numberValue(item.quantity) * numberValue(item.unitCost))}`,
      `Estado: ${item.status}`,
    ].join("\n"),
  );
}

function downloadUserCard(userId) {
  const user = state.data.users.find((item) => item.id === userId);
  if (!user) {
    return;
  }
  downloadText(
    `pron-usuario-${safeFileName(user.name)}.txt`,
    "text/plain;charset=utf-8",
    [
      "ProN - Ficha de usuario",
      `Nombre: ${user.name}`,
      `Rol: ${user.role}`,
      `Proyecto: ${projectName(user.projectId)}`,
      `Estado: ${user.status}`,
      `Creado: ${user.createdAt}`,
    ].join("\n"),
  );
}

function downloadJson() {
  downloadText(
    `pron-datos-${safeFileName(currentScopeLabel())}.json`,
    "application/json;charset=utf-8",
    JSON.stringify(
      {
        scope: currentScopeLabel(),
        exportedAt: new Date().toISOString(),
        projects: scopedProjects(),
        movements: scopedMovements(),
        partners: scopedPartners(),
        inventory: scopedInventory(),
        users: state.data.users.filter((user) => inSummaryScope(user.projectId)),
      },
      null,
      2,
    ),
  );
}

function confirmDelete(question, action, payload, successMessage) {
  if (!window.confirm(question)) {
    return;
  }

  submitAction(action, payload, successMessage);
}

function bindEvents() {
  $("#loginForm").addEventListener("submit", login);
  $("#refreshButton").addEventListener("click", refreshData);
  $("#exportTopButton").addEventListener("click", downloadScopeReport);
  $("#downloadScopeButton").addEventListener("click", downloadScopeReport);
  $("#logoutButton").addEventListener("click", () => logout());
  $("#topLogoutButton").addEventListener("click", () => logout());
  $("#summaryScopeSelect").addEventListener("change", (event) => {
    state.summaryScopeId = event.target.value;
    render();
  });
  $("#projectSelect").addEventListener("change", (event) => {
    state.selectedProjectId = event.target.value;
    $("#userProjectInput").value = event.target.value;
    render();
  });
  $("#searchInput").addEventListener("input", (event) => {
    state.search = event.target.value;
    renderProjects();
    renderMovements();
  });
  $("#movementForm").elements.type.addEventListener("change", renderCategorySelects);

  $$("nav button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      $$("nav button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      $$(".view").forEach((view) => {
        view.classList.toggle("active", view.dataset.view === state.activeTab);
      });
    });
  });

  $("#projectForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.currentTarget);
    submitAction(
      "create-project",
      {
        ...data,
        country: "Ecuador",
        currency: "USD",
        timezone: "America/Guayaquil",
        budget: numberValue(data.budget),
      },
      "Proyecto creado en Google Sheets.",
    );
    event.currentTarget.reset();
  });

  $("#movementForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.currentTarget);
    submitAction(
      "create-movement",
      {
        ...data,
        projectId: state.selectedProjectId,
        amount: numberValue(data.amount),
      },
      "Movimiento guardado en Google Sheets.",
    );
    event.currentTarget.reset();
    event.currentTarget.elements.movementDate.value = today();
  });

  $("#partnerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.currentTarget);
    submitAction(
      "create-partner",
      {
        ...data,
        projectId: state.selectedProjectId,
        contribution: numberValue(data.contribution),
        participation: numberValue(data.participation),
      },
      "Socio guardado en Google Sheets.",
    );
    event.currentTarget.reset();
  });

  $("#inventoryForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.currentTarget);
    submitAction(
      "create-inventory",
      {
        ...data,
        projectId: state.selectedProjectId,
        quantity: numberValue(data.quantity),
        unitCost: numberValue(data.unitCost),
      },
      "Inventario actualizado en Google Sheets.",
    );
    event.currentTarget.reset();
  });

  $("#userForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.currentTarget);
    submitAction(
      "create-user",
      {
        ...data,
        projectId: data.projectId || state.selectedProjectId,
      },
      "Usuario agregado en Google Sheets.",
    );
    event.currentTarget.reset();
  });

  $("#exportCsvButton").addEventListener("click", () => {
    downloadText(
      `movimientos-pron-${safeFileName(currentScopeLabel())}.csv`,
      "text/csv;charset=utf-8",
      buildCsv(),
    );
  });
  $("#exportTxtButton").addEventListener("click", () => {
    downloadScopeReport();
  });
  $("#exportJsonButton").addEventListener("click", () => {
    downloadJson();
  });
}

function init() {
  bindEvents();
  $("#movementForm").elements.movementDate.value = today();
  checkBackend();
  resumeSession();
}

init();
