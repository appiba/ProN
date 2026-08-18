const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzf1TjxIBrBNJ6fTY5NNciAlWCl0PFKYgCpRXcdRg2S9aYKjMqDxeVCgC1JlcZet8iLNA/exec";
const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1KCzz2B59PN3IvcyM2_G2uvTi8nA759oV7rUsaXvrcSY/edit?gid=0#gid=0";
const TOKEN_KEY = "pron_session_token";
const SESSION_USER_KEY = "pron_session_user";
const CLEAN_START_VERSION = "pron-clean-start-20260803-v1";
const LOCAL_DB_KEY = "pron_local_database_clean_v1";
const LOCAL_TOKEN_PREFIX = "local-";
const SUPERADMIN_EMAIL_SHA256 =
  "88e0ce076c34f4b41124bf348680fcaf025f8bda0e1e13ad7339be6d6f359cec";
const PASSWORD_SALT = "pron-apps-script-password-v1";
const SUPERADMIN_PASSWORD_SHA256 =
  "105682a7333783a9e62bee3a503321582a8df6b9ca899512c1f8f53c3b59803f";
const USER_PASSWORD_SALT = "pron-user-password-v1";
const JSONP_TIMEOUT_MS = 15000;
const BACKGROUND_SYNC_DELAY_MS = 50;
const SUMMARY_ALL = "__all__";
const PIE_COLORS = ["#0f766e", "#315f9f", "#f2b84b", "#d95f43", "#5b7f67", "#7c5c9e"];
const MOVEMENT_CATEGORIES = {
  Gasto: [
    "Operacion",
    "Administracion",
    "Pago",
    "Cuentas por pagar",
    "Proveedor",
    "Venue / permisos",
    "Seguridad / salud",
    "Infraestructura publico",
    "Produccion tecnica fiesta",
    "Branding / ambientacion",
    "Barras y control de consumo",
    "Administracion / logistica",
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
    "Venta entradas",
    "Venta barra",
    "Auspicios / marcas",
    "Ticketing",
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
  "Evento en marcha",
  "Negocio activo",
  "En funcion",
  "Archivado",
];
const ADMIN_READY_STATUSES = new Set([
  "Aprobado",
  "Inversion completada",
  "Evento en marcha",
  "Negocio activo",
  "En funcion",
]);
const PAYMENT_OPEN_STATUSES = new Set(["Pendiente", "Programado", "Vence pronto", "Cotizado", "Proyectado"]);
const PAYMENT_CLOSED_STATUSES = new Set(["Registrado", "Pagado", "Aprobado", "Cobrado"]);
const FORECAST_STATUSES = new Set(["Cotizado", "Proyectado", "Programado", "Pendiente", "Vence pronto"]);
const EVENT_STATUS = "Evento en marcha";
const IVA_RATE = 0.15;
const CONTINGENCY_RATE = 0.05;
const VINILOS_PROJECT_ID = "pro-vinilos-estimacion";
const PERRO_NEGRO_PROJECT_ID = "pro-db533379-0c00-4ef4-9602-5c164a15b31c";
const EVENT_REFERENCE_ASSETS = [
  {
    match: ["perro negro"],
    title: "Resumen financiero Ibarra",
    src: "public/perro-negro/ibarra-resumen.png",
  },
  {
    match: ["perro negro"],
    title: "Presupuesto detallado 1",
    src: "public/perro-negro/ibarra-presupuesto-1.png",
  },
  {
    match: ["perro negro"],
    title: "Presupuesto detallado 2",
    src: "public/perro-negro/ibarra-presupuesto-2.png",
  },
  {
    match: ["perro negro"],
    title: "Escenarios y reparto",
    src: "public/perro-negro/ibarra-escenarios.png",
  },
];

const fallbackData = {
  settings: {
    cleanStartVersion: CLEAN_START_VERSION,
    language: "es",
    country: "Ecuador",
    currency: "USD",
    timezone: "America/Guayaquil",
    moneyFormat: "$1.250,00",
    dateFormat: "DD/MM/AAAA",
  },
  projects: [],
  movements: [],
  partners: [],
  inventory: [],
  users: [
    {
      id: "usr-owner",
      name: "Administrador General",
      username: "superadmin",
      role: "Superadministrador",
      status: "Activo",
      projectId: null,
      createdAt: "2026-08-03",
    },
  ],
  audit: [],
};

const state = {
  token: sessionStorage.getItem(TOKEN_KEY) || "",
  user: null,
  data: loadLocalData(),
  activeTab: "resumen",
  selectedProjectId: fallbackData.projects[0]?.id || "",
  detailProjectId: "",
  summaryScopeId: SUMMARY_ALL,
  search: "",
  busy: false,
  backend: "checking",
  loginSyncId: 0,
  loginCredentials: null,
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

function percentLabel(value) {
  return `${numberValue(value).toLocaleString("es-EC", {
    maximumFractionDigits: 2,
  })}%`;
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

function partnerById(partnerId) {
  return state.data.partners.find((partner) => partner.id === partnerId) || null;
}

function partnerName(partnerId) {
  if (!partnerId) {
    return "Sin socio";
  }

  return partnerById(partnerId)?.name || "Socio eliminado";
}

function projectPartners(projectId) {
  if (!projectId) {
    return [];
  }

  return state.data.partners.filter((partner) => partner.projectId === projectId);
}

function activePartnerProjectId() {
  const candidates = [
    sessionProjectId(),
    state.activeTab === "proyecto-detalle" ? state.detailProjectId : "",
    state.activeTab === "socios" ? partnerFormProjectId() : "",
    summaryProjectId(),
    state.selectedProjectId,
    state.detailProjectId,
  ];

  return candidates.find((projectId) => projectId && canAccessProject(projectId) && projectById(projectId)) || "";
}

function activeProjectPartners() {
  const projectId = activePartnerProjectId();
  return projectId ? projectPartners(projectId) : [];
}

function projectParticipationStats(projectId, excludePartnerId = "") {
  const partners = projectPartners(projectId).filter(
    (partner) => partner.id !== excludePartnerId && partner.status !== "Retirado",
  );
  const assigned = partners.reduce((sum, partner) => sum + numberValue(partner.participation), 0);
  const contribution = partners.reduce((sum, partner) => sum + numberValue(partner.contribution), 0);
  const budget = numberValue(projectById(projectId)?.budget);

  return {
    assigned,
    remaining: Math.max(0, 100 - assigned),
    over: Math.max(0, assigned - 100),
    contribution,
    budget,
    budgetGap: Math.max(0, budget - contribution),
    surplus: Math.max(0, contribution - budget),
  };
}

function projectInitialBudget(project) {
  return numberValue(project?.initialBudget || project?.budget);
}

function partnerStats(partnerId) {
  const movements = state.data.movements.filter((movement) => movement.partnerId === partnerId);
  const income = movements
    .filter((movement) => movement.type === "Ingreso")
    .reduce((sum, movement) => sum + numberValue(movement.amount), 0);
  const expenses = movements
    .filter((movement) => movement.type === "Gasto")
    .reduce((sum, movement) => sum + numberValue(movement.amount), 0);
  const investment = movements
    .filter((movement) => movement.type === "Inversion")
    .reduce((sum, movement) => sum + numberValue(movement.amount), 0);
  const partner = partnerById(partnerId);
  const contribution = numberValue(partner?.contribution);

  return {
    movements,
    income,
    expenses,
    investment,
    contribution,
    movementBalance: income + investment - expenses,
    totalAvailable: contribution + income + investment - expenses,
  };
}

function isForecastMovement(movement) {
  return FORECAST_STATUSES.has(movement?.status || "");
}

function normalizedSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function eventReferenceAssets(project) {
  const target = normalizedSearchText(
    `${project?.name || ""} ${project?.type || ""} ${project?.objective || ""}`,
  );

  return EVENT_REFERENCE_ASSETS.filter((asset) =>
    asset.match.every((piece) => target.includes(piece)),
  );
}

function isEventProject(project) {
  if (!project) {
    return false;
  }

  const type = normalizedSearchText(project.type);
  const status = projectStatus(project);
  const eventCategory = state.data.movements.some((movement) => {
    if (movement.projectId !== project.id) {
      return false;
    }

    const category = normalizedSearchText(movement.category);
    return (
      category.includes("venue") ||
      category.includes("barra") ||
      category.includes("ticket") ||
      category.includes("auspicio") ||
      category.includes("produccion tecnica")
    );
  });

  return type.includes("evento") || status === EVENT_STATUS || eventCategory;
}

function sumMovements(movements, type, predicate = () => true) {
  return movements
    .filter((movement) => movement.type === type && predicate(movement))
    .reduce((sum, movement) => sum + numberValue(movement.amount), 0);
}

function eventGroupedRows(movements, type) {
  const grouped = new Map();

  movements
    .filter((movement) => movement.type === type)
    .forEach((movement) => {
      const key = movement.category || "Sin categoria";
      const current = grouped.get(key) || {
        type,
        category: key,
        total: 0,
        projected: 0,
        real: 0,
        count: 0,
      };
      const value = numberValue(movement.amount);
      current.total += value;
      current.count += 1;
      if (isForecastMovement(movement)) {
        current.projected += value;
      } else {
        current.real += value;
      }
      grouped.set(key, current);
    });

  return [...grouped.values()].sort((a, b) => b.total - a.total);
}

function eventRowsStatus(row) {
  if (!row.count) {
    return "Sin registros";
  }
  if (row.projected && row.real) {
    return "Mixto";
  }
  return row.projected ? "Proyectado" : "Real";
}

function eventFinancialSummary(project, movements, partners) {
  const budget = numberValue(project?.budget);
  const expenseRows = movements.filter((movement) => movement.type === "Gasto");
  const incomeRows = movements.filter((movement) => movement.type === "Ingreso");
  const investmentRows = movements.filter((movement) => movement.type === "Inversion");
  const expenses = sumMovements(movements, "Gasto");
  const realExpenses = sumMovements(movements, "Gasto", (movement) => !isForecastMovement(movement));
  const plannedExpenses = sumMovements(movements, "Gasto", isForecastMovement);
  const incomeExpected = sumMovements(movements, "Ingreso");
  const incomeReal = sumMovements(movements, "Ingreso", (movement) => !isForecastMovement(movement));
  const investment = sumMovements(movements, "Inversion");
  const costTarget = Math.max(budget, expenses);
  const subtotalNoIva = costTarget / (1 + IVA_RATE);
  const ivaEstimated = costTarget - subtotalNoIva;
  const contingency = subtotalNoIva * CONTINGENCY_RATE;
  const profitExpected = incomeExpected - costTarget;
  const profitReal = incomeReal - realExpenses;
  const marginExpected = incomeExpected ? (profitExpected / incomeExpected) * 100 : 0;
  const breakeven = costTarget ? (incomeExpected / costTarget) * 100 : 0;
  const revenueGap = Math.max(0, costTarget - incomeExpected);
  const breakevenAmount = costTarget;
  const breakevenStatus = revenueGap ? "Pendiente" : "Cubierto";
  const partnerContribution = partners.reduce((sum, partner) => sum + numberValue(partner.contribution), 0);
  const capitalBase = Math.max(partnerContribution, investment);
  const scenarioBase = incomeExpected || costTarget;
  const scenarios = [
    { label: "Conservador", ratio: 0.85, note: "venta por debajo de la base" },
    { label: "Base realista", ratio: 1, note: incomeExpected ? "venta esperada registrada" : "sin venta esperada cargada" },
    { label: "Optimista", ratio: 1.15, note: "mejor desempeno comercial" },
  ].map((scenario) => {
    const revenue = scenarioBase * scenario.ratio;
    const utility = revenue - costTarget;
    return {
      ...scenario,
      revenue,
      utility,
      margin: revenue ? (utility / revenue) * 100 : 0,
    };
  });

  return {
    budget,
    expenseRows,
    incomeRows,
    investmentRows,
    expenses,
    realExpenses,
    plannedExpenses,
    incomeExpected,
    incomeReal,
    investment,
    costTarget,
    subtotalNoIva,
    ivaEstimated,
    contingency,
    profitExpected,
    profitReal,
    marginExpected,
    breakeven,
    revenueGap,
    breakevenAmount,
    breakevenStatus,
    partnerContribution,
    capitalBase,
    scenarios,
    partners,
    costRows: eventGroupedRows(movements, "Gasto"),
    incomeRowsByCategory: eventGroupedRows(movements, "Ingreso"),
  };
}

function validatePartnerParticipation(projectId, participation, excludePartnerId = "") {
  const requested = numberValue(participation);
  const current = projectParticipationStats(projectId, excludePartnerId);
  const totalAfter = current.assigned + requested;

  if (requested < 0) {
    setMessage("La participacion no puede ser negativa.", "warning");
    return false;
  }

  if (totalAfter > 100.0001) {
    setMessage(
      `No se puede guardar: disponible ${percentLabel(current.remaining)} y estas intentando agregar ${percentLabel(requested)}. Excedente ${percentLabel(totalAfter - 100)}.`,
      "warning",
    );
    return false;
  }

  return true;
}

function accessName(projectId) {
  return projectId ? projectName(projectId) : "Todos los proyectos";
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
  if (status === EVENT_STATUS || status === "En funcion" || status === "Negocio activo") {
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
  const userProjectId = sessionProjectId();
  if (userProjectId && projectId !== userProjectId) {
    return false;
  }

  const scopedId = summaryProjectId();
  return !scopedId || projectId === scopedId;
}

function sessionProjectId() {
  if (!state.user || state.user.role === "Superadministrador") {
    return "";
  }

  return state.user.projectId || "";
}

function canAccessProject(projectId) {
  const scopedId = sessionProjectId();
  return !scopedId || projectId === scopedId;
}

function accessibleProjects() {
  return state.data.projects.filter((project) => canAccessProject(project.id));
}

function scopedProjects() {
  const scopedId = summaryProjectId();
  const projects = accessibleProjects();
  return scopedId
    ? projects.filter((project) => project.id === scopedId)
    : projects;
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

function applySessionScope() {
  const scopedId = sessionProjectId();
  const projects = accessibleProjects();

  if (scopedId) {
    state.selectedProjectId = scopedId;
    state.summaryScopeId = scopedId;
    return;
  }

  if (!projects.some((project) => project.id === state.selectedProjectId)) {
    state.selectedProjectId = projects[0]?.id || "";
  }

  if (
    state.summaryScopeId !== SUMMARY_ALL &&
    !projects.some((project) => project.id === state.summaryScopeId)
  ) {
    state.summaryScopeId = SUMMARY_ALL;
  }
}

function requireSelectedProject(
  message = "Crea primero un proyecto para registrar informacion.",
  projectId = state.selectedProjectId,
) {
  if (projectId) {
    return true;
  }

  setMessage(message, "warning");
  return false;
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
    badge.textContent = tone === "local" ? "Datos de este navegador" : tone === "error" ? "Sin respaldo central" : label;
    badge.className = `connection-badge ${tone}`;
  }

  const pill = document.querySelector("#syncPill");
  if (pill) {
    pill.textContent = tone === "local" ? "Equipo" : "Activo";
    pill.className = `pill ${tone === "local" ? "warning" : ""}`;
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
  updateConnection(
    isLocalSession() ? "Datos de este navegador" : "Sistema activo",
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

function ownerSession(emailHash) {
  return {
    token: `${LOCAL_TOKEN_PREFIX}${emailHash.slice(0, 24)}`,
    user: {
      name: "Administrador General",
      username: "superadmin",
      role: "Superadministrador",
      access: "Completo",
      projectId: null,
    },
  };
}

function userSession(user, loginHash) {
  return {
    token: `${LOCAL_TOKEN_PREFIX}usr-${loginHash.slice(0, 20)}`,
    user: {
      name: user.name,
      username: user.username,
      role: user.role || "Invitado",
      access: user.projectId ? projectName(user.projectId) : "Todos los proyectos",
      projectId: user.projectId || null,
    },
  };
}

function enterDashboardNow(session) {
  state.token = session.token;
  state.user = session.user;
  sessionStorage.setItem(TOKEN_KEY, session.token);
  sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(session.user));
  $("#loginForm").reset();
  $("#rememberInput").checked = true;
  showDashboard();
  setMessage("Panel listo.");
  updateConnection(
    isLocalSession() ? "Datos de este navegador" : "Sistema activo",
    isLocalSession() ? "local" : "ok",
  );
}

function localUserByCredentials(loginHash, passwordHash) {
  return state.data.users.find(
    (user) =>
      user.role !== "Superadministrador" &&
      user.status === "Activo" &&
      user.loginHash === loginHash &&
      user.passwordHash === passwordHash,
  );
}

function userLoginExists(loginHash) {
  return state.data.users.some(
    (user) => user.loginHash === loginHash || user.emailHash === loginHash,
  );
}

function syncLoginInBackground(credentials, syncId) {
  window.setTimeout(async () => {
    const localSnapshot = normalizeData(cloneData(state.data));

    try {
      const result = await callBackend(
        "login",
        {
          emailHash: credentials.emailHash,
          loginHash: credentials.loginHash,
          passwordHash: credentials.passwordHash,
          remember: credentials.remember,
        },
        false,
      );

      if (syncId !== state.loginSyncId || !state.user) {
        return;
      }

      state.token = result.token;
      state.user = result.user || state.user;
      sessionStorage.setItem(TOKEN_KEY, result.token);
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(state.user));

      const dataResult = await callBackend("get-data");
      if (syncId !== state.loginSyncId || !state.user) {
        return;
      }

      const currentProjectId = state.selectedProjectId;
      state.user = dataResult.user || state.user;
      let remoteData = normalizeRemoteData(dataResult.data);
      if (!remoteData) {
        state.backend = "ready";
        saveLocalData();
        render();
        updateConnection("Sistema activo", "ok");
        return;
      }

      remoteData = await mergeLocalSnapshotIfNeeded(localSnapshot, remoteData);
      state.data = remoteData;
      state.selectedProjectId = state.data.projects.some((project) => project.id === currentProjectId)
        ? currentProjectId
        : state.data.projects[0]?.id || "";
      state.backend = "ready";
      saveLocalData();
      render();
      updateConnection("Sistema activo", "ok");
    } catch {
      if (syncId === state.loginSyncId) {
        state.backend = "retry";
        updateConnection("Datos de este navegador", "local");
      }
    }
  }, BACKGROUND_SYNC_DELAY_MS);
}

async function login(event) {
  event.preventDefault();
  setLoginMessage("");
  setBusy(true);
  const loginValue = $("#emailInput").value.trim().toLowerCase();
  const loginHash = await sha256Hex(loginValue);
  const ownerPasswordHash = await sha256Hex(`${$("#passwordInput").value}:${PASSWORD_SALT}`);
  const userPasswordHash = await sha256Hex(`${$("#passwordInput").value}:${USER_PASSWORD_SALT}`);
  const remember = $("#rememberInput").checked;

  if (
    loginHash === SUPERADMIN_EMAIL_SHA256 &&
    ownerPasswordHash === SUPERADMIN_PASSWORD_SHA256
  ) {
    setLoginMessage("Clave correcta. Entrando...");
    state.loginCredentials = {
      emailHash: loginHash,
      loginHash,
      passwordHash: ownerPasswordHash,
      remember,
    };
    state.loginSyncId += 1;
    const syncId = state.loginSyncId;
    enterDashboardNow(ownerSession(loginHash));
    setBusy(false);
    syncLoginInBackground(state.loginCredentials, syncId);
    return;
  }

  const localUser = localUserByCredentials(loginHash, userPasswordHash);
  if (localUser) {
    setLoginMessage("Clave correcta. Entrando...");
    state.loginSyncId += 1;
    enterDashboardNow(userSession(localUser, loginHash));
    setBusy(false);
    return;
  }

  try {
    const result = await callBackend(
      "login",
      {
        loginHash,
        passwordHash: userPasswordHash,
        remember,
      },
      false,
    );
    state.token = result.token;
    state.user = result.user;
    sessionStorage.setItem(TOKEN_KEY, result.token);
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(state.user));
    const dataResult = await callBackend("get-data");
    const remoteData = normalizeRemoteData(dataResult.data);
    if (remoteData) {
      state.data = remoteData;
      saveLocalData();
    }
    $("#loginForm").reset();
    showDashboard();
    setMessage("Panel listo.");
    setBusy(false);
  } catch {
    setLoginMessage("Credenciales invalidas.");
    setBusy(false);
  }
}

async function refreshData() {
  if (isLocalSession()) {
    if (!state.loginCredentials) {
      setMessage(
        "Estos datos estan guardados en este navegador. Para verlos en otro equipo, entra de nuevo y pulsa Actualizar cuando el sistema central este disponible.",
        "warning",
      );
      updateConnection("Datos de este navegador", "local");
      render();
      return;
    }

    const localSnapshot = normalizeData(cloneData(state.data));
    setBusy(true);
    setMessage("Guardando datos para que se vean tambien al abrir el link en otro lado...");
    updateConnection("Actualizando", "checking");

    try {
      const loginResult = await callBackend("login", state.loginCredentials, false);
      state.token = loginResult.token;
      state.user = loginResult.user || state.user;
      sessionStorage.setItem(TOKEN_KEY, state.token);
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(state.user));

      const dataResult = await callBackend("get-data");
      let remoteData = normalizeRemoteData(dataResult.data);
      remoteData = await mergeLocalSnapshotIfNeeded(localSnapshot, remoteData);

      if (remoteData) {
        state.data = remoteData;
        saveLocalData();
      }

      state.backend = "ready";
      setMessage("Datos guardados para compartirlos desde el link.");
      updateConnection("Sistema activo", "ok");
      render();
    } catch {
      setMessage(
        "No se pudo guardar en el respaldo central todavia. Tus datos siguen aqui en este navegador.",
        "warning",
      );
      updateConnection("Datos de este navegador", "local");
    } finally {
      setBusy(false);
    }
    return;
  }

  setBusy(true);
  setMessage("Actualizando informacion...");
  updateConnection("Actualizando", "checking");

  try {
    const result = await callBackend("get-data");
    const remoteData = normalizeRemoteData(result.data);
    if (!remoteData) {
      state.backend = "ready";
      setMessage("Panel limpio listo.");
      updateConnection("Sistema activo", "ok");
      render();
      return;
    }

    state.data = remoteData;
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
    state.user = loadSessionUser();
    showDashboard();
    setMessage("Panel listo.");
    updateConnection("Sistema activo", "ok");
    checkBackend();
    return;
  }

  try {
    const result = await callBackend("get-data");
    state.user = result.user || {
      name: "Administrador General",
      username: "superadmin",
      role: "Superadministrador",
      access: "Completo",
      projectId: null,
    };
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(state.user));
    const remoteData = normalizeRemoteData(result.data);
    if (remoteData) {
      state.data = remoteData;
    }
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
    if (!isLocalSession()) {
      try {
        const mergeResult = await callBackend("merge-local-data", {
          data: normalizeData(cloneData(state.data)),
        });
        const mergedData = normalizeRemoteData(mergeResult.data);
        if (mergedData) {
          state.data = mergedData;
          saveLocalData();
        }
        state.backend = "ready";
        setMessage(`${successMessage} Datos guardados en el respaldo central.`);
        updateConnection("Sistema activo", "ok");
        render();
        return;
      } catch {
        // Keep the local copy and show the manual sync message below.
      }
    }
    setMessage(
      `${successMessage} Quedo guardado en este navegador; pulsa Actualizar para compartirlo desde el link cuando el sistema central responda.`,
      "warning",
    );
    updateConnection("Datos de este navegador", "local");
    render();
    setBusy(false);
    return;
  }

  setBusy(true);

  try {
    const result = await callBackend(action, payload);
    const remoteData = normalizeRemoteData(result.data);
    if (remoteData) {
      state.data = remoteData;
    } else {
      applyLocalAction(action, payload);
      saveLocalData();
    }
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
    if (isValidationError(error)) {
      setMessage(error.message, "warning");
      updateConnection("Sistema activo", "ok");
      render();
      return;
    }
    if (action === "update-movement") {
      try {
        const remoteData = await legacyReplaceMovement(payload);
        if (remoteData) {
          state.data = remoteData;
          state.backend = "ready";
          setMessage(successMessage);
          updateConnection("Sistema activo", "ok");
          render();
          return;
        }
      } catch {
        // Continue with the local safety copy below.
      }
    }
    applyLocalAction(action, payload);
    saveLocalData();
    setMessage(
      `${successMessage} Quedo guardado en este navegador; pulsa Actualizar para compartirlo desde el link cuando el sistema central responda.`,
      "warning",
    );
    updateConnection("Datos de este navegador", "local");
    render();
  } finally {
    setBusy(false);
  }
}

function isValidationError(error) {
  return /obligatori|positivo|participacion|supera 100/i.test(error?.message || "");
}

function isLocalSession() {
  return state.token.startsWith(LOCAL_TOKEN_PREFIX);
}

function loadSessionUser() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_USER_KEY) || "");
  } catch {
    return {
      name: "Administrador General",
      username: "superadmin",
      role: "Superadministrador",
      access: "Completo",
      projectId: null,
    };
  }
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
        initialBudget: numberValue(payload.budget),
        lastBudgetReason: payload.reason || "Presupuesto inicial",
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

  if (action === "update-project") {
    const previous = projectById(payload.projectId);
    const nextBudget = numberValue(payload.budget);
    state.data.projects = state.data.projects.map((project) =>
      project.id === payload.projectId
        ? {
            ...project,
            name: payload.name || project.name,
            type: payload.type || project.type,
            status: PROJECT_STATUSES.includes(payload.status) ? payload.status : project.status,
            budget: nextBudget,
            initialBudget: projectInitialBudget(project),
            lastBudgetReason: payload.reason || project.lastBudgetReason || "",
            objective: payload.objective || project.objective,
            updatedAt: today(),
          }
        : project,
    );
    addAudit(
      "Proyecto actualizado",
      `${previous?.name || "Proyecto"}: presupuesto ${money(previous?.budget)} -> ${money(nextBudget)}. ${payload.reason || ""}`.trim(),
      payload.projectId,
    );
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
        partnerId: payload.partnerId || "",
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

  if (action === "update-movement") {
    const movementId = payload.movementId;
    const previous = state.data.movements.find((item) => item.id === movementId);
    state.data.movements = state.data.movements.map((movement) =>
      movement.id === movementId
        ? {
            ...movement,
            projectId: payload.projectId || movement.projectId,
            type: payload.type || movement.type,
            category: payload.category || movement.category,
            concept: payload.concept || movement.concept,
            amount: numberValue(payload.amount),
            movementDate: payload.movementDate || movement.movementDate,
            partnerId: payload.partnerId || "",
            status: payload.status || movement.status || "Registrado",
          }
        : movement,
    );
    addAudit(
      "Movimiento actualizado",
      `${payload.type || previous?.type || "Movimiento"}: ${payload.concept || previous?.concept || ""}.`,
      payload.projectId || previous?.projectId,
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
        status: payload.status || "Activo",
      },
      ...state.data.partners,
    ];
    addAudit("Socio agregado", `${payload.name} fue vinculado al proyecto.`, payload.projectId);
    return;
  }

  if (action === "update-partner") {
    const previous = partnerById(payload.partnerId);
    state.data.partners = state.data.partners.map((partner) =>
      partner.id === payload.partnerId
        ? {
            ...partner,
            projectId: payload.projectId || partner.projectId,
            name: payload.name || partner.name,
            type: payload.type || partner.type,
            contribution: numberValue(payload.contribution),
            participation: numberValue(payload.participation),
            status: payload.status || partner.status || "Activo",
          }
        : partner,
    );
    addAudit(
      payload.status === "Retirado" ? "Socio retirado" : "Socio actualizado",
      `${previous?.name || payload.name || "Socio"}: ${percentLabel(previous?.participation)} -> ${percentLabel(payload.participation)}.`,
      payload.projectId || previous?.projectId,
    );
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
        status: payload.status || "Disponible",
      },
      ...state.data.inventory,
    ];
    addAudit("Inventario agregado", `${payload.item} quedo registrado.`, payload.projectId);
    return;
  }

  if (action === "update-inventory") {
    const previous = state.data.inventory.find((entry) => entry.id === payload.inventoryId);
    state.data.inventory = state.data.inventory.map((item) =>
      item.id === payload.inventoryId
        ? {
            ...item,
            projectId: payload.projectId || item.projectId,
            item: payload.item || item.item,
            category: payload.category || item.category,
            quantity: numberValue(payload.quantity),
            unitCost: numberValue(payload.unitCost),
            status: payload.status || item.status || "Disponible",
          }
        : item,
    );
    addAudit("Inventario actualizado", `${previous?.item || payload.item || "Item"} fue actualizado.`, payload.projectId || previous?.projectId);
    return;
  }

  if (action === "create-user") {
    state.data.users = [
      {
        id: localId("usr"),
        name: payload.name,
        username: payload.username,
        loginHash: payload.loginHash,
        passwordHash: payload.passwordHash,
        role: payload.role || "Invitado",
        status: "Activo",
        projectId: payload.projectId || null,
        createdAt: today(),
      },
      ...state.data.users,
    ];
    addAudit("Usuario creado", `${payload.name} fue creado como ${payload.role}.`, payload.projectId || null);
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

function vinilosSeed() {
  const date = "2026-08-05";
  return {
    id: VINILOS_PROJECT_ID,
    name: "Vinilos",
    type: "Proyecto personalizado",
    country: "Ecuador",
    currency: "USD",
    timezone: "America/Guayaquil",
    status: "En revision",
    budget: 15000,
    initialBudget: 15000,
    lastBudgetReason: "Estimacion inicial",
    objective:
      "Estimacion inicial de Vinilos por $15.000. Pendiente completar presupuesto, socios, gastos e ingresos reales.",
    createdAt: date,
    updatedAt: date,
  };
}

function isVinilosProject(project) {
  const name = normalizedSearchText(project?.name);
  return name.includes("vinil");
}

function withVinilosSeed(data) {
  const seed = vinilosSeed();
  const currentVinilos = data.projects.find(
    (project) => project.id === VINILOS_PROJECT_ID || isVinilosProject(project),
  );
  const canonicalVinilos = currentVinilos
    ? {
        ...seed,
        ...currentVinilos,
        id: VINILOS_PROJECT_ID,
        initialBudget: numberValue(currentVinilos.initialBudget || seed.initialBudget),
      }
    : seed;
  const legacyVinilosIds = new Set(
    data.projects
      .filter((project) => project.id !== VINILOS_PROJECT_ID && isVinilosProject(project))
      .map((project) => project.id),
  );
  const isLegacyVinilosLinked = (projectId) => legacyVinilosIds.has(projectId);

  return {
    ...data,
    projects: [
      canonicalVinilos,
      ...data.projects.filter(
        (project) => project.id !== VINILOS_PROJECT_ID && !isVinilosProject(project),
      ),
    ],
    movements: data.movements.filter((movement) => !isLegacyVinilosLinked(movement.projectId)),
    partners: data.partners.filter((partner) => !isLegacyVinilosLinked(partner.projectId)),
    inventory: data.inventory.filter((item) => !isLegacyVinilosLinked(item.projectId)),
    users: data.users.map((user) =>
      isLegacyVinilosLinked(user.projectId)
        ? { ...user, projectId: VINILOS_PROJECT_ID }
        : user,
    ),
    audit: data.audit.filter((entry) => !isLegacyVinilosLinked(entry.projectId)),
  };
}

function perroNegroSeed(projectId = PERRO_NEGRO_PROJECT_ID) {
  const date = "2026-08-05";
  const project = {
    id: projectId,
    name: "Fiesta Perro Negro | Ibarra",
    type: "Evento",
    country: "Ecuador",
    currency: "USD",
    timezone: "America/Guayaquil",
    status: EVENT_STATUS,
    budget: 53487.15,
    initialBudget: 53487.15,
    lastBudgetReason: "Presupuesto original importado",
    objective:
      "Fiesta Perro Negro en Casa Blanca, Ibarra. Evento en marcha con control de venue, permisos, seguridad, produccion, barra, marketing, socios y utilidad.",
    createdAt: date,
    updatedAt: date,
  };
  const partners = [
    {
      id: "prt-perro-negro-socio-1",
      projectId,
      name: "Socio 1",
      type: "Socio",
      contribution: 13371.79,
      participation: 25,
      status: "Activo",
      createdAt: date,
    },
    {
      id: "prt-perro-negro-socio-2",
      projectId,
      name: "Socio 2",
      type: "Socio",
      contribution: 13371.79,
      participation: 25,
      status: "Activo",
      createdAt: date,
    },
    {
      id: "prt-perro-negro-180-producciones",
      projectId,
      name: "180 Producciones",
      type: "Socio",
      contribution: 26743.58,
      participation: 50,
      status: "Activo",
      createdAt: date,
    },
  ];
  const movements = [
    ["mov-perro-negro-venue-permisos", "Gasto", "Venue / permisos", "Locacion Casa Blanca, permisos, contingencia, mapa y seguro", 7410, "Cotizado", ""],
    ["mov-perro-negro-seguridad-salud", "Gasto", "Seguridad / salud", "Seguridad privada, supervision y ambulancia con paramedicos", 1845.75, "Cotizado", ""],
    ["mov-perro-negro-infraestructura-publico", "Gasto", "Infraestructura publico", "Banos portatiles, vallas, control de accesos y carpas de taquilla", 1196, "Cotizado", ""],
    ["mov-perro-negro-produccion-tecnica", "Gasto", "Produccion tecnica fiesta", "Artistas, sonido, iluminacion, pantalla, tarima, generador, DJ y operadores", 28112.5, "Cotizado", ""],
    ["mov-perro-negro-branding", "Gasto", "Branding / ambientacion", "Decoracion tematica Perro Negro y experiencia de marca", 1725, "Cotizado", ""],
    ["mov-perro-negro-marketing", "Gasto", "Marketing", "KV, pauta digital, influencers, foto video e impresos", 2185, "Cotizado", ""],
    ["mov-perro-negro-personal", "Gasto", "Personal", "Direccion de produccion, logistica, staff de barras y alimentacion", 3022.5, "Cotizado", ""],
    ["mov-perro-negro-barras-control", "Gasto", "Barras y control de consumo", "Montaje barra, sistema cashless, vasos, hielo e insumos base", 1897.5, "Cotizado", ""],
    ["mov-perro-negro-admin-logistica", "Gasto", "Administracion / logistica", "Administrativo, contable, cierre, transportes, bus de personal y hospedaje crew", 3395, "Cotizado", ""],
    ["mov-perro-negro-imprevistos", "Gasto", "Contingencia", "Imprevistos 5% sobre produccion incluida", 2697.9, "Proyectado", ""],
    ["mov-perro-negro-venta-entradas", "Ingreso", "Venta entradas", "Venta promedio / boleteria neta esperada", 46000, "Proyectado", ""],
    ["mov-perro-negro-venta-barra", "Ingreso", "Venta barra", "Barra neta esperada", 29900, "Proyectado", ""],
    ["mov-perro-negro-inversion-socio-1", "Inversion", "Capital de socios", "Inversion Socio 1 segun cuadro de socios 25%", 13371.79, "Registrado", "prt-perro-negro-socio-1"],
    ["mov-perro-negro-inversion-socio-2", "Inversion", "Capital de socios", "Inversion Socio 2 segun cuadro de socios 25%", 13371.79, "Registrado", "prt-perro-negro-socio-2"],
    ["mov-perro-negro-inversion-180", "Inversion", "Capital de socios", "Inversion 180 Producciones segun cuadro de socios 50%", 26743.58, "Registrado", "prt-perro-negro-180-producciones"],
  ].map(([id, type, category, concept, amount, status, partnerId]) => ({
    id,
    projectId,
    type,
    category,
    concept,
    amount,
    movementDate: date,
    status,
    partnerId,
    createdAt: date,
  }));

  return {
    project,
    partners,
    movements,
    audit: {
      id: "aud-perro-negro-import",
      action: "Evento cargado",
      detail: "Presupuesto Ibarra importado con costos, ingresos, socios y utilidad esperada.",
      actorRole: "Superadministrador",
      projectId,
      createdAt: date,
    },
  };
}

function hasEquivalentMovement(rows, seed) {
  return rows.some(
    (row) =>
      row.id === seed.id ||
      (row.projectId === seed.projectId &&
        row.type === seed.type &&
        normalizedSearchText(row.category) === normalizedSearchText(seed.category) &&
        normalizedSearchText(row.concept) === normalizedSearchText(seed.concept) &&
        Math.abs(numberValue(row.amount) - numberValue(seed.amount)) < 0.01),
  );
}

function withOfficialSeeds(data) {
  const baseData = withVinilosSeed(data);
  const existingProject = baseData.projects.find(
    (project) =>
      project.id === PERRO_NEGRO_PROJECT_ID ||
      normalizedSearchText(project.name).includes("perro negro"),
  );
  const projectId = existingProject?.id || PERRO_NEGRO_PROJECT_ID;
  const seed = perroNegroSeed(projectId);
  const projects = existingProject
    ? baseData.projects.map((project) =>
        project.id === projectId
          ? {
              ...seed.project,
              ...project,
              id: project.id,
              createdAt: project.createdAt || seed.project.createdAt,
              initialBudget: numberValue(project.initialBudget || seed.project.initialBudget),
            }
          : project,
      )
    : [seed.project, ...baseData.projects];
  const partners = [
    ...baseData.partners,
    ...seed.partners.filter(
      (partner) =>
        !baseData.partners.some(
          (row) =>
            row.id === partner.id ||
            (row.projectId === projectId &&
              normalizedSearchText(row.name) === normalizedSearchText(partner.name)),
        ),
    ),
  ];
  const movements = [
    ...baseData.movements,
    ...seed.movements.filter((movement) => !hasEquivalentMovement(baseData.movements, movement)),
  ];
  const audit = baseData.audit.some((entry) => entry.id === seed.audit.id)
    ? baseData.audit
    : [seed.audit, ...baseData.audit];

  return {
    ...baseData,
    projects,
    partners,
    movements,
    audit,
  };
}

function normalizeData(data) {
  const next = data || fallbackData;
  return withOfficialSeeds({
    settings: { ...fallbackData.settings, ...(next.settings || {}) },
    projects: (Array.isArray(next.projects) ? next.projects : []).map((project) => ({
      ...project,
      budget: numberValue(project.budget),
      initialBudget: numberValue(project.initialBudget || project.budget),
      lastBudgetReason: project.lastBudgetReason || "",
    })),
    movements: Array.isArray(next.movements) ? next.movements : [],
    partners: Array.isArray(next.partners) ? next.partners : [],
    inventory: Array.isArray(next.inventory) ? next.inventory : [],
    users: Array.isArray(next.users) ? next.users : [],
    audit: Array.isArray(next.audit) ? next.audit : [],
  });
}

function isCleanStartData(data) {
  return data?.settings?.cleanStartVersion === CLEAN_START_VERSION;
}

function isRemoteDataShape(data) {
  return Boolean(
    data &&
      typeof data === "object" &&
      ["projects", "movements", "partners", "inventory", "users"].some((key) =>
        Array.isArray(data[key]),
      ),
  );
}

function isGeneratedProjectId(projectId) {
  return String(projectId || "").startsWith("pro-");
}

function pruneLegacySeedRows(data) {
  const normalized = normalizeData(data);
  const projects = normalized.projects.filter((project) => isGeneratedProjectId(project.id));
  const projectIds = new Set(projects.map((project) => project.id));
  const belongsToRealProject = (projectId) =>
    isGeneratedProjectId(projectId) && (!projectIds.size || projectIds.has(projectId));

  return {
    ...normalized,
    settings: { ...normalized.settings, cleanStartVersion: CLEAN_START_VERSION },
    projects,
    movements: normalized.movements.filter((movement) =>
      belongsToRealProject(movement.projectId),
    ),
    partners: normalized.partners.filter((partner) =>
      belongsToRealProject(partner.projectId),
    ),
    inventory: normalized.inventory.filter((item) =>
      belongsToRealProject(item.projectId),
    ),
    users: normalized.users.filter(
      (user) =>
        user.role === "Superadministrador" ||
        Boolean(user.username) ||
        belongsToRealProject(user.projectId),
    ),
    audit: normalized.audit.filter(
      (entry) => !entry.projectId || isGeneratedProjectId(entry.projectId),
    ),
  };
}

function normalizeRemoteData(data) {
  if (!isCleanStartData(data) && !isRemoteDataShape(data)) {
    return null;
  }

  return pruneLegacySeedRows(data);
}

const SHARED_DATA_COLLECTIONS = ["projects", "movements", "partners", "inventory", "users", "audit"];

function collectionKey(row) {
  return String(row?.id || "");
}

function sharedRows(data, collection) {
  const rows = Array.isArray(data?.[collection]) ? data[collection] : [];

  if (collection === "users") {
    return rows.filter((row) => row.id !== "usr-owner");
  }

  return rows;
}

function countSharedRows(data) {
  return SHARED_DATA_COLLECTIONS.reduce(
    (sum, collection) => sum + sharedRows(data, collection).length,
    0,
  );
}

function hasLocalRowsMissing(localData, remoteData) {
  return SHARED_DATA_COLLECTIONS.some((collection) => {
    const remoteIds = new Set(sharedRows(remoteData, collection).map(collectionKey));
    return sharedRows(localData, collection).some((row) => {
      const id = collectionKey(row);
      return id && !remoteIds.has(id);
    });
  });
}

function comparableSharedRow(collection, row) {
  const keysByCollection = {
    projects: ["id", "name", "type", "status", "budget", "initialBudget", "lastBudgetReason", "objective"],
    movements: ["id", "projectId", "type", "category", "concept", "amount", "movementDate", "status", "partnerId"],
    partners: ["id", "projectId", "name", "type", "contribution", "participation", "status"],
    inventory: ["id", "projectId", "item", "category", "quantity", "unitCost", "status"],
    users: ["id", "name", "username", "role", "status", "projectId"],
  };
  const numericKeys = new Set(["budget", "initialBudget", "amount", "contribution", "participation", "quantity", "unitCost"]);
  const keys = keysByCollection[collection] || ["id"];

  return keys.reduce((object, key) => {
    object[key] = numericKeys.has(key) ? numberValue(row?.[key]) : String(row?.[key] || "");
    return object;
  }, {});
}

function hasLocalRowsChanged(localData, remoteData) {
  return ["projects", "movements", "partners", "inventory", "users"].some((collection) => {
    const remoteRows = new Map(sharedRows(remoteData, collection).map((row) => [collectionKey(row), row]));

    return sharedRows(localData, collection).some((localRow) => {
      const id = collectionKey(localRow);
      if (!id) {
        return false;
      }
      const remoteRow = remoteRows.get(id);
      if (!remoteRow) {
        return true;
      }
      return JSON.stringify(comparableSharedRow(collection, localRow)) !==
        JSON.stringify(comparableSharedRow(collection, remoteRow));
    });
  });
}

function hasBusinessData(data = state.data) {
  return countSharedRows(data) > 0;
}

async function mergeLocalSnapshotIfNeeded(localSnapshot, remoteData) {
  if (
    !remoteData ||
    !hasBusinessData(localSnapshot) ||
    (!hasLocalRowsMissing(localSnapshot, remoteData) && !hasLocalRowsChanged(localSnapshot, remoteData))
  ) {
    return remoteData;
  }

  try {
    const result = await callBackend("merge-local-data", { data: localSnapshot });
    return normalizeRemoteData(result.data) || remoteData;
  } catch {
    return replayLocalRowsToLegacyBackend(localSnapshot, remoteData);
  }
}

function equivalentProject(projects, project) {
  const name = String(project.name || "").trim().toLowerCase();
  const budget = numberValue(project.budget);

  return projects.find(
    (item) =>
      String(item.id) === String(project.id) ||
      (String(item.name || "").trim().toLowerCase() === name &&
        Math.abs(numberValue(item.budget) - budget) < 0.01),
  );
}

function equivalentMovement(movements, movement, projectId) {
  return movements.find(
    (item) =>
      String(item.id) === String(movement.id) ||
      (String(item.projectId) === String(projectId) &&
        item.type === movement.type &&
        item.category === movement.category &&
        String(item.concept || "").trim().toLowerCase() ===
          String(movement.concept || "").trim().toLowerCase() &&
        Math.abs(numberValue(item.amount) - numberValue(movement.amount)) < 0.01 &&
        String(item.movementDate || "") === String(movement.movementDate || "")),
  );
}

function equivalentPartner(partners, partner, projectId) {
  return partners.find(
    (item) =>
      String(item.id) === String(partner.id) ||
      (String(item.projectId) === String(projectId) &&
        String(item.name || "").trim().toLowerCase() ===
          String(partner.name || "").trim().toLowerCase() &&
        Math.abs(numberValue(item.participation) - numberValue(partner.participation)) < 0.01),
  );
}

function equivalentInventory(inventory, item, projectId) {
  return inventory.find(
    (entry) =>
      String(entry.id) === String(item.id) ||
      (String(entry.projectId) === String(projectId) &&
        String(entry.item || "").trim().toLowerCase() ===
          String(item.item || "").trim().toLowerCase()),
  );
}

function equivalentUser(users, user, projectId) {
  const username = String(user.username || "").trim().toLowerCase();

  return users.find(
    (item) =>
      String(item.id) === String(user.id) ||
      (username && String(item.username || "").trim().toLowerCase() === username) ||
      (String(item.projectId || "") === String(projectId || "") &&
        String(item.name || "").trim().toLowerCase() ===
          String(user.name || "").trim().toLowerCase()),
  );
}

async function legacyCreate(action, payload) {
  const result = await callBackend(action, payload);
  return normalizeRemoteData(result.data);
}

async function legacyReplaceMovement(payload) {
  if (!payload.movementId) {
    return null;
  }

  await callBackend("delete-movement", { movementId: payload.movementId });
  const result = await callBackend("create-movement", {
    projectId: payload.projectId,
    type: payload.type,
    category: payload.category,
    concept: payload.concept,
    amount: numberValue(payload.amount),
    movementDate: payload.movementDate,
    status: payload.status,
    partnerId: payload.partnerId,
  });
  return normalizeRemoteData(result.data);
}

async function replayLocalRowsToLegacyBackend(localSnapshot, remoteData) {
  let remote = normalizeRemoteData(remoteData) || normalizeData(remoteData);
  const idMap = new Map();

  for (const project of sharedRows(localSnapshot, "projects")) {
    if (!project.name) {
      continue;
    }

    let match = equivalentProject(remote.projects, project);
    if (!match) {
      const next = await legacyCreate("create-project", {
        name: project.name,
        type: project.type,
        country: project.country,
        currency: project.currency,
        timezone: project.timezone,
        budget: numberValue(project.budget),
        objective: project.objective,
        status: project.status,
      });
      if (next) {
        remote = next;
        match = equivalentProject(remote.projects, project);
      }
    }

    if (match) {
      idMap.set(project.id, match.id);
    }
  }

  for (const partner of sharedRows(localSnapshot, "partners")) {
    const projectId = idMap.get(partner.projectId) || partner.projectId;
    if (!projectId || equivalentPartner(remote.partners, partner, projectId)) {
      continue;
    }

    const next = await legacyCreate("create-partner", {
      projectId,
      name: partner.name,
      type: partner.type,
      contribution: numberValue(partner.contribution),
      participation: numberValue(partner.participation),
    });
    if (next) {
      remote = next;
    }
  }

  for (const movement of sharedRows(localSnapshot, "movements")) {
    const projectId = idMap.get(movement.projectId) || movement.projectId;
    if (!projectId || equivalentMovement(remote.movements, movement, projectId)) {
      continue;
    }

    const next = await legacyCreate("create-movement", {
      projectId,
      type: movement.type,
      category: movement.category,
      concept: movement.concept,
      amount: numberValue(movement.amount),
      movementDate: movement.movementDate,
      status: movement.status,
      partnerId: movement.partnerId,
    });
    if (next) {
      remote = next;
    }
  }

  for (const item of sharedRows(localSnapshot, "inventory")) {
    const projectId = idMap.get(item.projectId) || item.projectId;
    if (!projectId || equivalentInventory(remote.inventory, item, projectId)) {
      continue;
    }

    const next = await legacyCreate("create-inventory", {
      projectId,
      item: item.item,
      category: item.category,
      quantity: numberValue(item.quantity),
      unitCost: numberValue(item.unitCost),
    });
    if (next) {
      remote = next;
    }
  }

  for (const user of sharedRows(localSnapshot, "users")) {
    const projectId = idMap.get(user.projectId) || user.projectId || "";
    if (!user.username || !user.loginHash || !user.passwordHash || equivalentUser(remote.users, user, projectId)) {
      continue;
    }

    const next = await legacyCreate("create-user", {
      name: user.name,
      username: user.username,
      role: user.role,
      projectId,
      loginHash: user.loginHash,
      passwordHash: user.passwordHash,
    });
    if (next) {
      remote = next;
    }
  }

  return normalizeRemoteData(remote) || remote;
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
    `${projectName(movement.projectId)} ${partnerName(movement.partnerId)} ${movement.type} ${movement.category} ${movement.concept}`
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
  applySessionScope();
  renderMetrics();
  renderProjectSelects();
  renderPartnerSelects();
  renderPartnerParticipationControls();
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
  const partners = activeProjectPartners();
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
  setTextIfExists("#metricPartners", String(partners.length));
  setTextIfExists("#metricInventoryValue", money(inventoryValue));
  setTextIfExists("#metricAudit", String(state.data.audit.length));
}

function renderProjectSelects() {
  const projects = accessibleProjects();
  const projectOptions = projects.map((project) =>
    el("option", { value: project.id, text: project.name }),
  );
  const projectSelect = $("#projectSelect");
  projectSelect.replaceChildren(
    ...(projectOptions.length
      ? projectOptions
      : [el("option", { value: "", text: "Crea un proyecto" })]),
  );
  if (!projects.some((project) => project.id === state.selectedProjectId)) {
    state.selectedProjectId = projects[0]?.id || "";
  }
  projectSelect.value = state.selectedProjectId;

  const scopeOptions = [
    el("option", { value: SUMMARY_ALL, text: "Todo ProN" }),
    ...projectOptions.map((option) => option.cloneNode(true)),
  ];
  const scopeSelect = $("#summaryScopeSelect");
  scopeSelect.replaceChildren(...scopeOptions);
  if (
    state.summaryScopeId !== SUMMARY_ALL &&
    !projects.some((project) => project.id === state.summaryScopeId)
  ) {
    state.summaryScopeId = SUMMARY_ALL;
  }
  scopeSelect.value = state.summaryScopeId;

  const userProjectInput = $("#userProjectInput");
  userProjectInput.replaceChildren(
    el("option", { value: "", text: "Todos los proyectos" }),
    ...projectOptions.map((option) => option.cloneNode(true)),
  );
  userProjectInput.value = state.selectedProjectId;

  const partnerProjectInput = $("#partnerProjectInput");
  if (partnerProjectInput) {
    const currentProjectId = partnerProjectInput.value || state.selectedProjectId;
    partnerProjectInput.replaceChildren(
      ...(projectOptions.length
        ? projectOptions.map((option) => option.cloneNode(true))
        : [el("option", { value: "", text: "Crea un proyecto" })]),
    );
    partnerProjectInput.value = projects.some((project) => project.id === currentProjectId)
      ? currentProjectId
      : state.selectedProjectId;
  }
}

function renderPartnerSelects() {
  populatePartnerSelect($("#movementForm"), state.selectedProjectId);
  populatePartnerSelect($("#detailMovementForm"), state.detailProjectId || state.selectedProjectId);
  populatePartnerSelect($("#detailAdminForm"), state.detailProjectId || state.selectedProjectId);
}

function partnerFormProjectId() {
  const projectId = $("#partnerProjectInput")?.value || state.selectedProjectId;
  return projectId && canAccessProject(projectId) ? projectId : "";
}

function populatePartnerSelect(form, projectId) {
  if (!form || !form.elements.partnerId) {
    return;
  }

  const partnerSelect = form.elements.partnerId;
  const currentPartnerId = partnerSelect.value;
  const partners = projectPartners(projectId);

  partnerSelect.replaceChildren(
    el("option", { value: "", text: "Socio / responsable (opcional)" }),
    ...partners.map((partner) =>
      el("option", { value: partner.id, text: `${partner.name} - ${partner.type}` }),
    ),
  );
  partnerSelect.value = partners.some((partner) => partner.id === currentPartnerId)
    ? currentPartnerId
    : "";
}

function renderPartnerParticipationControls() {
  const partnerProjectId = partnerFormProjectId();
  renderPartnerParticipationForm(
    $("#partnerForm"),
    partnerProjectId,
    "#partnerParticipationStatus",
  );
  renderPartnerParticipationForm(
    $("#detailPartnerForm"),
    state.detailProjectId || state.selectedProjectId,
    "#detailPartnerParticipationStatus",
  );
  renderProjectParticipationSummary("#partnersEquitySummary", partnerProjectId);
  renderProjectParticipationSummary(
    "#detailPartnersEquitySummary",
    state.detailProjectId || state.selectedProjectId,
  );
}

function renderPartnerParticipationForm(form, projectId, statusSelector) {
  const status = $(statusSelector);
  if (!status) {
    return;
  }

  if (!projectId) {
    status.textContent = "Crea o abre un proyecto para calcular participaciones.";
    status.className = "participation-status";
    return;
  }

  const editPartnerId = form?.elements.partnerId?.value || "";
  const stats = projectParticipationStats(projectId, editPartnerId);
  const requested = numberValue(form?.elements.participation?.value);
  const requestedContribution = numberValue(form?.elements.contribution?.value);
  const totalAfter = stats.assigned + requested;
  const remainingAfter = Math.max(0, 100 - totalAfter);
  const overAfter = Math.max(0, totalAfter - 100);
  const contributionAfter = stats.contribution + requestedContribution;
  const budgetGapAfter = Math.max(0, stats.budget - contributionAfter);
  const surplusAfter = Math.max(0, contributionAfter - stats.budget);
  const budgetShare = stats.budget * (requested / 100);
  const input = form?.elements.participation;

  if (input) {
    input.placeholder = `Participacion % - disponible ${percentLabel(stats.remaining)}`;
    input.setAttribute("min", "0");
    input.setAttribute("max", String(stats.remaining));
  }

  status.className = `participation-status ${overAfter > 0 ? "warning" : totalAfter >= 100 ? "complete" : ""}`;
  status.textContent =
    `Asignado ${percentLabel(stats.assigned)} | Disponible ${percentLabel(stats.remaining)} | ` +
    `Con este socio quedaria ${percentLabel(totalAfter)} | Libre despues ${percentLabel(remainingAfter)}` +
    (overAfter > 0 ? ` | Excedente ${percentLabel(overAfter)}` : "") +
    ` | Este porcentaje equivale a ${money(budgetShare)} del presupuesto` +
    ` | Capital real quedaria ${money(contributionAfter)} | ` +
    (surplusAfter > 0
      ? `Sobra ${money(surplusAfter)} frente al presupuesto`
      : `Falta ${money(budgetGapAfter)} frente al presupuesto`);
}

function renderProjectParticipationSummary(selector, projectId) {
  const node = $(selector);
  if (!node) {
    return;
  }

  if (!projectId) {
    node.textContent = "Selecciona un proyecto para ver porcentaje, capital real y sobrante.";
    node.className = "participation-status";
    return;
  }

  const stats = projectParticipationStats(projectId);
  node.className = `participation-status ${stats.over > 0 ? "warning" : stats.remaining === 0 ? "complete" : ""}`;
  node.replaceChildren(
    el("div", { class: "equity-summary-grid" }, [
      el("article", {}, [
        el("span", { text: "Proyecto" }),
        el("strong", { text: projectName(projectId) }),
      ]),
      el("article", {}, [
        el("span", { text: "Asignado" }),
        el("strong", { text: percentLabel(stats.assigned) }),
      ]),
      el("article", {}, [
        el("span", { text: "Disponible" }),
        el("strong", { text: percentLabel(stats.remaining) }),
      ]),
      el("article", {}, [
        el("span", { text: "Excedente" }),
        el("strong", { text: percentLabel(stats.over) }),
      ]),
      el("article", {}, [
        el("span", { text: "Capital real socios" }),
        el("strong", { text: money(stats.contribution) }),
      ]),
      el("article", {}, [
        el("span", { text: stats.surplus > 0 ? "Sobra" : "Falta" }),
        el("strong", { text: stats.surplus > 0 ? money(stats.surplus) : money(stats.budgetGap) }),
      ]),
    ]),
  );
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
    container.replaceChildren(el("div", { class: "empty-state", text: "Sin movimientos por fecha para graficar." }));
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
    "aria-label": "Plano de flujo financiero por fecha",
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

function projectionSummary(projectId = summaryProjectId()) {
  const scope = reportScope(projectId);
  const analyses = scope.projects.map((project) => projectReportAnalysis(project, scope));
  const eventSummary = analyses.length === 1 ? analyses[0].eventSummary : null;
  const capital = scope.current.income + scope.current.investment;
  const budgetGap = analyses.length
    ? analyses.reduce((sum, analysis) => sum + analysis.budgetGap, 0)
    : Math.max(0, scope.current.budget - capital);
  const operatingGap = analyses.reduce((sum, analysis) => sum + analysis.operatingGap, 0);
  const projectedIncome30 = analyses.reduce((sum, analysis) => sum + analysis.projectedIncome30, 0);
  const projectedExpenses30 = analyses.reduce((sum, analysis) => sum + analysis.projectedExpenses30, 0);
  const projectedBalance30 = scope.current.balance + projectedIncome30 - projectedExpenses30;
  const monthlyNet = projectedIncome30 - projectedExpenses30;
  const monthsToCoverBudget = monthlyNet > 0 && budgetGap > 0
    ? Math.ceil(budgetGap / monthlyNet)
    : 0;
  const completion = analyses.length
    ? Math.round(analyses.reduce((sum, analysis) => sum + analysis.completion, 0) / analyses.length)
    : 0;
  const range = movementRange(scope.movements);
  const budgetProgress = scope.current.budget
    ? Math.min(100, (capital / scope.current.budget) * 100)
    : 0;
  const spendProgress = scope.current.budget
    ? Math.min(100, (scope.current.expenses / scope.current.budget) * 100)
    : 0;

  return {
    scope,
    analyses,
    eventSummary,
    capital,
    budgetGap,
    operatingGap,
    projectedIncome30,
    projectedExpenses30,
    projectedBalance30,
    monthlyNet,
    monthsToCoverBudget,
    completion,
    range,
    budgetProgress,
    spendProgress,
    dataShared: state.backend === "ready" && !isLocalSession(),
  };
}

function projectionMetric(label, value, note, tone = "") {
  return el("div", { class: `projection-metric ${tone}`.trim() }, [
    el("span", { text: label }),
    el("strong", { text: value }),
    el("small", { text: note }),
  ]);
}

function renderProjectionMetrics(selector, summary) {
  if (summary.eventSummary) {
    const event = summary.eventSummary;
    replaceChildren(selector, [
      projectionMetric(
        "Costo fijo",
        money(event.costTarget),
        `IVA ref. ${money(event.ivaEstimated)}`,
      ),
      projectionMetric(
        "Venta esperada",
        money(event.incomeExpected),
        event.incomeReal ? `cobrado ${money(event.incomeReal)}` : "pendiente de cobro real",
        event.incomeExpected >= event.costTarget && event.costTarget ? "good" : "warning",
      ),
      projectionMetric(
        "Utilidad",
        money(event.profitExpected),
        `margen ${percentLabel(event.marginExpected)}`,
        event.profitExpected < 0 ? "danger" : "good",
      ),
      projectionMetric(
        "Punto equilibrio",
        money(event.breakevenAmount),
        event.revenueGap
          ? `faltan ${money(event.revenueGap)} | cubierto ${percentLabel(event.breakeven)}`
          : `cubierto ${percentLabel(event.breakeven)} | utilidad ${money(event.profitExpected)}`,
        event.revenueGap ? "warning" : "good",
      ),
      projectionMetric(
        "Expediente",
        `${summary.completion}%`,
        projectStatus(summary.scope.projects[0]),
        summary.completion >= 80 ? "good" : "warning",
      ),
    ]);
    return;
  }

  replaceChildren(selector, [
    projectionMetric(
      "Capital real",
      money(summary.capital),
      `${percentLabel(summary.budgetProgress)} del presupuesto`,
      summary.budgetProgress >= 100 ? "good" : "warning",
    ),
    projectionMetric(
      "Brecha",
      money(summary.budgetGap),
      summary.budgetGap > 0 ? "falta para cubrir presupuesto" : "presupuesto cubierto",
      summary.budgetGap > 0 ? "danger" : "good",
    ),
    projectionMetric(
      "Balance hoy",
      money(summary.scope.current.balance),
      `gasto usado ${percentLabel(summary.spendProgress)}`,
      summary.scope.current.balance < 0 ? "danger" : "good",
    ),
    projectionMetric(
      "Proy. 30 dias",
      money(summary.projectedBalance30),
      `entra ${money(summary.projectedIncome30)} / sale ${money(summary.projectedExpenses30)}`,
      summary.projectedBalance30 < 0 ? "danger" : "good",
    ),
    projectionMetric(
      "Expediente",
      `${summary.completion}%`,
      summary.range.days ? `${summary.range.days} dias de historial` : "sin historial financiero",
      summary.completion >= 80 ? "good" : "warning",
    ),
  ]);
}

function projectionInsightNodes(summary) {
  const nodes = [];

  if (!summary.scope.projects.length) {
    nodes.push(
      el("div", { class: "warning" }, [
        el("strong", { text: "Sin proyecto registrado" }),
        el("span", { text: "Crea un proyecto real para que ProN calcule presupuesto, capital, brecha y proyeccion." }),
      ]),
    );
    return nodes;
  }

  if (summary.eventSummary) {
    const event = summary.eventSummary;
    nodes.push(
      el("div", {}, [
        el("strong", { text: "Como leer el plano" }),
        el("span", {
          text:
            "Pasa el mouse o deja el dedo sobre cada punto para ver su leyenda. La linea punteada marca el punto de equilibrio: la venta minima que debe cubrirse para no perder.",
        }),
      ]),
    );
    nodes.push(
      el("div", { class: event.revenueGap ? "warning" : "" }, [
        el("strong", { text: "Punto de equilibrio" }),
        el("span", {
          text: event.revenueGap
            ? `El evento necesita cubrir ${money(event.breakevenAmount)}. Falta vender o cobrar ${money(event.revenueGap)} para llegar a cero perdidas.`
            : `El evento necesita cubrir ${money(event.breakevenAmount)} y la venta esperada ya lo supera; utilidad proyectada ${money(event.profitExpected)}.`,
        }),
      ]),
    );
    nodes.push(
      el("div", { class: event.profitExpected < 0 ? "danger" : "" }, [
        el("strong", { text: "Utilidad operativa" }),
        el("span", {
          text: `Utilidad esperada ${money(event.profitExpected)}, utilidad real registrada ${money(event.profitReal)} y margen ${percentLabel(event.marginExpected)}.`,
        }),
      ]),
    );
    nodes.push(
      el("div", {}, [
        el("strong", { text: "Socios y reparto" }),
        el("span", {
          text: `${event.partners.length} socio(s) vinculados. El reparto de utilidad se calcula con el porcentaje registrado.`,
        }),
      ]),
    );
    nodes.push(
      el("div", { class: summary.dataShared ? "" : "warning" }, [
        el("strong", { text: summary.dataShared ? "Datos compartidos" : "Datos solo aqui" }),
        el("span", {
          text: summary.dataShared
            ? "La informacion del evento esta en el respaldo central del link."
            : "Pulsa Actualizar cuando termines para subir este evento al respaldo central.",
        }),
      ]),
    );
    return nodes;
  }

  nodes.push(
    el("div", { class: summary.budgetGap > 0 ? "danger" : "" }, [
      el("strong", {
        text: summary.budgetGap > 0 ? "Capital por completar" : "Capital cubierto",
      }),
      el("span", {
        text: summary.budgetGap > 0
          ? `Falta ${money(summary.budgetGap)} para igualar capital real contra presupuesto.`
          : "El capital real ya cubre el presupuesto registrado.",
      }),
    ]),
  );

  nodes.push(
    el("div", { class: summary.projectedBalance30 < 0 ? "danger" : "" }, [
      el("strong", { text: "Tendencia a 30 dias" }),
      el("span", {
        text: summary.range.days
          ? `Con el historial cargado, el balance estimado cerraria en ${money(summary.projectedBalance30)}.`
          : "Registra fechas de ingresos, inversiones y gastos para activar una proyeccion real.",
      }),
    ]),
  );

  if (summary.monthsToCoverBudget > 0) {
    nodes.push(
      el("div", {}, [
        el("strong", { text: "Tiempo estimado" }),
        el("span", {
          text: `A este ritmo faltarian cerca de ${summary.monthsToCoverBudget} meses para cubrir la brecha del presupuesto.`,
        }),
      ]),
    );
  }

  const firstMissing = summary.analyses
    .flatMap((analysis) => analysis.missing.map((item) => `${analysis.project.name}: ${item}`))
    .slice(0, 1)[0];
  if (firstMissing) {
    nodes.push(
      el("div", { class: "warning" }, [
        el("strong", { text: "Falta por completar" }),
        el("span", { text: firstMissing }),
      ]),
    );
  }

  nodes.push(
    el("div", { class: summary.dataShared ? "" : "warning" }, [
      el("strong", { text: summary.dataShared ? "Datos compartidos" : "Datos solo aqui" }),
      el("span", {
        text: summary.dataShared
          ? "Lo registrado esta en el respaldo central y se vera al abrir el link en otro navegador."
          : "Lo registrado vive en este navegador hasta que Actualizar logre guardarlo en el respaldo central.",
      }),
    ]),
  );

  return nodes;
}

function projectionPointTitle(point) {
  const detail = point.description ? ` ${point.description}` : "";
  return `${point.label}: ${money(point.value)}.${detail}`;
}

function projectionTextAnchor(index, total) {
  if (index === 0) {
    return "start";
  }
  if (index === total - 1) {
    return "end";
  }
  return "middle";
}

function projectionTextX(point, index, total) {
  if (index === 0) {
    return point.x - 10;
  }
  if (index === total - 1) {
    return point.x + 10;
  }
  return point.x;
}

function projectionValueY(point, height, padding) {
  const raw = point.y - 16 < padding.top + 8 ? point.y + 28 : point.y - 16;
  return Math.min(height - padding.bottom - 16, Math.max(22, raw));
}

function renderProjectionPoint(point, index, total, height, padding) {
  const anchor = projectionTextAnchor(index, total);
  const textX = projectionTextX(point, index, total);
  const title = projectionPointTitle(point);

  return svgNode("g", {
    class: "projection-point",
    tabindex: "0",
    "aria-label": title,
  }, [
    svgNode("title", {}, [document.createTextNode(title)]),
    svgNode("circle", {
      cx: point.x,
      cy: point.y,
      r: "8",
      fill: point.color,
      stroke: "#ffffff",
      "stroke-width": "3",
    }),
    svgNode("text", {
      class: "plane-text",
      x: textX,
      y: height - 30,
      "text-anchor": anchor,
      fill: "#65736f",
      "font-size": "11",
      "font-weight": "800",
    }, [document.createTextNode(point.label)]),
    svgNode("text", {
      class: "plane-text plane-value",
      x: textX,
      y: projectionValueY(point, height, padding),
      "text-anchor": anchor,
      fill: point.color,
      "font-size": "12",
      "font-weight": "900",
    }, [document.createTextNode(money(point.value).replace(",00", ""))]),
  ]);
}

function renderEventProjectionPlane(selector, event) {
  const container = $(selector);
  const width = 960;
  const height = 360;
  const padding = { top: 54, right: 52, bottom: 82, left: 104 };
  const points = [
    {
      label: "Punto equilibrio",
      value: event.breakevenAmount,
      color: "#d95f43",
      description: "Venta minima que debe cubrir el evento para no perder.",
    },
    {
      label: "Venta esperada",
      value: event.incomeExpected,
      color: "#315f9f",
      description: "Ingreso comercial estimado con boletos, barra, auspicios o marcas.",
    },
    {
      label: "Cobrado",
      value: event.incomeReal,
      color: "#0f766e",
      description: "Dinero real ya registrado como cobrado.",
    },
    {
      label: "Utilidad",
      value: event.profitExpected,
      color: event.profitExpected < 0 ? "#d95f43" : "#0f766e",
      description: "Venta esperada menos el punto de equilibrio.",
    },
    {
      label: "Capital socios",
      value: event.capitalBase,
      color: "#f2b84b",
      description: "Aportes o inversion registrada por socios del evento.",
    },
    {
      label: "Falta venta",
      value: event.revenueGap,
      color: event.revenueGap ? "#d95f43" : "#0f766e",
      description: "Monto que falta para llegar al punto de equilibrio; si es cero, ya esta cubierto.",
    },
  ];
  const values = points.map((point) => point.value);
  const high = Math.max(1, ...values);
  const low = Math.min(0, ...values);
  const range = Math.max(1, high - low);
  const yScale = (value) =>
    padding.top + ((high - value) / range) * (height - padding.top - padding.bottom);
  const xStep = (width - padding.left - padding.right) / (points.length - 1);
  const positioned = points.map((point, index) => ({
    ...point,
    x: padding.left + xStep * index,
    y: yScale(point.value),
  }));
  const path = positioned.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
  const zeroY = yScale(0);
  const costY = yScale(event.breakevenAmount);
  const costLineLabelY = Math.max(28, Math.min(height - padding.bottom - 24, costY - 12));

  const svg = svgNode("svg", {
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": "Plano operativo del evento en marcha",
  }, [
    svgNode("line", {
      x1: padding.left,
      x2: width - padding.right,
      y1: zeroY,
      y2: zeroY,
      stroke: "#10201d",
      "stroke-width": "1.2",
    }),
    svgNode("line", {
      x1: padding.left,
      x2: width - padding.right,
      y1: costY,
      y2: costY,
      stroke: "#d95f43",
      "stroke-width": "1",
      "stroke-dasharray": "6 7",
    }),
    svgNode("text", {
      class: "plane-text axis-label",
      x: width - padding.right - 8,
      y: costLineLabelY,
      fill: "#8b2e1d",
      "font-size": "12",
      "font-weight": "800",
      "text-anchor": "end",
    }, [document.createTextNode("linea punto equilibrio")]),
    svgNode("path", {
      d: path,
      fill: "none",
      stroke: "#10201d",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      opacity: "0.42",
    }),
    ...positioned.map((point, index) =>
      renderProjectionPoint(point, index, positioned.length, height, padding),
    ),
  ]);

  container.replaceChildren(svg);
}

function renderProjectionPlane(selector, summary) {
  const container = $(selector);

  if (!summary.scope.projects.length) {
    container.replaceChildren(el("div", { class: "empty-state", text: "Crea un proyecto para ver el plano financiero." }));
    return;
  }

  if (summary.eventSummary) {
    renderEventProjectionPlane(selector, summary.eventSummary);
    return;
  }

  const width = 960;
  const height = 350;
  const padding = { top: 54, right: 52, bottom: 78, left: 94 };
  const points = [
    {
      label: "Presupuesto",
      value: summary.scope.current.budget,
      color: "#0f766e",
      description: "Meta economica registrada para el proyecto.",
    },
    {
      label: "Capital real",
      value: summary.capital,
      color: "#315f9f",
      description: "Ingresos e inversiones ya registrados.",
    },
    {
      label: "Gastos",
      value: summary.scope.current.expenses,
      color: "#d95f43",
      description: "Total de gastos registrados en el proyecto.",
    },
    {
      label: "Balance hoy",
      value: summary.scope.current.balance,
      color: summary.scope.current.balance < 0 ? "#d95f43" : "#10201d",
      description: "Resultado actual: ingresos mas inversiones menos gastos.",
    },
    {
      label: "Proy. 30 dias",
      value: summary.projectedBalance30,
      color: summary.projectedBalance30 < 0 ? "#d95f43" : "#0f766e",
      description: "Tendencia estimada a 30 dias usando el historial con fechas.",
    },
    {
      label: "Brecha",
      value: summary.budgetGap,
      color: summary.budgetGap > 0 ? "#f2b84b" : "#0f766e",
      description: "Monto que falta para cubrir el presupuesto con capital real.",
    },
  ];
  const values = points.map((point) => point.value);
  const high = Math.max(1, ...values, summary.scope.current.budget);
  const low = Math.min(0, ...values);
  const range = Math.max(1, high - low);
  const yScale = (value) =>
    padding.top + ((high - value) / range) * (height - padding.top - padding.bottom);
  const xStep = (width - padding.left - padding.right) / (points.length - 1);
  const positioned = points.map((point, index) => ({
    ...point,
    x: padding.left + xStep * index,
    y: yScale(point.value),
  }));
  const path = positioned.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
  const zeroY = yScale(0);
  const budgetY = yScale(summary.scope.current.budget);

  const svg = svgNode("svg", {
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": "Plano de proyeccion financiera del proyecto",
  }, [
    svgNode("line", {
      x1: padding.left,
      x2: width - padding.right,
      y1: zeroY,
      y2: zeroY,
      stroke: "#10201d",
      "stroke-width": "1.2",
    }),
    svgNode("line", {
      x1: padding.left,
      x2: width - padding.right,
      y1: budgetY,
      y2: budgetY,
      stroke: "#0f766e",
      "stroke-width": "1",
      "stroke-dasharray": "6 7",
    }),
    svgNode("text", {
      class: "plane-text axis-label",
      x: width - padding.right - 8,
      y: Math.max(28, Math.min(height - padding.bottom - 24, budgetY - 12)),
      fill: "#0f766e",
      "font-size": "12",
      "font-weight": "800",
      "text-anchor": "end",
    }, [document.createTextNode("linea de presupuesto")]),
    svgNode("path", {
      d: path,
      fill: "none",
      stroke: "#315f9f",
      "stroke-width": "3",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    }),
    ...positioned.map((point, index) =>
      renderProjectionPoint(point, index, positioned.length, height, padding),
    ),
  ]);

  container.replaceChildren(svg);
}

function renderProjectionDashboard(targets, projectId = summaryProjectId()) {
  const summary = projectionSummary(projectId);
  renderProjectionMetrics(targets.metrics, summary);
  renderProjectionPlane(targets.plane, summary);
  replaceChildren(targets.insights, projectionInsightNodes(summary));
  if (targets.pill) {
    setTextIfExists(targets.pill, summary.scope.label);
  }
  return summary;
}

function renderFlowGuide(selector, movements) {
  const node = $(selector);
  if (!node) {
    return;
  }

  const range = movementRange(movements);
  node.textContent = range.days
    ? "Verde significa entrada de dinero, rojo salida o gasto, y el numero sobre cada fecha es el balance neto de ese dia. El plano de proyeccion de arriba usa ese historial para estimar tendencia a 30 dias."
    : "Cuando registres movimientos con fecha, este plano mostrara entradas, salidas y balance neto por dia.";
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
  renderProjectionDashboard({
    metrics: "#projectionMetrics",
    plane: "#projectionPlane",
    insights: "#projectionInsights",
    pill: "#projectionScopePill",
  });
  renderFlowGuide("#cashflowGuide", movements);

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
        el("td", { text: partnerName(movement.partnerId) }),
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

function renderPartnerCard(partner) {
  const stats = partnerStats(partner.id);
  const budgetShare = numberValue(projectById(partner.projectId)?.budget) *
    (numberValue(partner.participation) / 100);
  const retired = partner.status === "Retirado";

  return el("div", { class: "partner-card" }, [
    el("div", { class: "partner-card-head" }, [
      el("div", {}, [
        el("span", { text: partner.type }),
        el("b", { text: partner.name }),
        el("small", { text: `${projectName(partner.projectId)} | ${partner.status || "Activo"}` }),
      ]),
      el("strong", {
        class: "partner-percent",
        text: percentLabel(partner.participation),
      }),
    ]),
    el("ul", { class: "partner-metrics" }, [
      el("li", {}, [
        el("span", { text: "Aporte base" }),
        el("b", { text: money(partner.contribution) }),
      ]),
      el("li", {}, [
        el("span", { text: "Valor segun % presupuesto" }),
        el("b", { text: money(budgetShare) }),
      ]),
      el("li", {}, [
        el("span", { text: "Aportes/Inversiones" }),
        el("b", { text: money(stats.investment) }),
      ]),
      el("li", {}, [
        el("span", { text: "Ingresos asignados" }),
        el("b", { text: money(stats.income) }),
      ]),
      el("li", {}, [
        el("span", { text: "Gastos asignados" }),
        el("b", { class: stats.expenses > 0 ? "negative-value" : "", text: money(stats.expenses) }),
      ]),
      el("li", {}, [
        el("span", { text: "Disponible total" }),
        el("b", { class: stats.totalAvailable < 0 ? "negative-value" : "", text: money(stats.totalAvailable) }),
      ]),
    ]),
    el("small", {
      class: "partner-note",
      text: `${stats.movements.length} movimiento(s) asignado(s).`,
    }),
    el("div", { class: "card-actions" }, [
      el("button", {
        type: "button",
        text: "Editar",
        onclick: () => editDetailPartner(partner.id),
      }),
      el("button", {
        type: "button",
        text: "Descargar",
        onclick: () => downloadPartnerCard(partner.id),
      }),
      el("button", {
        type: "button",
        class: "danger",
        text: retired ? "Eliminar" : "Retirar",
        onclick: () =>
          retired
            ? confirmDelete(
                `Eliminar definitivamente socio ${partner.name}?`,
                "delete-partner",
                { partnerId: partner.id },
                "Socio eliminado.",
              )
            : retireDetailPartner(partner.id),
      }),
    ]),
  ]);
}

function renderPartners() {
  const partners = activeProjectPartners();
  replaceChildren(
    "#partnersCards",
    partners.length
      ? partners.map((partner) => renderPartnerCard(partner))
      : [
          el("div", {
            class: "empty-state",
            text: "Selecciona o crea un proyecto para ver solo sus socios.",
          }),
        ],
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
          el("td", { text: user.username || "superadmin" }),
          el("td", { text: user.role }),
          el("td", { text: accessName(user.projectId) }),
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
  renderProjectionDashboard({
    metrics: "#reportProjectionMetrics",
    plane: "#reportProjectionPlane",
    insights: "#reportProjectionInsights",
  });
  renderFlowGuide("#reportFlowGuide", movements);
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
  const project = projectById(projectId);
  const nextStatus = isEventProject(project) ? EVENT_STATUS : "Negocio activo";
  state.selectedProjectId = projectId;
  state.summaryScopeId = projectId;
  state.detailProjectId = projectId;
  setActiveView("proyecto-detalle");
  updateProjectStatus(projectId, nextStatus, `${nextStatus}. Administracion disponible.`);
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

function renderEventMetric(label, value, note, tone = "") {
  return el("article", { class: tone }, [
    el("span", { text: label }),
    el("strong", { text: value }),
    el("small", { text: note }),
  ]);
}

function renderEventControlPanel(project, movements, partners) {
  const panel = $("#eventControlPanel");
  if (!panel) {
    return;
  }

  if (!isEventProject(project)) {
    panel.classList.add("is-hidden");
    return;
  }

  panel.classList.remove("is-hidden");
  const summary = eventFinancialSummary(project, movements, partners);
  setTextIfExists("#eventControlPill", projectStatus(project));

  replaceChildren("#eventScorecards", [
    renderEventMetric(
      "Costo fijo",
      money(summary.costTarget),
      `Base sin IVA ${money(summary.subtotalNoIva)}`,
      summary.costTarget ? "" : "warning",
    ),
    renderEventMetric(
      "IVA estimado",
      money(summary.ivaEstimated),
      `${percentLabel(IVA_RATE * 100)} referencial`,
    ),
    renderEventMetric(
      "Venta total esperada",
      money(summary.incomeExpected),
      summary.incomeReal ? `cobrado ${money(summary.incomeReal)}` : "sin cobro real registrado",
      summary.incomeExpected >= summary.costTarget && summary.costTarget ? "good" : "warning",
    ),
    renderEventMetric(
      "Utilidad esperada",
      money(summary.profitExpected),
      `margen ${percentLabel(summary.marginExpected)}`,
      summary.profitExpected < 0 ? "danger" : "good",
    ),
    renderEventMetric(
      "Punto de equilibrio",
      money(summary.breakevenAmount),
      summary.revenueGap
        ? `faltan ventas por ${money(summary.revenueGap)}`
        : `cubierto ${percentLabel(summary.breakeven)}`,
      summary.revenueGap ? "warning" : "good",
    ),
    renderEventMetric(
      "Capital socios",
      money(summary.capitalBase),
      `${partners.length} socio(s) vinculados`,
    ),
  ]);

  const rows = [
    {
      type: "Costo fijo",
      category: "Presupuesto registrado",
      total: summary.costTarget,
      base: summary.subtotalNoIva,
      iva: summary.ivaEstimated,
      status: "Meta",
    },
    {
      type: "Reserva",
      category: "Imprevistos 5%",
      total: summary.contingency,
      base: summary.contingency,
      iva: 0,
      status: "Referencia",
    },
    ...summary.costRows.map((row) => ({
      type: "Costo",
      category: row.category,
      total: row.total,
      base: row.total / (1 + IVA_RATE),
      iva: row.total - row.total / (1 + IVA_RATE),
      status: eventRowsStatus(row),
    })),
    ...summary.incomeRowsByCategory.map((row) => ({
      type: "Ingreso",
      category: row.category,
      total: row.total,
      base: row.total,
      iva: 0,
      status: eventRowsStatus(row),
    })),
  ];

  replaceChildren(
    "#eventBudgetBody",
    rows.map((row) =>
      el("tr", {}, [
        el("td", { text: row.type }),
        el("td", { text: row.category }),
        el("td", { text: money(row.base) }),
        el("td", { text: row.iva ? money(row.iva) : "-" }),
        el("td", { text: money(row.total) }),
        el("td", {}, [
          el("span", {
            class: `pill ${row.status === "Real" ? "live" : row.status === "Meta" ? "approved" : "review"}`,
            text: row.status,
          }),
        ]),
      ]),
    ),
  );

  replaceChildren(
    "#eventScenarioCards",
    summary.scenarios.map((scenario) =>
      el("article", { class: scenario.utility < 0 ? "danger" : "good" }, [
        el("span", { text: scenario.label }),
        el("strong", { text: money(scenario.utility) }),
        el("small", { text: `${money(scenario.revenue)} venta | margen ${percentLabel(scenario.margin)}` }),
        el("em", { text: scenario.note }),
      ]),
    ),
  );

  replaceChildren(
    "#eventPartnerShare",
    partners.length
      ? partners.map((partner) => {
          const participation = numberValue(partner.participation);
          const utility = summary.profitExpected * (participation / 100);
          const capitalNeed = summary.costTarget * (participation / 100);
          const stats = partnerStats(partner.id);
          const realContribution = Math.max(numberValue(partner.contribution), stats.investment);

          return el("article", {}, [
            el("div", {}, [
              el("span", { text: `${partner.type} | ${percentLabel(participation)}` }),
              el("strong", { text: partner.name }),
            ]),
            el("dl", {}, [
              el("dt", { text: "Inversion segun %" }),
              el("dd", { text: money(capitalNeed) }),
              el("dt", { text: "Aporte real" }),
              el("dd", { text: money(realContribution) }),
              el("dt", { text: "Utilidad asignada" }),
              el("dd", { class: utility < 0 ? "negative-value" : "", text: money(utility) }),
            ]),
          ]);
        })
      : [
          el("article", { class: "warning" }, [
            el("strong", { text: "Sin socios vinculados" }),
            el("span", { text: "Agrega socios con porcentaje para ver inversion y utilidad por persona." }),
          ]),
        ],
  );
}

function renderEventReferencePanel(project) {
  const panel = $("#eventReferencePanel");
  if (!panel) {
    return;
  }

  const assets = eventReferenceAssets(project);
  if (!assets.length) {
    panel.classList.add("is-hidden");
    return;
  }

  panel.classList.remove("is-hidden");
  replaceChildren(
    "#eventReferenceGallery",
    assets.map((asset) =>
      el("figure", {}, [
        el("a", { href: asset.src, target: "_blank", rel: "noopener" }, [
          el("img", { src: asset.src, alt: asset.title, loading: "lazy" }),
        ]),
        el("figcaption", { text: asset.title }),
      ]),
    ),
  );
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
      : "Ya puedes registrar pagos, gastos y cobros. Cambia el estado a Aprobado, Evento en marcha, Negocio activo o En funcion cuando este listo para operar formalmente.",
  );
}

function clearAdminEditMode() {
  const form = $("#detailAdminForm");
  if (!form) {
    return;
  }

  form.reset();
  form.elements.movementId.value = "";
  form.elements.movementDate.value = today();
  form.elements.status.value = "Pagado";
  setTextIfExists("#detailAdminSubmitButton", "Guardar administracion");
  $("#detailAdminCancelButton").hidden = true;
  renderCategorySelects();
  renderPartnerSelects();
}

function editAdminMovement(movementId) {
  const movement = state.data.movements.find((item) => item.id === movementId);
  const form = $("#detailAdminForm");

  if (!movement || !form) {
    return;
  }

  form.elements.movementId.value = movement.id;
  form.elements.type.value = movement.type || "Gasto";
  renderCategorySelects();
  renderPartnerSelects();
  setSelectValue(form.elements.category, movement.category || "Operacion");
  form.elements.partnerId.value = movement.partnerId || "";
  form.elements.concept.value = movement.concept || "";
  form.elements.amount.value = numberValue(movement.amount) || "";
  form.elements.movementDate.value = movement.movementDate || today();
  form.elements.status.value = movement.status || "Pagado";
  setTextIfExists("#detailAdminSubmitButton", "Actualizar registro");
  $("#detailAdminCancelButton").hidden = false;
  form.scrollIntoView({ block: "center", behavior: "smooth" });
}

function populateProjectEditStatusSelect(form) {
  if (!form?.elements.status) {
    return;
  }

  const currentStatus = form.elements.status.value;
  form.elements.status.replaceChildren(
    ...PROJECT_STATUSES.map((status) => el("option", { value: status, text: status })),
  );
  form.elements.status.value = PROJECT_STATUSES.includes(currentStatus)
    ? currentStatus
    : "En revision";
}

function setSelectValue(select, value) {
  if (!select || !value) {
    return;
  }

  if (![...select.options].some((option) => option.value === value)) {
    select.append(el("option", { value, text: value }));
  }
  select.value = value;
}

function renderProjectEditPanel(project, current, movements) {
  const form = $("#detailProjectEditForm");
  if (!form) {
    return;
  }

  const initialBudget = projectInitialBudget(project);
  const budget = numberValue(project.budget);
  const variation = budget - initialBudget;
  const variationPercent = initialBudget ? (variation / initialBudget) * 100 : 0;
  const committed = current.expenses + current.investment;
  const paid = movements
    .filter((movement) => movement.type === "Gasto" && PAYMENT_CLOSED_STATUSES.has(movement.status))
    .reduce((sum, movement) => sum + numberValue(movement.amount), 0);
  const available = budget + current.income + current.investment - current.expenses;

  replaceChildren("#projectBudgetSummary", [
    budgetSummaryItem("Presupuesto inicial", money(initialBudget), "base original"),
    budgetSummaryItem("Presupuesto actualizado", money(budget), "valor vigente"),
    budgetSummaryItem("Variacion", money(variation), percentLabel(variationPercent), variation < 0 ? "danger" : variation > 0 ? "warning" : ""),
    budgetSummaryItem("Comprometido", money(committed), "inversiones + gastos"),
    budgetSummaryItem("Pagado", money(paid), "salidas cerradas"),
    budgetSummaryItem("Saldo disponible", money(available), "balance operativo", available < 0 ? "danger" : "good"),
  ]);

  populateProjectEditStatusSelect(form);
  const activeInsidePanel = $("#projectEditPanel")?.contains(document.activeElement);
  if (!activeInsidePanel || form.elements.projectId.value !== project.id) {
    form.elements.projectId.value = project.id;
    form.elements.name.value = project.name || "";
    setSelectValue(form.elements.type, project.type || "Proyecto personalizado");
    setSelectValue(form.elements.status, projectStatus(project));
    form.elements.budget.value = budget || "";
    form.elements.objective.value = project.objective || "";
    form.elements.reason.value = "";
  }
  updateBudgetChangePreview();
}

function budgetSummaryItem(label, value, note, tone = "") {
  return el("article", { class: tone }, [
    el("span", { text: label }),
    el("strong", { text: value }),
    el("small", { text: note }),
  ]);
}

function toggleProjectEditPanel(forceOpen = null) {
  const panel = $("#projectEditPanel");
  if (!panel) {
    return;
  }

  const shouldOpen = forceOpen === null ? panel.classList.contains("is-hidden") : forceOpen;
  panel.classList.toggle("is-hidden", !shouldOpen);
  if (shouldOpen) {
    const project = projectById(state.detailProjectId || state.selectedProjectId);
    if (project) {
      renderProjectEditPanel(
        project,
        totals(project.id),
        state.data.movements.filter((movement) => movement.projectId === project.id),
      );
    }
    panel.scrollIntoView({ block: "start", behavior: "smooth" });
  }
}

function updateBudgetChangePreview() {
  const form = $("#detailProjectEditForm");
  const project = projectById(form?.elements.projectId?.value);
  const preview = $("#budgetChangePreview");
  const pill = $("#projectBudgetDeltaPill");

  if (!form || !project || !preview) {
    return;
  }

  const previousBudget = numberValue(project.budget);
  const nextBudget = numberValue(form.elements.budget.value);
  const delta = nextBudget - previousBudget;
  const percentChange = previousBudget ? (delta / previousBudget) * 100 : 0;
  const originalDelta = nextBudget - projectInitialBudget(project);

  preview.replaceChildren(
    el("span", { text: `Anterior: ${money(previousBudget)}` }),
    el("span", { text: `Nuevo: ${money(nextBudget)}` }),
    el("span", { text: `Variacion: ${money(delta)} (${percentLabel(percentChange)})` }),
    el("span", { text: `Contra inicial: ${money(originalDelta)}` }),
  );

  if (pill) {
    pill.textContent = delta === 0 ? "Sin cambios" : `${delta > 0 ? "+" : ""}${money(delta)}`;
    pill.className = `pill ${delta < 0 ? "danger" : delta > 0 ? "warning" : ""}`;
  }
}

function clearDetailMovementEditMode() {
  const form = $("#detailMovementForm");
  if (!form) {
    return;
  }

  form.reset();
  form.elements.movementId.value = "";
  form.elements.movementDate.value = today();
  setTextIfExists("#detailMovementSubmitButton", "Guardar movimiento");
  $("#detailMovementCancelButton").hidden = true;
  renderCategorySelects();
  renderPartnerSelects();
}

function editDetailMovement(movementId, duplicate = false) {
  const movement = state.data.movements.find((item) => item.id === movementId);
  const form = $("#detailMovementForm");

  if (!movement || !form) {
    return;
  }

  form.elements.movementId.value = duplicate ? "" : movement.id;
  form.elements.type.value = movement.type || "Gasto";
  renderCategorySelects();
  renderPartnerSelects();
  setSelectValue(form.elements.category, movement.category || "Operacion");
  form.elements.partnerId.value = movement.partnerId || "";
  form.elements.concept.value = duplicate ? `${movement.concept || ""} copia`.trim() : movement.concept || "";
  form.elements.amount.value = numberValue(movement.amount) || "";
  form.elements.movementDate.value = movement.movementDate || today();
  form.elements.status.value = movement.status || "Registrado";
  setTextIfExists("#detailMovementSubmitButton", duplicate ? "Guardar copia" : "Actualizar movimiento");
  $("#detailMovementCancelButton").hidden = duplicate;
  form.scrollIntoView({ block: "center", behavior: "smooth" });
}

function clearDetailPartnerEditMode() {
  const form = $("#detailPartnerForm");
  if (!form) {
    return;
  }

  form.reset();
  form.elements.partnerId.value = "";
  form.elements.status.value = "Activo";
  setTextIfExists("#detailPartnerSubmitButton", "Guardar socio");
  $("#detailPartnerCancelButton").hidden = true;
  renderPartnerParticipationControls();
}

function editDetailPartner(partnerId) {
  const partner = partnerById(partnerId);
  const form = $("#detailPartnerForm");

  if (!partner || !form) {
    return;
  }

  if (state.activeTab !== "proyecto-detalle" || state.detailProjectId !== partner.projectId) {
    state.selectedProjectId = partner.projectId || state.selectedProjectId;
    state.summaryScopeId = partner.projectId || state.summaryScopeId;
    state.detailProjectId = partner.projectId || state.detailProjectId;
    setActiveView("proyecto-detalle");
    render();
    window.setTimeout(() => editDetailPartner(partnerId), 0);
    return;
  }

  state.selectedProjectId = partner.projectId || state.selectedProjectId;
  form.elements.partnerId.value = partner.id;
  form.elements.name.value = partner.name || "";
  setSelectValue(form.elements.type, partner.type || "Socio");
  form.elements.contribution.value = numberValue(partner.contribution) || "";
  form.elements.participation.value = numberValue(partner.participation) || "";
  setSelectValue(form.elements.status, partner.status || "Activo");
  setTextIfExists("#detailPartnerSubmitButton", "Actualizar socio");
  $("#detailPartnerCancelButton").hidden = false;
  renderPartnerParticipationControls();
  form.scrollIntoView({ block: "center", behavior: "smooth" });
}

function retireDetailPartner(partnerId) {
  const partner = partnerById(partnerId);
  if (!partner) {
    return;
  }

  if (!window.confirm(`Retirar socio ${partner.name} del proyecto sin borrar su historial?`)) {
    return;
  }

  submitAction(
    "update-partner",
    {
      ...partner,
      partnerId: partner.id,
      status: "Retirado",
    },
    "Socio retirado. El historial queda conservado.",
  );
}

function clearDetailInventoryEditMode() {
  const form = $("#detailInventoryForm");
  if (!form) {
    return;
  }

  form.reset();
  form.elements.inventoryId.value = "";
  form.elements.status.value = "Disponible";
  setTextIfExists("#detailInventorySubmitButton", "Agregar inventario");
  $("#detailInventoryCancelButton").hidden = true;
  renderCategorySelects();
}

function editDetailInventory(inventoryId) {
  const item = state.data.inventory.find((entry) => entry.id === inventoryId);
  const form = $("#detailInventoryForm");

  if (!item || !form) {
    return;
  }

  form.elements.inventoryId.value = item.id;
  form.elements.item.value = item.item || "";
  renderCategorySelects();
  setSelectValue(form.elements.category, item.category || "Inventario");
  form.elements.quantity.value = numberValue(item.quantity) || "";
  form.elements.unitCost.value = numberValue(item.unitCost) || "";
  setSelectValue(form.elements.status, item.status || "Disponible");
  setTextIfExists("#detailInventorySubmitButton", "Actualizar inventario");
  $("#detailInventoryCancelButton").hidden = false;
  form.scrollIntoView({ block: "center", behavior: "smooth" });
}

function focusDetailTarget(target) {
  if (target === "budget") {
    toggleProjectEditPanel(true);
    return;
  }

  if (["income", "investment", "expenses"].includes(target)) {
    const form = $("#detailMovementForm");
    if (!form) {
      return;
    }
    form.elements.type.value =
      target === "income" ? "Ingreso" : target === "investment" ? "Inversion" : "Gasto";
    renderCategorySelects();
    form.scrollIntoView({ block: "center", behavior: "smooth" });
  }
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

  $("#adminPdfButton").disabled = false;

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
        el("td", { text: partnerName(movement.partnerId) }),
        el("td", { text: movement.concept }),
        el("td", { text: money(movement.amount) }),
        el("td", {}, [
          el("div", { class: "row-actions" }, [
            el("button", {
              type: "button",
              text: "Editar",
              onclick: () => editAdminMovement(movement.id),
            }),
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
  renderProjectEditPanel(project, current, movements);
  renderProjectStatusPanel(project);
  renderEventControlPanel(project, movements, partners);
  renderEventReferencePanel(project);
  renderAdministration(project, movements);
  renderProjectionDashboard({
    metrics: "#detailProjectionMetrics",
    plane: "#detailProjectionPlane",
    insights: "#detailProjectionInsights",
    pill: "#detailProjectionPill",
  }, project.id);
  renderCandleChart("#detailCandles", movements);
  renderFlowGuide("#detailFlowGuide", movements);

  replaceChildren(
    "#detailMovementsBody",
    movements.map((movement) =>
      el("tr", {}, [
        el("td", { text: movement.movementDate }),
        el("td", { text: movement.type }),
        el("td", { text: movement.category }),
        el("td", { text: partnerName(movement.partnerId) }),
        el("td", { text: movement.concept }),
        el("td", { text: money(movement.amount) }),
        el("td", {}, [
          el("div", { class: "row-actions" }, [
            el("button", {
              type: "button",
              text: "Editar",
              onclick: () => editDetailMovement(movement.id),
            }),
            el("button", {
              type: "button",
              text: "Duplicar",
              onclick: () => editDetailMovement(movement.id, true),
            }),
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
    partners.map((partner) => renderPartnerCard(partner)),
  );

  replaceChildren(
    "#detailInventoryBody",
    inventory.map((item) =>
      el("tr", {}, [
        el("td", { text: item.item }),
        el("td", { text: item.category }),
        el("td", { text: String(numberValue(item.quantity)) }),
        el("td", { text: money(item.unitCost) }),
        el("td", { text: money(numberValue(item.quantity) * numberValue(item.unitCost)) }),
        el("td", { text: item.status || "Disponible" }),
        el("td", {}, [
          el("div", { class: "row-actions" }, [
            el("button", {
              type: "button",
              text: "Editar",
              onclick: () => editDetailInventory(item.id),
            }),
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

async function buildUserPayload(form, fallbackProjectId = "") {
  const data = formData(form);
  const username = String(data.username || "").trim().toLowerCase();
  const password = String(data.password || "");

  return {
    name: data.name,
    username,
    loginHash: await sha256Hex(username),
    passwordHash: await sha256Hex(`${password}:${USER_PASSWORD_SALT}`),
    role: data.role || "Invitado",
    projectId: data.projectId || fallbackProjectId || null,
  };
}

function publicUsers(users) {
  return users.map(({ emailHash, loginHash, passwordHash, ...user }) => user);
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
  state.loginSyncId += 1;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(SESSION_USER_KEY);
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
    ["Proyecto", "Socio", "Tipo", "Categoria", "Concepto", "Valor", "Fecha", "Estado"],
    ...movements.map((movement) => [
      projectName(movement.projectId),
      partnerName(movement.partnerId),
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

function percent(value) {
  return `${Math.round(numberValue(value))}%`;
}

function daysBetween(startDate, endDate) {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diff = Math.round((end - start) / 86400000);
  return Number.isFinite(diff) ? Math.max(1, diff + 1) : 0;
}

function movementRange(movements) {
  const dates = movements
    .map((movement) => movement.movementDate)
    .filter(Boolean)
    .sort();

  if (!dates.length) {
    return { from: "", to: "", days: 0 };
  }

  return {
    from: dates[0],
    to: dates[dates.length - 1],
    days: daysBetween(dates[0], dates[dates.length - 1]),
  };
}

function totalsForMovements(movements, projects = []) {
  const income = movements
    .filter((movement) => movement.type === "Ingreso")
    .reduce((sum, movement) => sum + numberValue(movement.amount), 0);
  const expenses = movements
    .filter((movement) => movement.type === "Gasto")
    .reduce((sum, movement) => sum + numberValue(movement.amount), 0);
  const investment = movements
    .filter((movement) => movement.type === "Inversion")
    .reduce((sum, movement) => sum + numberValue(movement.amount), 0);
  const budget = projects.reduce((sum, project) => sum + numberValue(project.budget), 0);

  return {
    income,
    expenses,
    investment,
    budget,
    balance: income + investment - expenses,
    operationalBalance: income - expenses,
  };
}

function projectReportAnalysis(project, scope) {
  const movements = scope.movements.filter((movement) => movement.projectId === project.id);
  const partners = scope.partners.filter((partner) => partner.projectId === project.id);
  const inventory = scope.inventory.filter((item) => item.projectId === project.id);
  const users = scope.users.filter((user) => !user.projectId || user.projectId === project.id);
  const audit = scope.audit.filter((entry) => !entry.projectId || entry.projectId === project.id);
  const current = totalsForMovements(movements, [project]);
  const participationStats = projectParticipationStats(project.id);
  const range = movementRange(movements);
  const adminTotals = administrationTotals(movements);
  const inventoryValue = inventory.reduce(
    (sum, item) => sum + numberValue(item.quantity) * numberValue(item.unitCost),
    0,
  );
  const capital = current.income + current.investment;
  const budgetGap = Math.max(0, current.budget - capital);
  const operatingGap = Math.max(0, current.expenses - current.income);
  const budgetProgress = current.budget ? Math.min(100, (capital / current.budget) * 100) : 0;
  const spendProgress = current.budget ? Math.min(100, (current.expenses / current.budget) * 100) : 0;
  const dailyIncome = range.days ? current.income / range.days : 0;
  const dailyExpenses = range.days ? current.expenses / range.days : 0;
  const projectedIncome30 = dailyIncome * 30;
  const projectedExpenses30 = dailyExpenses * 30;
  const projectedBalance30 = current.balance + projectedIncome30 - projectedExpenses30;
  const monthlyNet = projectedIncome30 - projectedExpenses30;
  const monthsToCoverBudget = monthlyNet > 0 && budgetGap > 0
    ? Math.ceil(budgetGap / monthlyNet)
    : 0;
  const completionChecks = [
    numberValue(project.budget) > 0,
    Boolean(project.objective),
    movements.length > 0,
    current.investment > 0,
    current.income > 0,
    current.expenses > 0,
    partners.length > 0,
    inventory.length > 0,
    canAdministrate(project),
  ];
  const completion = Math.round(
    (completionChecks.filter(Boolean).length / completionChecks.length) * 100,
  );
  const missing = [
    numberValue(project.budget) > 0 ? "" : "Registrar presupuesto.",
    project.objective ? "" : "Completar objetivo operativo.",
    movements.length ? "" : "Registrar al menos un movimiento financiero.",
    current.investment > 0 ? "" : "Registrar inversion o capital inicial.",
    current.income > 0 ? "" : "Registrar ingresos o cobros.",
    current.expenses > 0 ? "" : "Registrar gastos, pagos o cuentas por pagar.",
    partners.length ? "" : "Vincular socios, inversionistas o aliados.",
    participationStats.remaining > 0 ? `Queda ${percentLabel(participationStats.remaining)} de participacion disponible por asignar.` : "",
    participationStats.over > 0 ? `La participacion de socios excede 100% por ${percentLabel(participationStats.over)}.` : "",
    inventory.length ? "" : "Registrar inventario o activos.",
    canAdministrate(project) ? "" : "Cambiar estado a Aprobado, Inversion completada, Negocio activo o En funcion para administrar.",
    budgetGap > 0 ? `Falta ${money(budgetGap)} para igualar capital/ingresos con el presupuesto.` : "",
    operatingGap > 0 ? `Falta ${money(operatingGap)} para igualar ingresos operativos con gastos.` : "",
  ].filter(Boolean);
  const eventSummary = isEventProject(project)
    ? eventFinancialSummary(project, movements, partners)
    : null;

  return {
    project,
    movements,
    partners,
    inventory,
    users,
    audit,
    current,
    participationStats,
    range,
    adminTotals,
    inventoryValue,
    capital,
    budgetGap,
    operatingGap,
    budgetProgress,
    spendProgress,
    projectedIncome30,
    projectedExpenses30,
    projectedBalance30,
    monthlyNet,
    monthsToCoverBudget,
    completion,
    missing,
    eventSummary,
  };
}

function buildEventReportLines(summary) {
  if (!summary) {
    return [];
  }

  const categoryRows = [
    { type: "Costo fijo", category: "Presupuesto registrado", total: summary.costTarget, status: "Meta" },
    { type: "Reserva", category: "Imprevistos 5%", total: summary.contingency, status: "Referencia" },
    ...summary.costRows.map((row) => ({
      type: "Costo",
      category: row.category,
      total: row.total,
      status: eventRowsStatus(row),
    })),
    ...summary.incomeRowsByCategory.map((row) => ({
      type: "Ingreso",
      category: row.category,
      total: row.total,
      status: eventRowsStatus(row),
    })),
  ];
  const partnerLines = summary.partners.map((partner) => {
    const participation = numberValue(partner.participation);
    const utility = summary.profitExpected * (participation / 100);
    const capitalNeed = summary.costTarget * (participation / 100);
    const stats = partnerStats(partner.id);
    const realContribution = Math.max(numberValue(partner.contribution), stats.investment);
    return `- ${partner.name}: ${percentLabel(participation)} | inversion segun porcentaje ${money(capitalNeed)} | aporte real ${money(realContribution)} | utilidad asignada ${money(utility)}`;
  });

  return [
    "CONTROL DEL EVENTO EN MARCHA",
    `Costo fijo/meta: ${money(summary.costTarget)} | Base sin IVA: ${money(summary.subtotalNoIva)} | IVA estimado 15%: ${money(summary.ivaEstimated)} | Imprevistos 5%: ${money(summary.contingency)}`,
    `Venta total esperada: ${money(summary.incomeExpected)} | Cobrado real: ${money(summary.incomeReal)} | Capital socios/inversion: ${money(summary.capitalBase)}`,
    `Utilidad esperada: ${money(summary.profitExpected)} | Utilidad real registrada: ${money(summary.profitReal)} | Margen esperado: ${percentLabel(summary.marginExpected)} | Punto de equilibrio: ${money(summary.breakevenAmount)} | Cobertura: ${percentLabel(summary.breakeven)}`,
    summary.revenueGap
      ? `Brecha comercial: faltan ventas por ${money(summary.revenueGap)} para cubrir costo fijo.`
      : "Brecha comercial: la venta esperada cubre el costo fijo registrado.",
    "",
    ...reportLines(
      "Costos e ingresos por categoria:",
      categoryRows,
      (row) => `- ${row.type} | ${row.category} | ${money(row.total)} | ${row.status}`,
    ),
    "",
    ...reportLines(
      "Escenarios de utilidad:",
      summary.scenarios,
      (scenario) =>
        `- ${scenario.label}: venta ${money(scenario.revenue)} | utilidad ${money(scenario.utility)} | margen ${percentLabel(scenario.margin)} | ${scenario.note}`,
    ),
    "",
    ...reportLines("Reparto de socios:", partnerLines, (line) => line),
    "",
  ];
}

function projectConclusion(analysis) {
  if (!analysis.movements.length) {
    return "El proyecto esta creado, pero todavia no tiene base financiera para medir rendimiento. El siguiente paso es cargar presupuesto, inversion, gastos e ingresos reales.";
  }

  if (analysis.current.balance < 0) {
    return `El proyecto tiene balance negativo de ${money(Math.abs(analysis.current.balance))}. Conviene revisar gastos, pagos pendientes y fuentes de ingreso antes de ampliar operaciones.`;
  }

  if (analysis.operatingGap > 0) {
    return `El proyecto se sostiene con capital o inversion, pero los ingresos aun no cubren los gastos. Debe cerrar una brecha operativa de ${money(analysis.operatingGap)}.`;
  }

  if (analysis.budgetGap > 0) {
    return `El proyecto mantiene balance positivo, pero aun falta ${money(analysis.budgetGap)} para cubrir el presupuesto previsto con capital e ingresos registrados.`;
  }

  return "El proyecto esta equilibrado frente al presupuesto registrado y puede revisarse para operar o escalar con control administrativo.";
}

function projectionText(analysis) {
  if (!analysis.range.days) {
    return "Sin movimientos suficientes para proyectar. Registra fechas, ingresos y gastos para calcular tendencia.";
  }

  const base = `Con ${analysis.range.days} dias de historial (${analysis.range.from} a ${analysis.range.to}), la proyeccion a 30 dias estima ingresos por ${money(analysis.projectedIncome30)}, gastos por ${money(analysis.projectedExpenses30)} y balance final de ${money(analysis.projectedBalance30)}.`;
  if (analysis.monthsToCoverBudget > 0) {
    return `${base} A este ritmo faltarian aproximadamente ${analysis.monthsToCoverBudget} meses para cubrir la brecha del presupuesto.`;
  }
  if (analysis.monthlyNet <= 0 && analysis.budgetGap > 0) {
    return `${base} Con la tendencia actual no se cubre la brecha del presupuesto; se necesitan mas ingresos o menor gasto operativo.`;
  }
  return base;
}

function buildProjectReportLines(analysis) {
  const categoryRows = categoryReportRows(analysis.movements);

  return [
    `PROYECTO: ${analysis.project.name}`,
    `Tipo: ${analysis.project.type}`,
    `Estado: ${projectStatus(analysis.project)}`,
    `Objetivo: ${analysis.project.objective || "Sin objetivo operativo registrado."}`,
    `Presupuesto: ${money(analysis.current.budget)}`,
    `Capital registrado (ingresos + inversiones): ${money(analysis.capital)}`,
    `Ingresos: ${money(analysis.current.income)}`,
    `Inversiones: ${money(analysis.current.investment)}`,
    `Gastos: ${money(analysis.current.expenses)}`,
    `Balance total: ${money(analysis.current.balance)}`,
    `Balance operativo (ingresos - gastos): ${money(analysis.current.operationalBalance)}`,
    `Participacion socios: asignada ${percentLabel(analysis.participationStats.assigned)}, disponible ${percentLabel(analysis.participationStats.remaining)}, excedente ${percentLabel(analysis.participationStats.over)}`,
    `Capital real de socios: ${money(analysis.participationStats.contribution)}`,
    analysis.participationStats.surplus > 0
      ? `Sobrante de capital frente al presupuesto: ${money(analysis.participationStats.surplus)}`
      : `Capital faltante frente al presupuesto: ${money(analysis.participationStats.budgetGap)}`,
    `Avance contra presupuesto: ${percent(analysis.budgetProgress)}`,
    `Uso del presupuesto en gastos: ${percent(analysis.spendProgress)}`,
    `Valor inventario/activos: ${money(analysis.inventoryValue)}`,
    `Pagado: ${money(analysis.adminTotals.paid)}`,
    `Pendiente por pagar: ${money(analysis.adminTotals.pending)}`,
    `Nivel de completado del expediente: ${percent(analysis.completion)}`,
    `Proyeccion: ${projectionText(analysis)}`,
    `Conclusion: ${projectConclusion(analysis)}`,
    "",
    ...buildEventReportLines(analysis.eventSummary),
    ...reportLines("Faltantes por completar o igualar:", analysis.missing, (item) => `- ${item}`),
    "",
    ...reportLines("Totales por categoria:", categoryRows, (row) => `- ${row.label}: ${money(row.value)}`),
    "",
    ...reportLines(
      "Movimientos detallados:",
      analysis.movements,
      (movement) =>
        `- ${movement.movementDate} | ${movement.type} | ${movement.category} | Socio: ${partnerName(movement.partnerId)} | ${movement.concept} | ${money(movement.amount)} | ${movement.status}`,
    ),
    "",
    ...reportLines(
      "Socios, inversionistas y aliados:",
      analysis.partners,
      (partner) => {
        const stats = partnerStats(partner.id);
        return `- ${partner.name} | ${partner.type} | Aporte base ${money(partner.contribution)} | Participacion ${numberValue(partner.participation)}% | Aportes/Inversiones mov. ${money(stats.investment)} | Ingresos ${money(stats.income)} | Gastos ${money(stats.expenses)} | Disponible ${money(stats.totalAvailable)} | Movimientos ${stats.movements.length} | Estado ${partner.status}`;
      },
    ),
    "",
    ...reportLines(
      "Inventario y activos:",
      analysis.inventory,
      (item) =>
        `- ${item.item} | ${item.category} | Cantidad ${item.quantity} | Unitario ${money(item.unitCost)} | Total ${money(numberValue(item.quantity) * numberValue(item.unitCost))} | Estado ${item.status}`,
    ),
    "",
    ...reportLines(
      "Usuarios vinculados:",
      analysis.users,
      (user) => `- ${user.name} | ${user.username || ""} | ${user.role} | ${user.status}`,
    ),
    "",
    ...reportLines(
      "Auditoria del proyecto:",
      analysis.audit,
      (entry) => `- ${entry.createdAt || ""} | ${entry.action} | ${entry.detail}`,
    ),
  ];
}

function reportConclusions(scope, analyses) {
  if (!scope.projects.length) {
    return [
      "No hay proyectos registrados todavia.",
      "El informe esta limpio y listo para empezar con datos reales.",
      "Crea el primer proyecto y luego registra inversion, gastos, ingresos, socios e inventario para obtener proyecciones utiles.",
    ];
  }

  const withNegativeBalance = analyses.filter((analysis) => analysis.current.balance < 0);
  const withOperatingGap = analyses.filter((analysis) => analysis.operatingGap > 0);
  const incomplete = analyses.filter((analysis) => analysis.completion < 100);
  const pending = analyses.reduce((sum, analysis) => sum + analysis.adminTotals.pending, 0);
  const lines = [
    `Se analizaron ${scope.projects.length} proyecto(s) con ${scope.movements.length} movimiento(s) registrados.`,
    `Balance consolidado: ${money(scope.current.balance)}. Pendiente administrativo: ${money(pending)}.`,
  ];

  if (withNegativeBalance.length) {
    lines.push(
      `Atencion: ${withNegativeBalance.length} proyecto(s) tienen balance negativo y requieren revision de gastos o ingresos.`,
    );
  }
  if (withOperatingGap.length) {
    lines.push(
      `${withOperatingGap.length} proyecto(s) aun no igualan ingresos operativos con gastos.`,
    );
  }
  if (incomplete.length) {
    lines.push(
      `${incomplete.length} proyecto(s) tienen informacion pendiente para completar expediente, administracion o proyeccion.`,
    );
  }
  if (!withNegativeBalance.length && !withOperatingGap.length && !incomplete.length) {
    lines.push("Los proyectos registrados estan completos y equilibrados segun la informacion cargada.");
  }

  return lines;
}

function buildReport(projectId = summaryProjectId()) {
  const scope = reportScope(projectId);
  const categoryRows = categoryReportRows(scope.movements);
  const adminTotals = administrationTotals(scope.movements);
  const adminRows = administrationMovements(scope.movements);
  const analyses = scope.projects.map((project) => projectReportAnalysis(project, scope));
  const pendingTotal = analyses.reduce((sum, analysis) => sum + analysis.adminTotals.pending, 0);
  const budgetGapTotal = analyses.reduce((sum, analysis) => sum + analysis.budgetGap, 0);
  const operatingGapTotal = analyses.reduce((sum, analysis) => sum + analysis.operatingGap, 0);

  return [
    `ProN - Informe completo (${scope.label})`,
    `Fecha: ${today()}`,
    "",
    "RESUMEN GENERAL",
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
    `Pendiente: ${money(pendingTotal)}`,
    `Ingreso operativo: ${money(adminTotals.income)}`,
    `Brecha total para igualar presupuesto: ${money(budgetGapTotal)}`,
    `Brecha total para equilibrio operativo: ${money(operatingGapTotal)}`,
    `Eventos de auditoria: ${scope.audit.length}`,
    "",
    ...reportLines("CONCLUSIONES EJECUTIVAS", reportConclusions(scope, analyses), (line) => `- ${line}`),
    "",
    ...reportLines(
      "PROYECCIONES CONSOLIDADAS",
      analyses,
      (analysis) => `- ${analysis.project.name}: ${projectionText(analysis)}`,
    ),
    "",
    ...reportLines(
      "FALTANTES CRITICOS POR PROYECTO",
      analyses,
      (analysis) =>
        `- ${analysis.project.name}: ${
          analysis.missing.length ? analysis.missing.join(" ") : "Sin faltantes criticos segun los datos cargados."
        }`,
    ),
    "",
    ...reportLines(
      "ADMINISTRACION OPERATIVA CONSOLIDADA",
      adminRows,
      (movement) =>
        `- ${movement.movementDate} | ${movement.status || "Registrado"} | ${movement.type} | ${movement.category} | Socio: ${partnerName(movement.partnerId)} | ${movement.concept} | ${money(movement.amount)}`,
    ),
    "",
    ...reportLines("TOTALES POR CATEGORIA", categoryRows, (row) => `- ${row.label}: ${money(row.value)}`),
    "",
    ...reportLines(
      "PROYECTOS REGISTRADOS",
      scope.projects,
      (project) =>
        `- ${project.name}: ${project.status}, ${money(project.budget)} | ${project.objective}`,
    ),
    "",
    "DETALLE COMPLETO POR PROYECTO",
    ...(analyses.length
      ? analyses.flatMap((analysis, index) => [
          "",
          `--- Proyecto ${index + 1} de ${analyses.length} ---`,
          ...buildProjectReportLines(analysis),
        ])
      : ["- Sin proyectos registrados."]),
    "",
    ...reportLines(
      "MOVIMIENTOS CONSOLIDADOS",
      scope.movements,
      (movement) =>
        `- ${movement.movementDate} | ${projectName(movement.projectId)} | Socio: ${partnerName(movement.partnerId)} | ${movement.type} | ${movement.category} | ${movement.concept} | ${money(movement.amount)} | ${movement.status}`,
    ),
    "",
    ...reportLines(
      "SOCIOS CONSOLIDADOS",
      scope.partners,
      (partner) => {
        const stats = partnerStats(partner.id);
        return `- ${partner.name} | ${partner.type} | ${projectName(partner.projectId)} | Aporte base ${money(partner.contribution)} | Aportes/Inversiones ${money(stats.investment)} | Gastos ${money(stats.expenses)} | Disponible ${money(stats.totalAvailable)} | ${numberValue(partner.participation)}%`;
      },
    ),
    "",
    ...reportLines(
      "INVENTARIO CONSOLIDADO",
      scope.inventory,
      (item) =>
        `- ${item.item} | ${item.category} | ${item.quantity} x ${money(item.unitCost)} | ${money(numberValue(item.quantity) * numberValue(item.unitCost))} | ${projectName(item.projectId)}`,
    ),
    "",
    ...reportLines(
      "USUARIOS Y PERMISOS",
      scope.users,
      (user) => `- ${user.name} | ${user.username || ""} | ${user.role} | ${accessName(user.projectId)} | ${user.status}`,
    ),
    "",
    ...reportLines(
      "AUDITORIA",
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
  const analyses = scope.projects.map((project) => projectReportAnalysis(project, scope));
  const capital = scope.current.income + scope.current.investment;
  const budgetGapTotal = analyses.reduce((sum, analysis) => sum + analysis.budgetGap, 0);
  const operatingGapTotal = analyses.reduce((sum, analysis) => sum + analysis.operatingGap, 0);
  const projectedIncome30 = analyses.reduce((sum, analysis) => sum + analysis.projectedIncome30, 0);
  const projectedExpenses30 = analyses.reduce((sum, analysis) => sum + analysis.projectedExpenses30, 0);
  const projectedBalance30 = scope.current.balance + projectedIncome30 - projectedExpenses30;
  const completion = analyses.length
    ? Math.round(analyses.reduce((sum, analysis) => sum + analysis.completion, 0) / analyses.length)
    : 0;
  const eventSummaries = analyses.map((analysis) => analysis.eventSummary).filter(Boolean);
  const eventIncomeExpected = eventSummaries.reduce((sum, summary) => sum + summary.incomeExpected, 0);
  const eventProfitExpected = eventSummaries.reduce((sum, summary) => sum + summary.profitExpected, 0);
  const eventCostTarget = eventSummaries.reduce((sum, summary) => sum + summary.costTarget, 0);
  const eventBreakeven = eventCostTarget ? (eventIncomeExpected / eventCostTarget) * 100 : 0;
  const cardWidth = 172;
  const cardHeight = 54;
  const gap = 12;
  const startX = 36;
  const startY = 650;
  const eventCards = eventSummaries.length
    ? [
        ["Venta evento", money(eventIncomeExpected), PIE_COLORS[1]],
        ["Utilidad evento", money(eventProfitExpected), eventProfitExpected < 0 ? "#d95f43" : "#0f766e"],
        ["Pto equilibrio", money(eventCostTarget), "#d95f43"],
        ["Cobertura evento", percentLabel(eventBreakeven), eventBreakeven >= 100 ? "#0f766e" : "#f2b84b"],
      ]
    : [];
  const cards = [
    ...eventCards,
    ["Presupuesto", money(scope.current.budget), PIE_COLORS[0]],
    ["Capital real", money(capital), PIE_COLORS[1]],
    ["Balance", money(scope.current.balance), "#10201d"],
    ["Brecha presup.", money(budgetGapTotal), "#d95f43"],
    ["Brecha oper.", money(operatingGapTotal), "#f2b84b"],
    ["Proy. 30 dias", money(projectedBalance30), projectedBalance30 < 0 ? "#d95f43" : "#0f766e"],
    ["Ingresos", money(scope.current.income), PIE_COLORS[1]],
    ["Gastos", money(scope.current.expenses), PIE_COLORS[3]],
    ["Pendiente", money(adminTotals.pending), "#d95f43"],
    ["Expediente", `${completion}%`, "#5b7f67"],
  ].slice(0, 10);
  const commands = [
    pdfRect(0, 0, 612, 792, { fill: "#f6f8f5", stroke: null }),
    pdfText("ProN", 36, 754, 20, "#10201d", true),
    pdfText(`Informe completo - ${scope.label}`, 36, 734, 11, "#65736f"),
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
  commands.push(pdfText("Distribucion financiera real", 52, 452, 11, "#10201d", true));
  drawPdfPie(commands, 106, 392, 46, financeItems);
  drawPdfLegend(commands, 166, 420, financeItems);

  commands.push(pdfRect(324, 330, 252, 142, { fill: "#ffffff", stroke: "#dbe3df" }));
  commands.push(pdfText("Presupuesto registrado", 340, 452, 11, "#10201d", true));
  drawPdfPie(commands, 394, 392, 46, budgetItems);
  drawPdfLegend(commands, 454, 420, budgetItems);

  commands.push(pdfText("Plano de flujo y proyeccion", 36, 310, 12, "#10201d", true));
  drawPdfCandleChart(commands, 36, 142, 540, 150, scope.movements);

  commands.push(pdfText("Indicadores por proyecto", 36, 122, 12, "#10201d", true));
  commands.push(pdfRect(36, 42, 540, 70, { fill: "#ffffff", stroke: "#dbe3df" }));
  drawPdfBudgetBars(commands, 52, 52, 508, 48, scope.projects);
  commands.push(pdfText("Pagina 1 - cuadros, proyecciones, pasteles, flujo, indicadores y brechas", 36, 22, 8, "#65736f"));

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
  downloadBlob(buildReportPdf(projectId), `pron-informe-completo-${safeFileName(scope.label)}.pdf`);
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
      `Socio/responsable: ${partnerName(movement.partnerId)}`,
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
  const stats = partnerStats(partner.id);
  downloadPdf(
    `pron-socio-${safeFileName(partner.name)}.pdf`,
    "ProN - Ficha de socio",
    [
      `Nombre: ${partner.name}`,
      `Tipo: ${partner.type}`,
      `Proyecto: ${projectName(partner.projectId)}`,
      `Aporte base registrado: ${money(partner.contribution)}`,
      `Participacion: ${numberValue(partner.participation)}%`,
      `Estado: ${partner.status}`,
      `Aportes/Inversiones asignadas: ${money(stats.investment)}`,
      `Ingresos asignados: ${money(stats.income)}`,
      `Gastos asignados: ${money(stats.expenses)}`,
      `Balance de movimientos: ${money(stats.movementBalance)}`,
      `Disponible con aporte base: ${money(stats.totalAvailable)}`,
      "",
      "MOVIMIENTOS ASIGNADOS",
      ...(stats.movements.length
        ? stats.movements.map(
            (movement) =>
              `- ${movement.movementDate} | ${movement.type} | ${movement.category} | ${movement.concept} | ${money(movement.amount)} | ${movement.status}`,
          )
        : ["- Sin movimientos asignados a este socio."]),
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
      `Usuario: ${user.username || ""}`,
      `Acceso: ${accessName(user.projectId)}`,
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
        users: publicUsers(state.data.users.filter((user) => inSummaryScope(user.projectId))),
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
  $("#partnerForm").elements.participation.addEventListener("input", renderPartnerParticipationControls);
  $("#partnerForm").elements.contribution.addEventListener("input", renderPartnerParticipationControls);
  $("#partnerProjectInput").addEventListener("change", (event) => {
    state.selectedProjectId = event.target.value;
    $("#projectSelect").value = event.target.value;
    renderPartnerSelects();
    renderPartnerParticipationControls();
    renderPartners();
  });
  $("#detailPartnerForm").elements.participation.addEventListener("input", renderPartnerParticipationControls);
  $("#detailPartnerForm").elements.contribution.addEventListener("input", renderPartnerParticipationControls);
  $("#backToProjectsButton").addEventListener("click", () => setActiveView("proyectos"));
  $("#detailPdfButton").addEventListener("click", () => {
    downloadProjectReport(state.detailProjectId || state.selectedProjectId);
  });
  $("#adminPdfButton").addEventListener("click", () => {
    downloadProjectReport(state.detailProjectId || state.selectedProjectId);
  });
  $("#detailAdminCancelButton").addEventListener("click", clearAdminEditMode);
  $("#detailMovementCancelButton").addEventListener("click", clearDetailMovementEditMode);
  $("#detailPartnerCancelButton").addEventListener("click", clearDetailPartnerEditMode);
  $("#detailInventoryCancelButton").addEventListener("click", clearDetailInventoryEditMode);
  $("#detailEditProjectButton").addEventListener("click", () => toggleProjectEditPanel());
  $("#detailProjectEditCancelButton").addEventListener("click", () => toggleProjectEditPanel(false));
  $("#detailProjectEditForm").elements.budget.addEventListener("input", updateBudgetChangePreview);
  $("#detailProjectEditForm").elements.status.addEventListener("change", updateBudgetChangePreview);
  $$(".interactive-kpi").forEach((card) => {
    const openTarget = () => focusDetailTarget(card.dataset.detailTarget);
    card.addEventListener("click", openTarget);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openTarget();
      }
    });
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
    renderPartnerParticipationControls();
  });

  $("#movementForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireSelectedProject()) {
      return;
    }
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

  $("#detailProjectEditForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = formData(form);
    const project = projectById(data.projectId);

    if (!project) {
      setMessage("Abre un proyecto para editarlo.", "warning");
      return;
    }

    const nextBudget = numberValue(data.budget);
    const previousBudget = numberValue(project.budget);
    const budgetChanged = Math.abs(nextBudget - previousBudget) > 0.009;

    if (
      budgetChanged &&
      !window.confirm(
        `Esta modificacion cambiara los calculos financieros del proyecto.\nAnterior: ${money(previousBudget)}\nNuevo: ${money(nextBudget)}\nImpacto: ${money(nextBudget - previousBudget)}\nConfirmar?`,
      )
    ) {
      return;
    }

    submitAction(
      "update-project",
      {
        ...data,
        budget: nextBudget,
      },
      "Proyecto actualizado.",
    );
  });

  $("#detailMovementForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const projectId = state.detailProjectId || state.selectedProjectId;
    if (!requireSelectedProject("Abre o crea un proyecto para registrar movimientos.", projectId)) {
      return;
    }
    const data = formData(event.currentTarget);
    const isEditing = Boolean(data.movementId);
    submitAction(
      isEditing ? "update-movement" : "create-movement",
      {
        ...data,
        projectId,
        amount: numberValue(data.amount),
      },
      isEditing ? "Movimiento actualizado." : "Movimiento guardado.",
    );
    clearDetailMovementEditMode();
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

    if (!project) {
      setMessage("Abre o crea un proyecto para registrar administracion.", "warning");
      return;
    }

    const data = formData(event.currentTarget);
    const isEditing = Boolean(data.movementId);
    submitAction(
      isEditing ? "update-movement" : "create-movement",
      {
        ...data,
        projectId: project.id,
        amount: numberValue(data.amount),
      },
      isEditing ? "Registro administrativo actualizado." : "Registro administrativo guardado.",
    );
    clearAdminEditMode();
  });

  $("#partnerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const projectId = partnerFormProjectId();
    if (!projectId) {
      setMessage("Escoge el proyecto donde quieres guardar este socio.", "warning");
      return;
    }
    const data = formData(event.currentTarget);
    if (!validatePartnerParticipation(projectId, data.participation)) {
      renderPartnerParticipationControls();
      return;
    }
    submitAction(
      "create-partner",
      {
        ...data,
        projectId,
        contribution: numberValue(data.contribution),
        participation: numberValue(data.participation),
      },
      "Socio guardado.",
    );
    event.currentTarget.reset();
    event.currentTarget.elements.projectId.value = projectId;
    renderPartnerParticipationControls();
  });

  $("#detailPartnerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const projectId = state.detailProjectId || state.selectedProjectId;
    if (!projectId) {
      setMessage("Abre o crea un proyecto para vincular socios.", "warning");
      return;
    }
    const data = formData(event.currentTarget);
    const isEditing = Boolean(data.partnerId);
    if (!validatePartnerParticipation(projectId, data.participation, data.partnerId)) {
      renderPartnerParticipationControls();
      return;
    }
    submitAction(
      isEditing ? "update-partner" : "create-partner",
      {
        ...data,
        projectId,
        contribution: numberValue(data.contribution),
        participation: numberValue(data.participation),
      },
      isEditing ? "Socio actualizado." : "Socio guardado.",
    );
    clearDetailPartnerEditMode();
  });

  $("#inventoryForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireSelectedProject("Crea primero un proyecto para registrar inventario.")) {
      return;
    }
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
    const projectId = state.detailProjectId || state.selectedProjectId;
    if (!projectId) {
      setMessage("Abre o crea un proyecto para registrar inventario.", "warning");
      return;
    }
    const data = formData(event.currentTarget);
    const isEditing = Boolean(data.inventoryId);
    submitAction(
      isEditing ? "update-inventory" : "create-inventory",
      {
        ...data,
        projectId,
        quantity: numberValue(data.quantity),
        unitCost: numberValue(data.unitCost),
      },
      isEditing ? "Inventario editado." : "Inventario actualizado.",
    );
    clearDetailInventoryEditMode();
  });

  $("#userForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = await buildUserPayload(event.currentTarget, state.selectedProjectId);
    if (userLoginExists(payload.loginHash)) {
      setMessage("Ese usuario ya existe. Usa otro usuario de acceso.", "warning");
      return;
    }
    submitAction(
      "create-user",
      payload,
      "Usuario creado.",
    );
    event.currentTarget.reset();
  });

  $("#detailUserForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = await buildUserPayload(
      event.currentTarget,
      state.detailProjectId || state.selectedProjectId,
    );
    if (userLoginExists(payload.loginHash)) {
      setMessage("Ese usuario ya existe. Usa otro usuario de acceso.", "warning");
      return;
    }
    submitAction(
      "create-user",
      payload,
      "Usuario creado.",
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
