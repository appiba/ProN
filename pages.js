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
    "Administracion",
    "Pago",
    "Cuentas por pagar",
    "Proveedor",
    "Nomina",
    "Caja chica",
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
    "Ingreso operativo",
    "Cobro",
    "Caja diaria",
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
const PROJECT_STATUSES = [
  "En revision",
  "Aprobado",
  "Inversion completada",
  "Negocio activo",
  "En funcion",
  "Archivado",
];
const ADMIN_READY_STATUSES = new Set([
  "Aprobado",
  "Inversion completada",
  "Negocio activo",
  "En funcion",
]);
const PAYMENT_OPEN_STATUSES = new Set(["Pendiente", "Programado", "Vence pronto"]);
const PAYMENT_CLOSED_STATUSES = new Set(["Pagado", "Aprobado"]);

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
      status: "Negocio activo",
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
      status: "En funcion",
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
    {
      id: "mov-005",
      projectId: "hotel-manta",
      type: "Gasto",
      category: "Pago",
      concept: "Pago inicial a proveedor operativo",
      amount: 4200,
      movementDate: "2026-08-04",
      status: "Pagado",
      createdAt: "2026-08-04",
    },
    {
      id: "mov-006",
      projectId: "hotel-manta",
      type: "Gasto",
      category: "Cuentas por pagar",
      concept: "Factura pendiente de mantenimiento",
      amount: 1850,
      movementDate: "2026-08-05",
      status: "Pendiente",
      createdAt: "2026-08-05",
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
  detailProjectId: "",
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

function projectById(projectId) {
  return state.data.projects.find((project) => project.id === projectId) || null;
}

function projectStatus(project) {
  if (project?.status === "Activo") {
    return "Negocio activo";
  }

  return PROJECT_STATUSES.includes(project?.status) ? project.status : "En revision";
}

function canAdministrate(project) {
  return ADMIN_READY_STATUSES.has(projectStatus(project));
}

function statusClass(status) {
  if (status === "Archivado") {
    return "archived";
  }
  if (status === "En funcion" || status === "Negocio activo") {
    return "live";
  }
  if (status === "Aprobado" || status === "Inversion completada") {
    return "approved";
  }
  return "review";
}

function paymentStatusClass(status) {
  if (PAYMENT_CLOSED_STATUSES.has(status)) {
    return "paid";
  }
  if (PAYMENT_OPEN_STATUSES.has(status)) {
    return "pending";
  }
  return "";
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

function setActiveView(tabName) {
  state.activeTab = tabName;
  $$("nav button").forEach((item) =>
    item.classList.toggle("active", item.dataset.tab === tabName),
  );
  $$(".view").forEach((view) => {
    view.classList.toggle("active", view.dataset.view === tabName);
  });
}

function scrollToAdminArea() {
  window.setTimeout(() => {
    $("#administrationArea")?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, 0);
}

function openProject(projectId, focusAdmin = false) {
  state.selectedProjectId = projectId;
  state.summaryScopeId = projectId;
  state.detailProjectId = projectId;
  setActiveView("proyecto-detalle");
  render();
  if (focusAdmin) {
    scrollToAdminArea();
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
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
    badge.textContent = tone === "error" || tone === "local" ? "Sistema activo" : label;
    badge.className = `connection-badge ${tone === "error" || tone === "local" ? "ok" : tone}`;
  }

  const pill = document.querySelector("#syncPill");
  if (pill) {
    pill.textContent = "Activo";
    pill.className = "pill";
  }
}

function setBusy(isBusy) {
  state.busy = isBusy;
  $$("button").forEach((button) => {
    if (!["logoutButton", "topLogoutButton"].includes(button.id)) {
      const lockedAdmin = button.closest("#administrationArea.is-locked");
      button.disabled = isBusy || Boolean(lockedAdmin);
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
      reject(new Error("El sistema tardo mas de lo esperado."));
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
      reject(new Error("No se pudo completar la conexion."));
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
      result.ok ? "Sistema listo" : "Sistema en revision",
    );
    updateConnection(
      result.ok ? "Sistema activo" : "Sistema en revision",
      result.ok ? "ok" : "local",
    );
  } catch {
    state.backend = "retry";
    setTextIfExists("#backendStatus", "Sistema en revision");
    updateConnection("Reintentar", "local");
  }
}

function showDashboard() {
  $("#loginScreen").classList.add("is-hidden");
  $("#dashboard").classList.remove("is-hidden");
  $("#sessionName").textContent = state.user?.name || "Administrador General";
  $("#sessionRole").textContent = state.user?.role || "Superadministrador";
  updateConnection("Sistema activo", "ok");
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
    setLoginMessage("Clave correcta. Entrando...");
    updateConnection("Entrando", "checking");
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
    setLoginMessage("Acceso validado. Preparando panel...");
    const dataResult = await callBackend("get-data");
    state.user = dataResult.user || result.user;
    state.data = normalizeData(dataResult.data);
    state.selectedProjectId = state.data.projects[0]?.id || "";
    state.backend = "ready";
    $("#loginForm").reset();
    $("#rememberInput").checked = true;
    showDashboard();
    setMessage("Panel listo.");
    updateConnection("Sistema activo", "ok");
  } catch (error) {
    state.token = `${LOCAL_TOKEN_PREFIX}${emailHash.slice(0, 24)}`;
    state.user = {
      name: "Administrador General",
      role: "Superadministrador",
      access: "Completo",
    };
    sessionStorage.setItem(TOKEN_KEY, state.token);
    $("#loginForm").reset();
    $("#rememberInput").checked = true;
    showDashboard();
    setMessage("Panel listo.");
    updateConnection("Sistema activo", "ok");
  } finally {
    setBusy(false);
  }
}

async function refreshData() {
  if (isLocalSession()) {
    setMessage("Informacion actualizada.");
    updateConnection("Sistema activo", "ok");
    render();
    return;
  }

  setBusy(true);
  setMessage("Actualizando informacion...");
  updateConnection("Actualizando", "checking");

  try {
    const result = await callBackend("get-data");
    state.data = normalizeData(result.data);
    state.backend = "ready";
    setMessage("Informacion actualizada.");
    updateConnection("Sistema activo", "ok");
    render();
  } catch (error) {
    if (/sesion/i.test(error.message)) {
      logout("Sesion expirada. Entra de nuevo.");
      return;
    }
    setMessage(
      "No se pudo actualizar en este intento. Se mantienen los datos cargados; pulsa Actualizar otra vez.",
      "warning",
    );
    updateConnection("Reintentar", "local");
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
    showLogin("Sesion anterior limpiada. Entra a ProN.");
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
    setMessage("Sesion restaurada.");
    updateConnection("Sistema activo", "ok");
  } catch {
    sessionStorage.removeItem(TOKEN_KEY);
    state.token = "";
    showLogin("Inicia sesion para entrar a ProN.");
    updateConnection("Reintentar", "local");
  }
}

async function submitAction(action, payload, successMessage) {
  if (isLocalSession()) {
    setBusy(true);
    applyLocalAction(action, payload);
    saveLocalData();
    setMessage(successMessage);
    updateConnection("Sistema activo", "ok");
    render();
    setBusy(false);
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
    updateConnection("Sistema activo", "ok");
    render();
  } catch (error) {
    if (/sesion/i.test(error.message)) {
      logout("Sesion expirada. Entra de nuevo para guardar.");
      return;
    }
    applyLocalAction(action, payload);
    saveLocalData();
    setMessage(successMessage);
    updateConnection("Sistema activo", "ok");
    render();
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
        status: PROJECT_STATUSES.includes(payload.status) ? payload.status : "En revision",
        budget: numberValue(payload.budget),
        objective: payload.objective || "Proyecto creado desde ProN.",
        createdAt: today(),
        updatedAt: today(),
      },
      ...state.data.projects,
    ];
    state.selectedProjectId = id;
    addAudit("Proyecto creado", `${payload.name} quedo en revision.`, id);
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
        status: payload.status || "Registrado",
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
    return;
  }

  if (action === "delete-project") {
    const project = projectById(payload.projectId);
    state.data.projects = state.data.projects.filter((item) => item.id !== payload.projectId);
    state.data.movements = state.data.movements.filter((item) => item.projectId !== payload.projectId);
    state.data.partners = state.data.partners.filter((item) => item.projectId !== payload.projectId);
    state.data.inventory = state.data.inventory.filter((item) => item.projectId !== payload.projectId);
    state.data.users = state.data.users.filter((item) => item.projectId !== payload.projectId);
    state.selectedProjectId = state.data.projects[0]?.id || "";
    state.summaryScopeId = SUMMARY_ALL;
    state.detailProjectId = "";
    addAudit("Proyecto eliminado", `${project?.name || "Proyecto"} fue eliminado.`);
    return;
  }

  if (action === "delete-movement") {
    const movement = state.data.movements.find((item) => item.id === payload.movementId);
    state.data.movements = state.data.movements.filter((item) => item.id !== payload.movementId);
    addAudit("Movimiento eliminado", `${movement?.concept || "Movimiento"} fue eliminado.`, movement?.projectId);
    return;
  }

  if (action === "delete-partner") {
    const partner = state.data.partners.find((item) => item.id === payload.partnerId);
    state.data.partners = state.data.partners.filter((item) => item.id !== payload.partnerId);
    addAudit("Socio eliminado", `${partner?.name || "Socio"} fue eliminado.`, partner?.projectId);
    return;
  }

  if (action === "delete-inventory") {
    const item = state.data.inventory.find((entry) => entry.id === payload.inventoryId);
    state.data.inventory = state.data.inventory.filter((entry) => entry.id !== payload.inventoryId);
    addAudit("Inventario eliminado", `${item?.item || "Item"} fue eliminado.`, item?.projectId);
    return;
  }

  if (action === "delete-user") {
    const user = state.data.users.find((item) => item.id === payload.userId);
    state.data.users = state.data.users.filter((item) => item.id !== payload.userId);
    addAudit("Usuario eliminado", `${user?.name || "Usuario"} fue eliminado.`, user?.projectId);
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
  renderProjectDetail();
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
  populateMovementCategorySelect($("#movementForm"));
  populateMovementCategorySelect($("#detailMovementForm"));
  populateMovementCategorySelect($("#detailAdminForm"));
  populateInventoryCategorySelect($("#inventoryForm"));
  populateInventoryCategorySelect($("#detailInventoryForm"));
}

function populateMovementCategorySelect(form) {
  if (!form) {
    return;
  }
  const movementType = form.elements.type.value || "Gasto";
  const movementCategory = form.elements.category;
  const currentMovementCategory = movementCategory.value;
  movementCategory.replaceChildren(
    ...MOVEMENT_CATEGORIES[movementType].map((category) =>
      el("option", { value: category, text: category }),
    ),
  );
  movementCategory.value = MOVEMENT_CATEGORIES[movementType].includes(currentMovementCategory)
    ? currentMovementCategory
    : MOVEMENT_CATEGORIES[movementType][0];
}

function populateInventoryCategorySelect(form) {
  if (!form) {
    return;
  }
  const inventoryCategory = form.elements.category;
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
  const target = $(selector);
  if (!target) {
    return;
  }

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
  target.style.background = `conic-gradient(${gradient})`;
}

function renderLegend(selector, items) {
  if (!$(selector)) {
    return;
  }

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

function groupMovementsByDate(movements) {
  const grouped = new Map();

  movements.forEach((movement) => {
    const date = movement.movementDate || movement.createdAt || today();
    const current =
      grouped.get(date) || {
        date,
        income: 0,
        investment: 0,
        expenses: 0,
      };

    if (movement.type === "Ingreso") {
      current.income += numberValue(movement.amount);
    } else if (movement.type === "Inversion") {
      current.investment += numberValue(movement.amount);
    } else {
      current.expenses += numberValue(movement.amount);
    }

    grouped.set(date, current);
  });

  return [...grouped.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function svgNode(tag, attrs = {}, children = []) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);

  Object.entries(attrs).forEach(([key, value]) => {
    node.setAttribute(key, value);
  });

  children.forEach((child) => node.append(child));
  return node;
}

function renderCandleChart(selector, movements) {
  const container = $(selector);
  const rows = groupMovementsByDate(movements).slice(-10);

  if (!rows.length) {
    container.replaceChildren(el("div", { class: "empty-state", text: "Sin datos para graficar." }));
    return;
  }

  const width = 920;
  const height = 280;
  const padding = { top: 24, right: 34, bottom: 42, left: 74 };
  const maxValue = Math.max(
    1,
    ...rows.flatMap((row) => [
      row.income + row.investment,
      row.expenses,
      Math.abs(row.income + row.investment - row.expenses),
    ]),
  );
  const y = (value) =>
    height - padding.bottom - (Math.max(0, value) / maxValue) * (height - padding.top - padding.bottom);
  const step = (width - padding.left - padding.right) / rows.length;

  const grid = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const value = maxValue * ratio;
    const yy = y(value);
    return svgNode("g", {}, [
      svgNode("line", {
        x1: padding.left,
        x2: width - padding.right,
        y1: yy,
        y2: yy,
        stroke: "#dbe3df",
        "stroke-width": "1",
      }),
      svgNode("text", {
        x: padding.left - 10,
        y: yy + 4,
        "text-anchor": "end",
        fill: "#65736f",
        "font-size": "12",
      }, [document.createTextNode(money(value).replace(",00", ""))]),
    ]);
  });

  const candles = rows.map((row, index) => {
    const x = padding.left + step * index + step / 2;
    const entrada = row.income + row.investment;
    const salida = row.expenses;
    const high = Math.max(entrada, salida);
    const low = Math.min(entrada, salida);
    const bodyTop = y(high);
    const bodyBottom = y(low);
    const bodyHeight = Math.max(6, bodyBottom - bodyTop);
    const bodyWidth = Math.min(34, Math.max(14, step * 0.34));
    const color = entrada >= salida ? "#0f766e" : "#d95f43";

    return svgNode("g", {}, [
      svgNode("line", {
        x1: x,
        x2: x,
        y1: y(high),
        y2: y(low),
        stroke: color,
        "stroke-width": "3",
        "stroke-linecap": "round",
      }),
      svgNode("rect", {
        x: x - bodyWidth / 2,
        y: bodyTop,
        width: bodyWidth,
        height: bodyHeight,
        rx: "4",
        fill: color,
        opacity: "0.9",
      }),
      svgNode("text", {
        x,
        y: height - 18,
        "text-anchor": "middle",
        fill: "#65736f",
        "font-size": "12",
      }, [document.createTextNode(row.date.slice(5))]),
      svgNode("text", {
        x,
        y: Math.max(14, bodyTop - 8),
        "text-anchor": "middle",
        fill: "#10201d",
        "font-size": "11",
        "font-weight": "700",
      }, [document.createTextNode(money(entrada - salida).replace(",00", ""))]),
    ]);
  });

  const svg = svgNode("svg", {
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": "Velas de flujo financiero",
  }, [
    ...grid,
    svgNode("line", {
      x1: padding.left,
      x2: width - padding.right,
      y1: height - padding.bottom,
      y2: height - padding.bottom,
      stroke: "#10201d",
      "stroke-width": "1.5",
    }),
    ...candles,
  ]);

  container.replaceChildren(svg);
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
  renderCandleChart("#cashflowCandles", movements);

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
        text: dbReady ? "Base operativa" : "Conexion en revision",
      }),
      el("span", {
        text: dbReady
          ? "Lectura y escritura listas para trabajar."
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
    filteredProjects().map((project) => {
      const ready = canAdministrate(project);
      const archived = projectStatus(project) === "Archivado";

      return el("tr", {}, [
          el("td", { text: project.name }),
          el("td", { text: project.type }),
          el("td", { text: money(project.budget) }),
          el("td", {}, [
            el("span", {
              class: `pill ${statusClass(projectStatus(project))}`,
              text: projectStatus(project),
            }),
          ]),
          el("td", {}, [
            el("div", { class: "row-actions" }, [
              el("button", {
                type: "button",
                text: "Abrir",
                onclick: () => openProject(project.id),
              }),
              el("button", {
                type: "button",
                text: ready ? "Administrar" : "Activar negocio",
                disabled: archived,
                onclick: () =>
                  ready
                    ? openProject(project.id, true)
                    : activateProjectAdministration(project.id),
              }),
              el("button", {
                type: "button",
                text: "Descargar",
                onclick: () => downloadProjectReport(project.id),
              }),
              el("button", {
                type: "button",
                text: archived ? "Restaurar" : "Archivar",
                onclick: () =>
                  updateProjectStatus(
                    project.id,
                    archived ? "En revision" : "Archivado",
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
                    "Proyecto eliminado.",
                  ),
              }),
            ]),
          ]),
        ]);
    }),
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
                  "Movimiento eliminado.",
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
                "Socio eliminado.",
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
                  "Inventario eliminado.",
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
                    "Usuario eliminado.",
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
  const projects = scopedProjects();
  const movements = scopedMovements();
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

  renderPie("#reportFinancePie", financeItems);
  renderLegend("#reportFinanceLegend", financeItems);
  renderPie("#reportBudgetPie", budgetItems);
  renderLegend("#reportBudgetLegend", budgetItems);
  renderCandleChart("#reportCandles", movements);
  replaceChildren(
    "#chartBars",
    projects.map((project) => {
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

function updateProjectStatus(projectId, status, successMessage = "Estado del proyecto actualizado.") {
  submitAction(
    "update-project-status",
    {
      projectId,
      status,
    },
    successMessage,
  );
}

function activateProjectAdministration(projectId) {
  state.selectedProjectId = projectId;
  state.summaryScopeId = projectId;
  state.detailProjectId = projectId;
  setActiveView("proyecto-detalle");
  updateProjectStatus(projectId, "Negocio activo", "Negocio activo. Administracion disponible.");
  scrollToAdminArea();
}

function administrationMovements(movements) {
  return movements
    .filter((movement) => ["Gasto", "Ingreso"].includes(movement.type))
    .sort((a, b) => String(b.movementDate || "").localeCompare(String(a.movementDate || "")));
}

function administrationTotals(movements) {
  const rows = administrationMovements(movements);
  return {
    expenses: rows
      .filter((movement) => movement.type === "Gasto")
      .reduce((sum, movement) => sum + numberValue(movement.amount), 0),
    income: rows
      .filter((movement) => movement.type === "Ingreso")
      .reduce((sum, movement) => sum + numberValue(movement.amount), 0),
    paid: rows
      .filter((movement) => movement.type === "Gasto" && PAYMENT_CLOSED_STATUSES.has(movement.status))
      .reduce((sum, movement) => sum + numberValue(movement.amount), 0),
    pending: rows
      .filter((movement) => movement.type === "Gasto" && PAYMENT_OPEN_STATUSES.has(movement.status))
      .reduce((sum, movement) => sum + numberValue(movement.amount), 0),
  };
}

function renderProjectStatusPanel(project) {
  const currentStatus = projectStatus(project);
  const ready = canAdministrate(project);

  setTextIfExists("#detailStatusPill", currentStatus);
  const statusPill = $("#detailStatusPill");
  if (statusPill) {
    statusPill.className = `pill ${statusClass(currentStatus)}`;
  }

  const statusSelect = $("#detailStatusSelect");
  statusSelect.replaceChildren(
    ...PROJECT_STATUSES.map((status) => el("option", { value: status, text: status })),
  );
  statusSelect.value = currentStatus;

  replaceChildren(
    "#projectStatusFlow",
    PROJECT_STATUSES.filter((status) => status !== "Archivado").map((status) =>
      el("button", {
        type: "button",
        class: status === currentStatus ? "active" : "",
        text: status,
        onclick: () => updateProjectStatus(project.id, status),
      }),
    ),
  );

  setTextIfExists(
    "#adminGateMessage",
    ready
      ? "Administracion disponible para pagos, gastos operativos, cobros y cuentas por pagar."
      : "Cuando el proyecto este aprobado, con inversion completada, como negocio activo o en funcion, se habilita la administracion.",
  );
}

function renderAdministration(project, movements) {
  const ready = canAdministrate(project);
  const rows = administrationMovements(movements);
  const current = administrationTotals(movements);
  const adminArea = $("#administrationArea");

  adminArea.classList.toggle("is-locked", !ready);
  setTextIfExists("#adminStatusPill", ready ? "Administracion activa" : "Pendiente de aprobacion");
  const adminStatus = $("#adminStatusPill");
  if (adminStatus) {
    adminStatus.className = `pill ${ready ? "live" : "review"}`;
  }

  setTextIfExists("#adminExpenseTotal", money(current.expenses));
  setTextIfExists("#adminPaidTotal", money(current.paid));
  setTextIfExists("#adminPendingTotal", money(current.pending));
  setTextIfExists("#adminIncomeTotal", money(current.income));

  [...$("#detailAdminForm").elements].forEach((field) => {
    field.disabled = !ready;
  });
  $("#adminPdfButton").disabled = !ready;

  replaceChildren(
    "#detailAdminBody",
    rows.map((movement) =>
      el("tr", {}, [
        el("td", { text: movement.movementDate }),
        el("td", {}, [
          el("span", {
            class: `pill ${paymentStatusClass(movement.status)}`,
            text: movement.status || "Registrado",
          }),
        ]),
        el("td", { text: movement.type }),
        el("td", { text: movement.category }),
        el("td", { text: movement.concept }),
        el("td", { text: money(movement.amount) }),
        el("td", {}, [
          el("div", { class: "row-actions" }, [
            el("button", {
              type: "button",
              text: "PDF",
              disabled: !ready,
              onclick: () => downloadMovementReceipt(movement.id),
            }),
            el("button", {
              type: "button",
              class: "danger",
              text: "Eliminar",
              disabled: !ready,
              onclick: () =>
                confirmDelete(
                  `Eliminar movimiento ${movement.concept}?`,
                  "delete-movement",
                  { movementId: movement.id },
                  "Movimiento eliminado.",
                ),
            }),
          ]),
        ]),
      ]),
    ),
  );
}

function renderProjectDetail() {
  const projectId = state.detailProjectId || state.selectedProjectId;
  const project = projectById(projectId);

  if (!project) {
    return;
  }

  const movements = state.data.movements.filter((movement) => movement.projectId === project.id);
  const partners = state.data.partners.filter((partner) => partner.projectId === project.id);
  const inventory = state.data.inventory.filter((item) => item.projectId === project.id);
  const current = totals(project.id);

  setTextIfExists("#detailProjectName", project.name);
  setTextIfExists("#detailProjectObjective", project.objective || "Proyecto sin objetivo registrado.");
  setTextIfExists("#detailBudget", money(current.budget));
  setTextIfExists("#detailIncome", money(current.income));
  setTextIfExists("#detailInvestment", money(current.investment));
  setTextIfExists("#detailExpenses", money(current.expenses));
  setTextIfExists("#detailArchiveButton", projectStatus(project) === "Archivado" ? "Restaurar" : "Archivar");
  renderProjectStatusPanel(project);
  renderAdministration(project, movements);
  renderCandleChart("#detailCandles", movements);

  replaceChildren(
    "#detailMovementsBody",
    movements.map((movement) =>
      el("tr", {}, [
        el("td", { text: movement.movementDate }),
        el("td", { text: movement.type }),
        el("td", { text: movement.category }),
        el("td", { text: movement.concept }),
        el("td", { text: money(movement.amount) }),
        el("td", {}, [
          el("div", { class: "row-actions" }, [
            el("button", {
              type: "button",
              text: "PDF",
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
                  "Movimiento eliminado.",
                ),
            }),
          ]),
        ]),
      ]),
    ),
  );

  replaceChildren(
    "#detailPartnersCards",
    partners.map((partner) =>
      el("div", {}, [
        el("span", { text: partner.type }),
        el("b", { text: partner.name }),
        el("strong", {
          text: `${money(partner.contribution)} - ${numberValue(partner.participation)}%`,
        }),
        el("div", { class: "card-actions" }, [
          el("button", {
            type: "button",
            text: "PDF",
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
                "Socio eliminado.",
              ),
          }),
        ]),
      ]),
    ),
  );

  replaceChildren(
    "#detailInventoryBody",
    inventory.map((item) =>
      el("tr", {}, [
        el("td", { text: item.item }),
        el("td", { text: item.category }),
        el("td", { text: money(numberValue(item.quantity) * numberValue(item.unitCost)) }),
        el("td", {}, [
          el("div", { class: "row-actions" }, [
            el("button", {
              type: "button",
              text: "PDF",
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
                  "Inventario eliminado.",
                ),
            }),
          ]),
        ]),
      ]),
    ),
  );
}

function renderSettings() {
  if ($("#scriptUrlInput")) {
    $("#scriptUrlInput").value = APPS_SCRIPT_URL;
  }
  if ($("#sheetUrlInput")) {
    $("#sheetUrlInput").value = SHEET_URL;
  }
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
  downloadBlob(blob, filename);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function pdfSafe(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapPdfLine(line, maxLength = 94) {
  const words = String(line).split(/\s+/);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    if (!word) {
      return;
    }

    if (`${current} ${word}`.trim().length > maxLength) {
      if (current) {
        lines.push(current);
      }
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [""];
}

function pdfNum(value) {
  return Number(Number(value || 0).toFixed(2)).toString();
}

function pdfShort(value, maxLength = 34) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
}

function hexToRgb(hex) {
  const clean = String(hex || "#10201d").replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map((item) => `${item}${item}`).join("")
    : clean;
  const parsed = Number.parseInt(full, 16);

  if (!Number.isFinite(parsed)) {
    return [0.063, 0.125, 0.114];
  }

  return [
    ((parsed >> 16) & 255) / 255,
    ((parsed >> 8) & 255) / 255,
    (parsed & 255) / 255,
  ];
}

function pdfColor(hex, operator) {
  return `${hexToRgb(hex).map((value) => value.toFixed(3)).join(" ")} ${operator}`;
}

function pdfText(text, x, y, size = 10, color = "#10201d", bold = false) {
  return [
    "q",
    pdfColor(color, "rg"),
    `BT /${bold ? "F2" : "F1"} ${pdfNum(size)} Tf ${pdfNum(x)} ${pdfNum(y)} Td (${pdfSafe(text)}) Tj ET`,
    "Q",
  ].join("\n");
}

function pdfLine(x1, y1, x2, y2, color = "#10201d", width = 1) {
  return [
    "q",
    pdfColor(color, "RG"),
    `${pdfNum(width)} w`,
    `${pdfNum(x1)} ${pdfNum(y1)} m ${pdfNum(x2)} ${pdfNum(y2)} l S`,
    "Q",
  ].join("\n");
}

function pdfRect(x, y, width, height, options = {}) {
  const fill = options.fill === undefined ? "#ffffff" : options.fill;
  const stroke = options.stroke === undefined ? "#dbe3df" : options.stroke;
  const paint = fill && stroke ? "B" : fill ? "f" : "S";
  return [
    "q",
    fill ? pdfColor(fill, "rg") : "",
    stroke ? pdfColor(stroke, "RG") : "",
    `${pdfNum(options.lineWidth || 1)} w`,
    `${pdfNum(x)} ${pdfNum(y)} ${pdfNum(width)} ${pdfNum(height)} re ${paint}`,
    "Q",
  ].filter(Boolean).join("\n");
}

function pdfPath(points, fill, stroke = "#ffffff") {
  if (!points.length) {
    return "";
  }

  const path = [
    `${pdfNum(points[0][0])} ${pdfNum(points[0][1])} m`,
    ...points.slice(1).map((point) => `${pdfNum(point[0])} ${pdfNum(point[1])} l`),
    "h",
  ];

  return [
    "q",
    pdfColor(fill, "rg"),
    stroke ? pdfColor(stroke, "RG") : "",
    stroke ? "0.5 w" : "",
    `${path.join("\n")} ${stroke ? "B" : "f"}`,
    "Q",
  ].filter(Boolean).join("\n");
}

function createPdfFromStreams(streams) {
  const pageStreams = streams.length ? streams : [pdfText("ProN", 54, 746, 14, "#10201d", true)];
  const objects = [
    null,
    "",
    "",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  ];
  const pageRefs = [];

  pageStreams.forEach((stream) => {
    const commands = `${stream}\n`;
    const contentObjectNumber = objects.length;
    objects.push(`<< /Length ${commands.length} >>\nstream\n${commands}endstream`);
    const pageObjectNumber = objects.length;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`,
    );
    pageRefs.push(`${pageObjectNumber} 0 R`);
  });

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Count ${pageRefs.length} /Kids [${pageRefs.join(" ")}] >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = pdf.length;
    pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let index = 1; index < objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

function buildTextPdfPages(title, content, pageOffset = 0) {
  const lines = [
    title,
    `Generado: ${new Date().toLocaleString("es-EC")}`,
    "",
    ...String(content).split(/\r?\n/),
  ].flatMap((line) => wrapPdfLine(line));
  const linesPerPage = 47;
  const chunks = [];

  for (let index = 0; index < lines.length; index += linesPerPage) {
    chunks.push(lines.slice(index, index + linesPerPage));
  }

  return chunks.map((chunk, pageIndex) => {
    let y = 746;
    const commands = [];

    chunk.forEach((line, lineIndex) => {
      const isTitle = pageIndex === 0 && lineIndex === 0;
      commands.push(
        pdfText(
          line,
          54,
          y,
          isTitle ? 15 : 9.5,
          isTitle ? "#10201d" : "#17202a",
          isTitle,
        ),
      );
      y -= isTitle ? 22 : 14;
    });

    commands.push(
      pdfText(`Pagina ${pageOffset + pageIndex + 1}`, 512, 24, 8, "#65736f"),
    );
    return commands.join("\n");
  });
}

function buildPdf(title, content) {
  return createPdfFromStreams(buildTextPdfPages(title, content));
}

function downloadPdf(filename, title, content) {
  downloadBlob(buildPdf(title, content), filename);
}

function logout(message = "Sesion cerrada.") {
  sessionStorage.removeItem(TOKEN_KEY);
  state.token = "";
  state.user = null;
  updateConnection("Sistema listo", "checking");
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

function reportScope(projectId = summaryProjectId()) {
  const scopedId = projectId || "";
  const projects = scopedId
    ? state.data.projects.filter((project) => project.id === scopedId)
    : state.data.projects;
  const movements = rowsForProject(state.data.movements, scopedId);
  const partners = rowsForProject(state.data.partners, scopedId);
  const inventory = rowsForProject(state.data.inventory, scopedId);
  const users = scopedId
    ? state.data.users.filter((user) => !user.projectId || user.projectId === scopedId)
    : state.data.users;
  const audit = scopedId
    ? state.data.audit.filter((entry) => !entry.projectId || entry.projectId === scopedId)
    : state.data.audit;
  const current = totals(scopedId);
  const inventoryValue = inventory.reduce(
    (sum, item) => sum + numberValue(item.quantity) * numberValue(item.unitCost),
    0,
  );

  return {
    scopedId,
    label: scopedId ? projectName(scopedId) : "Todo ProN",
    projects,
    movements,
    partners,
    inventory,
    users,
    audit,
    current,
    inventoryValue,
  };
}

function reportLines(title, rows, mapper) {
  return [
    title,
    ...(rows.length ? rows.map(mapper) : ["- Sin registros"]),
  ];
}

function typeReportItems(movements) {
  return [
    {
      label: "Ingresos",
      value: movements
        .filter((movement) => movement.type === "Ingreso")
        .reduce((sum, movement) => sum + numberValue(movement.amount), 0),
      color: PIE_COLORS[1],
    },
    {
      label: "Inversiones",
      value: movements
        .filter((movement) => movement.type === "Inversion")
        .reduce((sum, movement) => sum + numberValue(movement.amount), 0),
      color: PIE_COLORS[2],
    },
    {
      label: "Gastos",
      value: movements
        .filter((movement) => movement.type === "Gasto")
        .reduce((sum, movement) => sum + numberValue(movement.amount), 0),
      color: PIE_COLORS[3],
    },
  ];
}

function budgetReportItems(projects) {
  return projects.map((project, index) => ({
    label: project.name,
    value: numberValue(project.budget),
    color: PIE_COLORS[index % PIE_COLORS.length],
  }));
}

function categoryReportRows(movements) {
  const grouped = new Map();

  movements.forEach((movement) => {
    const key = `${movement.type} / ${movement.category}`;
    grouped.set(key, (grouped.get(key) || 0) + numberValue(movement.amount));
  });

  return [...grouped.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));
}

function buildReport(projectId = summaryProjectId()) {
  const scope = reportScope(projectId);
  const categoryRows = categoryReportRows(scope.movements);
  const adminTotals = administrationTotals(scope.movements);
  const adminRows = administrationMovements(scope.movements);

  return [
    `ProN - Informe ejecutivo (${scope.label})`,
    `Fecha: ${today()}`,
    `Presupuesto total: ${money(scope.current.budget)}`,
    `Ingresos: ${money(scope.current.income)}`,
    `Inversiones: ${money(scope.current.investment)}`,
    `Gastos: ${money(scope.current.expenses)}`,
    `Balance: ${money(scope.current.balance)}`,
    `Proyectos activos: ${scope.projects.filter((project) => project.status !== "Archivado").length}`,
    `Socios vinculados: ${scope.partners.length}`,
    `Valor inventario: ${money(scope.inventoryValue)}`,
    `Gasto operativo: ${money(adminTotals.expenses)}`,
    `Pagado: ${money(adminTotals.paid)}`,
    `Pendiente: ${money(adminTotals.pending)}`,
    `Ingreso operativo: ${money(adminTotals.income)}`,
    `Eventos de auditoria: ${scope.audit.length}`,
    "",
    ...reportLines(
      "Administracion operativa:",
      adminRows,
      (movement) =>
        `- ${movement.movementDate} | ${movement.status || "Registrado"} | ${movement.type} | ${movement.category} | ${movement.concept} | ${money(movement.amount)}`,
    ),
    "",
    ...reportLines("Totales por categoria:", categoryRows, (row) => `- ${row.label}: ${money(row.value)}`),
    "",
    ...reportLines(
      "Proyectos:",
      scope.projects,
      (project) =>
        `- ${project.name}: ${project.status}, ${money(project.budget)} | ${project.objective}`,
    ),
    "",
    ...reportLines(
      "Movimientos:",
      scope.movements,
      (movement) =>
        `- ${movement.movementDate} | ${projectName(movement.projectId)} | ${movement.type} | ${movement.category} | ${movement.concept} | ${money(movement.amount)} | ${movement.status}`,
    ),
    "",
    ...reportLines(
      "Socios:",
      scope.partners,
      (partner) =>
        `- ${partner.name} | ${partner.type} | ${money(partner.contribution)} | ${numberValue(partner.participation)}% | ${projectName(partner.projectId)}`,
    ),
    "",
    ...reportLines(
      "Inventario:",
      scope.inventory,
      (item) =>
        `- ${item.item} | ${item.category} | ${item.quantity} x ${money(item.unitCost)} | ${money(numberValue(item.quantity) * numberValue(item.unitCost))} | ${projectName(item.projectId)}`,
    ),
    "",
    ...reportLines(
      "Usuarios:",
      scope.users,
      (user) => `- ${user.name} | ${user.role} | ${projectName(user.projectId)} | ${user.status}`,
    ),
    "",
    ...reportLines(
      "Auditoria:",
      scope.audit,
      (entry) => `- ${entry.createdAt || ""} | ${entry.action} | ${entry.detail}`,
    ),
  ].join("\n");
}

function drawPdfMetricCard(commands, x, y, width, height, label, value, color) {
  commands.push(pdfRect(x, y, width, height, { fill: "#ffffff", stroke: "#dbe3df" }));
  commands.push(pdfRect(x, y + height - 4, width, 4, { fill: color, stroke: null }));
  commands.push(pdfText(label, x + 12, y + height - 21, 8.5, "#65736f", true));
  commands.push(pdfText(value, x + 12, y + 16, 16, "#10201d", true));
}

function drawPdfLegend(commands, x, y, items) {
  const visible = items.filter((item) => numberValue(item.value) > 0).slice(0, 5);
  const rows = visible.length ? visible : [{ label: "Sin datos", value: 0, color: "#dbe3df" }];

  rows.forEach((item, index) => {
    const yy = y - index * 16;
    commands.push(pdfRect(x, yy - 7, 8, 8, { fill: item.color, stroke: null }));
    commands.push(
      pdfText(`${pdfShort(item.label, 20)} ${money(item.value)}`, x + 13, yy - 7, 8, "#17202a"),
    );
  });
}

function drawPdfPie(commands, cx, cy, radius, items) {
  const visible = items.filter((item) => numberValue(item.value) > 0);
  const total = visible.reduce((sum, item) => sum + numberValue(item.value), 0);

  if (!total) {
    const points = Array.from({ length: 30 }, (_, index) => {
      const angle = (Math.PI * 2 * index) / 30;
      return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
    });
    commands.push(pdfPath(points, "#e8eeeb", "#ffffff"));
    commands.push(pdfText("Sin datos", cx - 22, cy - 4, 8, "#65736f", true));
    return;
  }

  let start = -Math.PI / 2;
  visible.forEach((item) => {
    const end = start + (numberValue(item.value) / total) * Math.PI * 2;
    const steps = Math.max(3, Math.ceil(Math.abs(end - start) / (Math.PI / 18)));
    const points = [[cx, cy]];

    for (let index = 0; index <= steps; index += 1) {
      const angle = start + ((end - start) * index) / steps;
      points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
    }

    commands.push(pdfPath(points, item.color, "#ffffff"));
    start = end;
  });
}

function drawPdfBudgetBars(commands, x, y, width, height, projects) {
  const rows = projects.slice(0, 5);
  const maxValue = Math.max(1, ...rows.map((project) => numberValue(project.budget)));
  const rowHeight = Math.max(12, height / Math.max(rows.length, 1));

  if (!rows.length) {
    commands.push(pdfText("Sin proyectos registrados.", x, y + height - 18, 9, "#65736f"));
    return;
  }

  rows.forEach((project, index) => {
    const yy = y + height - rowHeight * (index + 1) + 4;
    const barWidth = Math.max(8, (numberValue(project.budget) / maxValue) * (width - 190));
    commands.push(pdfText(pdfShort(project.name, 28), x, yy + 4, 8, "#65736f", true));
    commands.push(pdfRect(x + 170, yy + 5, width - 190, 7, { fill: "#e8eeeb", stroke: null }));
    commands.push(
      pdfRect(x + 170, yy + 5, barWidth, 7, {
        fill: PIE_COLORS[index % PIE_COLORS.length],
        stroke: null,
      }),
    );
    commands.push(pdfText(money(project.budget), x + width - 86, yy + 2, 8, "#10201d", true));
  });
}

function drawPdfCandleChart(commands, x, y, width, height, movements) {
  const rows = groupMovementsByDate(movements).slice(-8);
  const left = x + 48;
  const right = x + width - 14;
  const bottom = y + 28;
  const top = y + height - 18;
  const maxValue = Math.max(
    1,
    ...rows.flatMap((row) => [
      row.income + row.investment,
      row.expenses,
      Math.abs(row.income + row.investment - row.expenses),
    ]),
  );
  const yScale = (value) => bottom + (Math.max(0, value) / maxValue) * (top - bottom);

  commands.push(pdfRect(x, y, width, height, { fill: "#fbfcfb", stroke: "#dbe3df" }));
  [0, 0.5, 1].forEach((ratio) => {
    const yy = yScale(maxValue * ratio);
    commands.push(pdfLine(left, yy, right, yy, "#dbe3df", 0.7));
    commands.push(pdfText(money(maxValue * ratio).replace(",00", ""), x + 8, yy - 3, 7, "#65736f"));
  });
  commands.push(pdfLine(left, bottom, right, bottom, "#10201d", 1));

  if (!rows.length) {
    commands.push(pdfText("Sin movimientos para graficar.", x + 170, y + height / 2, 9, "#65736f", true));
    return;
  }

  const step = (right - left) / rows.length;
  rows.forEach((row, index) => {
    const centerX = left + step * index + step / 2;
    const inflow = row.income + row.investment;
    const outflow = row.expenses;
    const high = Math.max(inflow, outflow);
    const low = Math.min(inflow, outflow);
    const highY = yScale(high);
    const lowY = yScale(low);
    const bodyWidth = Math.min(24, Math.max(10, step * 0.34));
    const bodyHeight = Math.max(5, Math.abs(highY - lowY));
    const color = inflow >= outflow ? "#0f766e" : "#d95f43";

    commands.push(pdfLine(centerX, lowY, centerX, highY, color, 2));
    commands.push(
      pdfRect(centerX - bodyWidth / 2, Math.min(highY, lowY), bodyWidth, bodyHeight, {
        fill: color,
        stroke: null,
      }),
    );
    commands.push(pdfText(row.date.slice(5), centerX - 11, y + 11, 7, "#65736f"));
  });
}

function buildExecutiveReportPage(projectId = summaryProjectId()) {
  const scope = reportScope(projectId);
  const financeItems = typeReportItems(scope.movements);
  const budgetItems = budgetReportItems(scope.projects);
  const adminTotals = administrationTotals(scope.movements);
  const activeProjects = scope.projects.filter((project) => project.status !== "Archivado").length;
  const cardWidth = 172;
  const cardHeight = 54;
  const gap = 12;
  const startX = 36;
  const startY = 650;
  const cards = [
    ["Presupuesto", money(scope.current.budget), PIE_COLORS[0]],
    ["Ingresos", money(scope.current.income), PIE_COLORS[1]],
    ["Inversiones", money(scope.current.investment), PIE_COLORS[2]],
    ["Gastos", money(scope.current.expenses), PIE_COLORS[3]],
    ["Balance", money(scope.current.balance), "#10201d"],
    ["Proyectos", String(activeProjects), "#5b7f67"],
    ["Socios", String(scope.partners.length), "#7c5c9e"],
    ["Inventario", money(scope.inventoryValue), "#315f9f"],
    ["Pendiente", money(adminTotals.pending), "#d95f43"],
  ];
  const commands = [
    pdfRect(0, 0, 612, 792, { fill: "#f6f8f5", stroke: null }),
    pdfText("ProN", 36, 754, 20, "#10201d", true),
    pdfText(`Informe ejecutivo - ${scope.label}`, 36, 734, 11, "#65736f"),
    pdfText(`Generado ${new Date().toLocaleString("es-EC")}`, 398, 754, 8, "#65736f"),
    pdfLine(36, 720, 576, 720, "#dbe3df", 1),
  ];

  cards.forEach((card, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    drawPdfMetricCard(
      commands,
      startX + column * (cardWidth + gap),
      startY - row * (cardHeight + gap),
      cardWidth,
      cardHeight,
      card[0],
      card[1],
      card[2],
    );
  });

  commands.push(pdfRect(36, 330, 252, 142, { fill: "#ffffff", stroke: "#dbe3df" }));
  commands.push(pdfText("Pastel financiero", 52, 452, 11, "#10201d", true));
  drawPdfPie(commands, 106, 392, 46, financeItems);
  drawPdfLegend(commands, 166, 420, financeItems);

  commands.push(pdfRect(324, 330, 252, 142, { fill: "#ffffff", stroke: "#dbe3df" }));
  commands.push(pdfText("Pastel de presupuesto", 340, 452, 11, "#10201d", true));
  drawPdfPie(commands, 394, 392, 46, budgetItems);
  drawPdfLegend(commands, 454, 420, budgetItems);

  commands.push(pdfText("Velas de flujo por fecha", 36, 310, 12, "#10201d", true));
  drawPdfCandleChart(commands, 36, 142, 540, 150, scope.movements);

  commands.push(pdfText("Indicadores por proyecto", 36, 122, 12, "#10201d", true));
  commands.push(pdfRect(36, 42, 540, 70, { fill: "#ffffff", stroke: "#dbe3df" }));
  drawPdfBudgetBars(commands, 52, 52, 508, 48, scope.projects);
  commands.push(pdfText("Pagina 1 - cuadros, pasteles, velas e indicadores", 36, 22, 8, "#65736f"));

  return commands.join("\n");
}

function buildReportPdf(projectId = summaryProjectId()) {
  const scope = reportScope(projectId);
  const streams = [
    buildExecutiveReportPage(projectId),
    ...buildTextPdfPages(
      `Detalle completo - ${scope.label}`,
      buildReport(projectId),
      1,
    ),
  ];

  return createPdfFromStreams(streams);
}

function downloadReportPdf(projectId = summaryProjectId()) {
  const scope = reportScope(projectId);
  downloadBlob(buildReportPdf(projectId), `pron-informe-${safeFileName(scope.label)}.pdf`);
}

function downloadScopeReport() {
  downloadReportPdf(summaryProjectId());
}

function downloadProjectReport(projectId) {
  downloadReportPdf(projectId);
}

function downloadMovementReceipt(movementId) {
  const movement = state.data.movements.find((item) => item.id === movementId);
  if (!movement) {
    return;
  }
  downloadPdf(
    `pron-movimiento-${safeFileName(movement.concept)}.pdf`,
    "ProN - Comprobante de movimiento",
    [
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
  downloadPdf(
    `pron-socio-${safeFileName(partner.name)}.pdf`,
    "ProN - Ficha de socio",
    [
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
  downloadPdf(
    `pron-inventario-${safeFileName(item.item)}.pdf`,
    "ProN - Ficha de inventario",
    [
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
  downloadPdf(
    `pron-usuario-${safeFileName(user.name)}.pdf`,
    "ProN - Ficha de usuario",
    [
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
    return false;
  }

  submitAction(action, payload, successMessage);
  return true;
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
  $("#detailMovementForm").elements.type.addEventListener("change", renderCategorySelects);
  $("#detailAdminForm").elements.type.addEventListener("change", renderCategorySelects);
  $("#backToProjectsButton").addEventListener("click", () => setActiveView("proyectos"));
  $("#detailPdfButton").addEventListener("click", () => {
    downloadProjectReport(state.detailProjectId || state.selectedProjectId);
  });
  $("#adminPdfButton").addEventListener("click", () => {
    downloadProjectReport(state.detailProjectId || state.selectedProjectId);
  });
  $("#detailCsvButton").addEventListener("click", () => {
    const projectId = state.detailProjectId || state.selectedProjectId;
    downloadText(
      `movimientos-${safeFileName(projectName(projectId))}.csv`,
      "text/csv;charset=utf-8",
      buildCsv(projectId),
    );
  });
  $("#detailArchiveButton").addEventListener("click", () => {
    const project = projectById(state.detailProjectId || state.selectedProjectId);
    if (!project) {
      return;
    }
    updateProjectStatus(
      project.id,
      projectStatus(project) === "Archivado" ? "En revision" : "Archivado",
    );
  });
  $("#detailDeleteButton").addEventListener("click", () => {
    const project = projectById(state.detailProjectId || state.selectedProjectId);
    if (!project) {
      return;
    }
    if (confirmDelete(
      `Eliminar ${project.name} y sus registros vinculados?`,
      "delete-project",
      { projectId: project.id },
      "Proyecto eliminado.",
    )) {
      setActiveView("proyectos");
    }
  });

  $$("nav button").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveView(button.dataset.tab);
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
      "Proyecto creado.",
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
      "Movimiento guardado.",
    );
    event.currentTarget.reset();
    event.currentTarget.elements.movementDate.value = today();
  });

  $("#detailMovementForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.currentTarget);
    submitAction(
      "create-movement",
      {
        ...data,
        projectId: state.detailProjectId || state.selectedProjectId,
        amount: numberValue(data.amount),
      },
      "Movimiento guardado.",
    );
    event.currentTarget.reset();
    event.currentTarget.elements.movementDate.value = today();
    renderCategorySelects();
  });

  $("#detailStatusForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const project = projectById(state.detailProjectId || state.selectedProjectId);
    const data = formData(event.currentTarget);

    if (!project) {
      return;
    }

    updateProjectStatus(project.id, data.status);
    if (ADMIN_READY_STATUSES.has(data.status)) {
      scrollToAdminArea();
    }
  });

  $("#detailAdminForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const project = projectById(state.detailProjectId || state.selectedProjectId);

    if (!project || !canAdministrate(project)) {
      setMessage("Primero cambia el estado del proyecto a Aprobado, Negocio activo o En funcion.", "warning");
      return;
    }

    const data = formData(event.currentTarget);
    submitAction(
      "create-movement",
      {
        ...data,
        projectId: project.id,
        amount: numberValue(data.amount),
      },
      "Registro administrativo guardado.",
    );
    event.currentTarget.reset();
    event.currentTarget.elements.movementDate.value = today();
    event.currentTarget.elements.status.value = "Pagado";
    renderCategorySelects();
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
      "Socio guardado.",
    );
    event.currentTarget.reset();
  });

  $("#detailPartnerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.currentTarget);
    submitAction(
      "create-partner",
      {
        ...data,
        projectId: state.detailProjectId || state.selectedProjectId,
        contribution: numberValue(data.contribution),
        participation: numberValue(data.participation),
      },
      "Socio guardado.",
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
      "Inventario actualizado.",
    );
    event.currentTarget.reset();
  });

  $("#detailInventoryForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.currentTarget);
    submitAction(
      "create-inventory",
      {
        ...data,
        projectId: state.detailProjectId || state.selectedProjectId,
        quantity: numberValue(data.quantity),
        unitCost: numberValue(data.unitCost),
      },
      "Inventario actualizado.",
    );
    event.currentTarget.reset();
    renderCategorySelects();
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
      "Usuario agregado.",
    );
    event.currentTarget.reset();
  });

  $("#detailUserForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.currentTarget);
    submitAction(
      "create-user",
      {
        ...data,
        projectId: state.detailProjectId || state.selectedProjectId,
      },
      "Usuario agregado.",
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
  $("#exportPdfButton").addEventListener("click", () => {
    downloadScopeReport();
  });
}

function init() {
  bindEvents();
  $("#movementForm").elements.movementDate.value = today();
  $("#detailMovementForm").elements.movementDate.value = today();
  $("#detailAdminForm").elements.movementDate.value = today();
  checkBackend();
  resumeSession();
}

init();
