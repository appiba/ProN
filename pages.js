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

function setMessage(message, tone = "info") {
  const notice = $("#notice");
  notice.textContent = message;
  notice.className = `notice show ${tone === "error" ? "error" : ""}`;
}

function setLoginMessage(message) {
  $("#loginMessage").textContent = message;
}

function setBusy(isBusy) {
  state.busy = isBusy;
  $$("button").forEach((button) => {
    if (button.id !== "logoutButton") {
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

  const result = await jsonpRequest(body);

  if (result.ok === false) {
    throw new Error(result.error || "No se pudo completar la operacion.");
  }

  return result;
}

function jsonpRequest(payload) {
  return new Promise((resolve, reject) => {
    const callbackName = `pronCallback_${Date.now()}_${Math.round(
      Math.random() * 100000,
    )}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Apps Script no respondio. Base local activa."));
    }, 10000);

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
      reject(new Error("Apps Script no respondio. Base local activa."));
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
    $("#backendStatus").textContent = result.ok
      ? "Apps Script listo: Google Sheets activo"
      : "Base local lista; Apps Script pendiente";
  } catch {
    state.backend = "local";
    $("#backendStatus").textContent =
      "Base local lista; Apps Script aun no responde";
  }
}

function showDashboard() {
  $("#loginScreen").classList.add("is-hidden");
  $("#dashboard").classList.remove("is-hidden");
  $("#sessionName").textContent = state.user?.name || "Administrador General";
  $("#sessionRole").textContent = state.user?.role || "Superadministrador";
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

  if (
    emailHash !== SUPERADMIN_EMAIL_SHA256 ||
    passwordHash !== SUPERADMIN_PASSWORD_SHA256
  ) {
    setLoginMessage("Credenciales invalidas.");
    setBusy(false);
    return;
  }

  state.token = `${LOCAL_TOKEN_PREFIX}${Date.now()}`;
  state.user = {
    name: "Administrador General",
    role: "Superadministrador",
    access: "Completo",
  };
  state.data = loadLocalData();
  state.selectedProjectId = state.data.projects[0]?.id || "";
  sessionStorage.setItem(TOKEN_KEY, state.token);
  $("#loginForm").reset();
  $("#rememberInput").checked = true;
  showDashboard();
  setMessage(
    "Base de datos local activa. Intentando sincronizar Google Sheets en segundo plano.",
    "error",
  );
  setBusy(false);

  try {
    const result = await callBackend(
      "login",
      {
        emailHash,
        passwordHash,
        remember: $("#rememberInput").checked,
      },
      false,
    );
    state.token = result.token;
    state.user = result.user;
    state.data = normalizeData(result.data);
    state.selectedProjectId = state.data.projects[0]?.id || "";
    sessionStorage.setItem(TOKEN_KEY, result.token);
    showDashboard();
    setMessage("Datos sincronizados con Google Sheets.");
  } catch (error) {
    setMessage(
      "Entraste a ProN con base local. Apps Script aun no responde para Google Sheets.",
      "error",
    );
  } finally {
    setBusy(false);
  }
}

async function refreshData() {
  if (isLocalSession()) {
    setMessage(
      "Base local activa. Cuando el Apps Script responda, cierra sesion y entra de nuevo para conectar Google Sheets.",
      "error",
    );
    render();
    return;
  }

  setBusy(true);

  try {
    const result = await callBackend("get-data");
    state.data = normalizeData(result.data);
    setMessage("Datos actualizados desde Google Sheets.");
    render();
  } catch (error) {
    setMessage(error.message, "error");
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
    state.user = {
      name: "Administrador General",
      role: "Superadministrador",
      access: "Completo",
    };
    state.data = loadLocalData();
    state.selectedProjectId = state.data.projects[0]?.id || "";
    showDashboard();
    setMessage(
      "Base de datos local activa. Apps Script queda como sincronizacion pendiente.",
      "error",
    );
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
    showDashboard();
  } catch {
    sessionStorage.removeItem(TOKEN_KEY);
    state.token = "";
    showLogin("Inicia sesion para conectar ProN con Google Sheets.");
  }
}

async function submitAction(action, payload, successMessage) {
  if (isLocalSession()) {
    applyLocalAction(action, payload);
    saveLocalData();
    setMessage(
      `${successMessage.replace("Google Sheets", "la base local")} Sincronizacion pendiente con Google Sheets.`,
      "error",
    );
    render();
    return;
  }

  setBusy(true);

  try {
    const result = await callBackend(action, payload);
    state.data = normalizeData(result.data);
    if (!state.data.projects.some((project) => project.id === state.selectedProjectId)) {
      state.selectedProjectId = state.data.projects[0]?.id || "";
    }
    setMessage(successMessage);
    render();
  } catch (error) {
    setMessage(error.message, "error");
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
  return state.data.projects.filter((project) =>
    `${project.name} ${project.type} ${project.status}`.toLowerCase().includes(search),
  );
}

function filteredMovements() {
  const search = state.search.toLowerCase();
  return state.data.movements.filter((movement) =>
    `${projectName(movement.projectId)} ${movement.type} ${movement.category} ${movement.concept}`
      .toLowerCase()
      .includes(search),
  );
}

function totals() {
  const income = state.data.movements
    .filter((movement) => movement.type === "Ingreso")
    .reduce((sum, movement) => sum + numberValue(movement.amount), 0);
  const expenses = state.data.movements
    .filter((movement) => movement.type === "Gasto")
    .reduce((sum, movement) => sum + numberValue(movement.amount), 0);
  const investment = state.data.movements
    .filter((movement) => movement.type === "Inversion")
    .reduce((sum, movement) => sum + numberValue(movement.amount), 0);
  const budget = state.data.projects.reduce(
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
  $("#metricBudget").textContent = money(current.budget);
  $("#metricIncome").textContent = money(current.income);
  $("#metricInvestment").textContent = money(current.investment);
  $("#metricExpenses").textContent = money(current.expenses);
  $("#balanceBadge").textContent = `Balance ${money(current.balance)}`;
}

function renderProjectSelects() {
  const options = state.data.projects.map((project) =>
    el("option", { value: project.id, text: project.name }),
  );
  const projectSelect = $("#projectSelect");
  projectSelect.replaceChildren(...options);
  projectSelect.value = state.selectedProjectId;
}

function renderSummary() {
  replaceChildren(
    "#breakevenList",
    state.data.projects.map((project) => {
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
    state.data.movements.slice(0, 7).map((movement) =>
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
    state.data.audit.slice(0, 7).map((entry) =>
      el("li", {}, [
        el("strong", { text: entry.action }),
        el("span", { text: `${entry.createdAt || ""} - ${entry.detail}` }),
      ]),
    ),
  );
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
                $("#projectSelect").value = project.id;
                setMessage(`Proyecto activo: ${project.name}.`);
              },
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
      ]),
    ),
  );
}

function renderPartners() {
  replaceChildren(
    "#partnersCards",
    state.data.partners.map((partner) =>
      el("div", {}, [
        el("span", { text: partner.type }),
        el("b", { text: partner.name }),
        el("small", { text: projectName(partner.projectId) }),
        el("strong", {
          text: `${money(partner.contribution)} - ${numberValue(partner.participation)}%`,
        }),
      ]),
    ),
  );
}

function renderInventory() {
  replaceChildren(
    "#inventoryBody",
    state.data.inventory.map((item) =>
      el("tr", {}, [
        el("td", { text: projectName(item.projectId) }),
        el("td", { text: item.item }),
        el("td", { text: item.category }),
        el("td", { text: String(item.quantity) }),
        el("td", { text: money(numberValue(item.quantity) * numberValue(item.unitCost)) }),
      ]),
    ),
  );
}

function renderUsers() {
  replaceChildren(
    "#usersBody",
    state.data.users.map((user) =>
      el("tr", {}, [
        el("td", { text: user.name }),
        el("td", { text: user.role }),
        el("td", { text: projectName(user.projectId) }),
        el("td", { text: user.status }),
      ]),
    ),
  );
}

function renderReports() {
  const current = totals();
  replaceChildren(
    "#chartBars",
    state.data.projects.map((project) => {
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

function buildCsv() {
  const rows = [
    ["Proyecto", "Tipo", "Categoria", "Concepto", "Valor", "Fecha", "Estado"],
    ...state.data.movements.map((movement) => [
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

function buildReport() {
  const current = totals();
  return [
    "ProN - Informe ejecutivo",
    `Fecha: ${today()}`,
    `Presupuesto total: ${money(current.budget)}`,
    `Ingresos: ${money(current.income)}`,
    `Inversiones: ${money(current.investment)}`,
    `Gastos: ${money(current.expenses)}`,
    `Balance: ${money(current.balance)}`,
    "",
    "Proyectos:",
    ...state.data.projects.map(
      (project) => `- ${project.name}: ${project.status}, ${money(project.budget)}`,
    ),
  ].join("\n");
}

function bindEvents() {
  $("#loginForm").addEventListener("submit", login);
  $("#refreshButton").addEventListener("click", refreshData);
  $("#logoutButton").addEventListener("click", () => {
    sessionStorage.removeItem(TOKEN_KEY);
    state.token = "";
    state.user = null;
    showLogin("Sesion cerrada.");
  });
  $("#projectSelect").addEventListener("change", (event) => {
    state.selectedProjectId = event.target.value;
    render();
  });
  $("#searchInput").addEventListener("input", (event) => {
    state.search = event.target.value;
    renderProjects();
    renderMovements();
  });

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
        projectId: state.selectedProjectId,
      },
      "Usuario agregado en Google Sheets.",
    );
    event.currentTarget.reset();
  });

  $("#exportCsvButton").addEventListener("click", () => {
    downloadText("movimientos-pron.csv", "text/csv;charset=utf-8", buildCsv());
  });
  $("#exportTxtButton").addEventListener("click", () => {
    downloadText("informe-pron.txt", "text/plain;charset=utf-8", buildReport());
  });
}

function init() {
  bindEvents();
  $("#movementForm").elements.movementDate.value = today();
  checkBackend();
  resumeSession();
}

init();
