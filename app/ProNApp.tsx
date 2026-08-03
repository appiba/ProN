"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type SessionUser = {
  name: string;
  role: string;
  access: string;
};

type Project = {
  id: string;
  name: string;
  type: string;
  country: string;
  currency: string;
  timezone: string;
  status: string;
  budget: number;
  objective: string;
  createdAt: string;
  updatedAt: string;
};

type Movement = {
  id: string;
  projectId: string;
  type: string;
  category: string;
  concept: string;
  amount: number;
  movementDate: string;
  status: string;
  createdAt: string;
};

type Partner = {
  id: string;
  projectId: string;
  name: string;
  type: string;
  contribution: number;
  participation: number;
  status: string;
};

type InventoryItem = {
  id: string;
  projectId: string;
  item: string;
  category: string;
  quantity: number;
  unitCost: number;
  status: string;
};

type AppUser = {
  id: string;
  name: string;
  role: string;
  status: string;
  projectId: string | null;
  createdAt: string;
};

type AuditEntry = {
  id: string;
  action: string;
  detail: string;
  actorRole: string;
  projectId: string | null;
  createdAt: string;
};

type ERPData = {
  settings: {
    cleanStartVersion: string;
    language: string;
    country: string;
    currency: string;
    timezone: string;
    moneyFormat: string;
    dateFormat: string;
  };
  projects: Project[];
  movements: Movement[];
  partners: Partner[];
  inventory: InventoryItem[];
  users: AppUser[];
  audit: AuditEntry[];
};

type TabId =
  | "resumen"
  | "proyectos"
  | "finanzas"
  | "socios"
  | "inventario"
  | "usuarios"
  | "reportes"
  | "configuracion";

const CLEAN_START_VERSION = "pron-clean-start-20260803-v1";

const fallbackData: ERPData = {
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
      role: "Superadministrador",
      status: "Activo",
      projectId: null,
      createdAt: "2026-08-03",
    },
  ],
  audit: [],
};

const tabs: { id: TabId; label: string; short: string }[] = [
  { id: "resumen", label: "Resumen", short: "RE" },
  { id: "proyectos", label: "Proyectos", short: "PR" },
  { id: "finanzas", label: "Finanzas", short: "FI" },
  { id: "socios", label: "Socios", short: "SO" },
  { id: "inventario", label: "Inventario", short: "IN" },
  { id: "usuarios", label: "Usuarios", short: "US" },
  { id: "reportes", label: "Reportes", short: "RP" },
  { id: "configuracion", label: "Config.", short: "CO" },
];

const roleMatrix = [
  {
    role: "Superadministrador",
    scope: "Todos los proyectos",
    permissions: "Crear, editar, archivar, usuarios, catalogos, informes y auditoria.",
  },
  {
    role: "Administrador de proyecto",
    scope: "Proyectos asignados",
    permissions: "Presupuestos, gastos, ingresos, socios, inventario y documentos.",
  },
  {
    role: "Administrador financiero",
    scope: "Finanzas asignadas",
    permissions: "Movimientos, cuentas, flujo de caja, aportes y reportes.",
  },
  {
    role: "Invitado",
    scope: "Solo lectura",
    permissions: "Consulta de resumen, proyectos e informes autorizados.",
  },
];

const projectTypes = [
  "Negocio",
  "Evento",
  "Emprendimiento",
  "Empresa",
  "Inversion",
  "Apertura de local",
  "Remodelacion",
  "Produccion",
  "Proyecto personalizado",
];

const formatMoney = (value: number) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

const today = () => new Date().toISOString().slice(0, 10);

function projectName(data: ERPData, projectId: string | null) {
  if (!projectId) {
    return "Global";
  }

  return data.projects.find((project) => project.id === projectId)?.name ?? "Proyecto";
}

function downloadText(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string | number | null) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function buildMovementCsv(data: ERPData) {
  const rows = [
    ["Proyecto", "Tipo", "Categoria", "Concepto", "Valor", "Fecha", "Estado"],
    ...data.movements.map((movement) => [
      projectName(data, movement.projectId),
      movement.type,
      movement.category,
      movement.concept,
      movement.amount,
      movement.movementDate,
      movement.status,
    ]),
  ];

  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
}

function localId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}

export default function ProNApp() {
  const [session, setSession] = useState<"checking" | "anonymous" | "ready">(
    "checking",
  );
  const [user, setUser] = useState<SessionUser | null>(null);
  const [data, setData] = useState<ERPData>(fallbackData);
  const [activeTab, setActiveTab] = useState<TabId>("resumen");
  const [selectedProjectId, setSelectedProjectId] = useState(
    fallbackData.projects[0]?.id ?? "",
  );
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    remember: true,
  });
  const [projectForm, setProjectForm] = useState({
    name: "",
    type: "Negocio",
    country: "Ecuador",
    currency: "USD",
    timezone: "America/Guayaquil",
    budget: "",
    objective: "",
  });
  const [movementForm, setMovementForm] = useState({
    type: "Gasto",
    category: "Operacion",
    concept: "",
    amount: "",
    movementDate: today(),
  });
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "Administrador de proyecto",
    projectId: fallbackData.projects[0]?.id ?? "",
  });
  const [inventoryForm, setInventoryForm] = useState({
    item: "",
    category: "Inventario",
    quantity: "",
    unitCost: "",
  });

  useEffect(() => {
    let alive = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const result = (await response.json()) as {
          authenticated: boolean;
          user: SessionUser | null;
        };

        if (!alive) {
          return;
        }

        if (result.authenticated && result.user) {
          setUser(result.user);
          setSession("ready");
        } else {
          setSession("anonymous");
        }
      } catch {
        if (alive) {
          setSession("anonymous");
        }
      }
    }

    checkSession();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (session !== "ready") {
      return;
    }

    refreshData();
  }, [session]);

  useEffect(() => {
    if (!data.projects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(data.projects[0]?.id ?? "");
    }
  }, [data.projects, selectedProjectId]);

  async function refreshData() {
    setLoadingData(true);
    try {
      const response = await fetch("/api/erp", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("No se pudo leer la base persistente.");
      }

      const result = (await response.json()) as { data: ERPData };
      setData(result.data);
      setNotice("Datos actualizados.");
    } catch {
      setNotice("Datos actuales disponibles.");
    } finally {
      setLoadingData(false);
    }
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const result = (await response.json()) as {
        user?: SessionUser;
        error?: string;
      };

      if (!response.ok || !result.user) {
        setLoginError(result.error ?? "No se pudo iniciar sesion.");
        return;
      }

      setUser(result.user);
      setSession("ready");
      setLoginForm({ email: "", password: "", remember: true });
    } catch {
      setLoginError("No se pudo conectar con el servidor de autenticacion.");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setSession("anonymous");
  }

  async function postAction(
    payload: Record<string, unknown>,
    localApply: (current: ERPData) => ERPData,
  ) {
    setSaving(true);
    setNotice("");

    try {
      const response = await fetch("/api/erp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { data?: ERPData; error?: string };

      if (!response.ok || !result.data) {
        throw new Error(result.error ?? "No se pudo guardar.");
      }

      setData(result.data);
      setNotice("Cambio guardado.");
    } catch {
      setData(localApply);
      setNotice("Cambio aplicado localmente. La base persistente se reintentara al sincronizar.");
    } finally {
      setSaving(false);
    }
  }

  const selectedProject = useMemo(
    () => data.projects.find((project) => project.id === selectedProjectId),
    [data.projects, selectedProjectId],
  );

  const projectMovements = useMemo(
    () =>
      data.movements.filter((movement) => movement.projectId === selectedProjectId),
    [data.movements, selectedProjectId],
  );

  const filteredProjects = useMemo(() => {
    return data.projects.filter((project) => {
      const matchesQuery = `${project.name} ${project.type}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesStatus =
        statusFilter === "Todos" || project.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [data.projects, query, statusFilter]);

  const totals = useMemo(() => {
    const income = data.movements
      .filter((movement) => movement.type === "Ingreso")
      .reduce((sum, movement) => sum + movement.amount, 0);
    const expenses = data.movements
      .filter((movement) => movement.type === "Gasto")
      .reduce((sum, movement) => sum + movement.amount, 0);
    const investment = data.movements
      .filter((movement) => movement.type === "Inversion")
      .reduce((sum, movement) => sum + movement.amount, 0);
    const budget = data.projects.reduce((sum, project) => sum + project.budget, 0);

    return {
      income,
      expenses,
      investment,
      budget,
      balance: income + investment - expenses,
      active: data.projects.filter((project) => project.status !== "Archivado").length,
    };
  }, [data]);

  const selectedTotals = useMemo(() => {
    const income = projectMovements
      .filter((movement) => movement.type === "Ingreso")
      .reduce((sum, movement) => sum + movement.amount, 0);
    const expenses = projectMovements
      .filter((movement) => movement.type === "Gasto")
      .reduce((sum, movement) => sum + movement.amount, 0);
    const investment = projectMovements
      .filter((movement) => movement.type === "Inversion")
      .reduce((sum, movement) => sum + movement.amount, 0);

    return {
      income,
      expenses,
      investment,
      balance: income + investment - expenses,
      breakeven:
        selectedProject && selectedProject.budget > 0
          ? Math.min(100, Math.round(((income + investment) / selectedProject.budget) * 100))
          : 0,
    };
  }, [projectMovements, selectedProject]);

  function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const budget = Number(projectForm.budget);

    postAction(
      {
        action: "create-project",
        ...projectForm,
        budget: Number.isFinite(budget) ? budget : 0,
      },
      (current) => {
        const id = localId("pro");
        const nextProject: Project = {
          id,
          name: projectForm.name,
          type: projectForm.type,
          country: projectForm.country,
          currency: projectForm.currency,
          timezone: projectForm.timezone,
          status: "En revision",
          budget: Number.isFinite(budget) ? budget : 0,
          objective: projectForm.objective || "Proyecto creado desde ProN.",
          createdAt: today(),
          updatedAt: today(),
        };
        setSelectedProjectId(id);
        return {
          ...current,
          projects: [nextProject, ...current.projects],
          audit: [
            {
              id: localId("aud"),
              action: "Proyecto creado",
              detail: `${projectForm.name} quedo en revision.`,
              actorRole: "Superadministrador",
              projectId: id,
              createdAt: today(),
            },
            ...current.audit,
          ],
        };
      },
    );
    setProjectForm({
      name: "",
      type: "Negocio",
      country: "Ecuador",
      currency: "USD",
      timezone: "America/Guayaquil",
      budget: "",
      objective: "",
    });
  }

  function createMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(movementForm.amount);

    postAction(
      {
        action: "create-movement",
        projectId: selectedProjectId,
        ...movementForm,
        amount: Number.isFinite(amount) ? amount : 0,
      },
      (current) => ({
        ...current,
        movements: [
          {
            id: localId("mov"),
            projectId: selectedProjectId,
            type: movementForm.type,
            category: movementForm.category,
            concept: movementForm.concept,
            amount: Number.isFinite(amount) ? amount : 0,
            movementDate: movementForm.movementDate,
            status: "Registrado",
            createdAt: today(),
          },
          ...current.movements,
        ],
      }),
    );
    setMovementForm({
      type: "Gasto",
      category: "Operacion",
      concept: "",
      amount: "",
      movementDate: today(),
    });
  }

  function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    postAction(
      { action: "create-user", ...userForm },
      (current) => ({
        ...current,
        users: [
          {
            id: localId("usr"),
            name: userForm.name,
            role: userForm.role,
            status: "Invitado",
            projectId: userForm.projectId || null,
            createdAt: today(),
          },
          ...current.users,
        ],
      }),
    );
    setUserForm({
      name: "",
      email: "",
      role: "Administrador de proyecto",
      projectId: selectedProjectId,
    });
  }

  function createInventory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const quantity = Number(inventoryForm.quantity);
    const unitCost = Number(inventoryForm.unitCost);

    postAction(
      {
        action: "create-inventory",
        projectId: selectedProjectId,
        ...inventoryForm,
        quantity: Number.isFinite(quantity) ? quantity : 0,
        unitCost: Number.isFinite(unitCost) ? unitCost : 0,
      },
      (current) => ({
        ...current,
        inventory: [
          {
            id: localId("inv"),
            projectId: selectedProjectId,
            item: inventoryForm.item,
            category: inventoryForm.category,
            quantity: Number.isFinite(quantity) ? quantity : 0,
            unitCost: Number.isFinite(unitCost) ? unitCost : 0,
            status: "Disponible",
          },
          ...current.inventory,
        ],
      }),
    );
    setInventoryForm({
      item: "",
      category: "Inventario",
      quantity: "",
      unitCost: "",
    });
  }

  function changeProjectStatus(projectId: string, status: string) {
    postAction(
      { action: "update-project-status", projectId, status },
      (current) => ({
        ...current,
        projects: current.projects.map((project) =>
          project.id === projectId
            ? { ...project, status, updatedAt: today() }
            : project,
        ),
      }),
    );
  }

  function downloadReport() {
    const report = [
      "ProN - Informe ejecutivo",
      `Fecha: ${new Date().toLocaleDateString("es-EC")}`,
      `Proyectos activos: ${totals.active}`,
      `Presupuesto total: ${formatMoney(totals.budget)}`,
      `Ingresos: ${formatMoney(totals.income)}`,
      `Inversiones: ${formatMoney(totals.investment)}`,
      `Gastos: ${formatMoney(totals.expenses)}`,
      `Balance: ${formatMoney(totals.balance)}`,
      "",
      "Proyectos",
      ...data.projects.map(
        (project) =>
          `${project.name} | ${project.type} | ${project.status} | ${formatMoney(project.budget)}`,
      ),
    ].join("\n");

    downloadText("informe-pron.txt", "text/plain;charset=utf-8", report);
  }

  function downloadChart() {
    const maxBudget = Math.max(...data.projects.map((project) => project.budget), 1);
    const rows = data.projects
      .map((project, index) => {
        const width = Math.round((project.budget / maxBudget) * 420);
        const y = 72 + index * 56;
        return `<text x="36" y="${y}" font-size="14" fill="#17202a">${project.name}</text><rect x="250" y="${y - 18}" width="${width}" height="22" rx="4" fill="#0f766e"/><text x="${260 + width}" y="${y - 2}" font-size="13" fill="#17202a">${formatMoney(project.budget)}</text>`;
      })
      .join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="${130 + data.projects.length * 56}" viewBox="0 0 760 ${130 + data.projects.length * 56}"><rect width="100%" height="100%" fill="#f8faf7"/><text x="36" y="38" font-size="24" font-weight="700" fill="#10201d">ProN - Presupuesto por proyecto</text>${rows}</svg>`;

    downloadText("grafico-pron.svg", "image/svg+xml;charset=utf-8", svg);
  }

  if (session === "checking") {
    return (
      <main className="loading-screen">
        <div className="brand-mark">PN</div>
        <p>Preparando ProN...</p>
      </main>
    );
  }

  if (session === "anonymous") {
    return (
      <main className="login-screen">
        <section className="login-product">
          <div className="brand-lockup">
            <div className="brand-mark">PN</div>
            <div>
              <h1>ProN</h1>
              <p>ERP para negocios, proyectos y eventos.</p>
            </div>
          </div>
          <div className="login-proof">
            <span>Acceso seguro</span>
            <strong>Panel privado con roles, permisos y datos separados por proyecto.</strong>
          </div>
          <div className="login-grid">
            <div>
              <b>Persistencia</b>
              <span>Base D1 preparada para proyectos, finanzas e inventario.</span>
            </div>
            <div>
              <b>Auditoria</b>
              <span>Cambios y registros con historial operativo.</span>
            </div>
            <div>
              <b>Permisos</b>
              <span>Superadministrador, administradores e invitados.</span>
            </div>
          </div>
        </section>

        <section className="login-panel" aria-labelledby="login-title">
          <p className="eyebrow">Inicio de sesion</p>
          <h2 id="login-title">Entrar a ProN</h2>
          <form onSubmit={login} className="login-form">
            <label>
              Correo electronico
              <input
                type="email"
                autoComplete="username"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="correo@empresa.com"
                required
              />
            </label>
            <label>
              Contrasena
              <span className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Ingresa tu clave"
                  required
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                  title={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </span>
            </label>
            <label className="inline-check">
              <input
                type="checkbox"
                checked={loginForm.remember}
                onChange={(event) =>
                  setLoginForm((current) => ({
                    ...current,
                    remember: event.target.checked,
                  }))
                }
              />
              Recordar sesion en este dispositivo
            </label>
            {loginError ? <p className="form-error">{loginError}</p> : null}
            <button className="primary-button" type="submit">
              Ingresar
            </button>
          </form>
          <div className="login-actions">
            <button
              type="button"
              onClick={() =>
                setLoginError("La recuperacion se gestiona desde administracion segura.")
              }
            >
              Recuperar contrasena
            </button>
            <button
              type="button"
              onClick={() =>
                setLoginError("Las cuentas nuevas se crean solo mediante invitacion.")
              }
            >
              Crear cuenta por invitacion
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Navegacion principal">
        <div className="brand-lockup compact">
          <div className="brand-mark">PN</div>
          <div>
            <h1>ProN</h1>
            <p>ERP Dashboard</p>
          </div>
        </div>
        <nav className="nav-list">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? "active" : ""}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
            >
              <span>{tab.short}</span>
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <small>Rol activo</small>
          <strong>{user?.role}</strong>
          <span>{user?.access}</span>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Panel general</p>
            <h2>{selectedProject?.name ?? "ProN"}</h2>
          </div>
          <div className="topbar-actions">
            <select
              aria-label="Seleccionar proyecto"
              value={selectedProjectId}
              onChange={(event) => {
                setSelectedProjectId(event.target.value);
                setUserForm((current) => ({
                  ...current,
                  projectId: event.target.value,
                }));
              }}
            >
              {data.projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <button type="button" onClick={refreshData} disabled={loadingData}>
              {loadingData ? "Actualizando" : "Actualizar"}
            </button>
            <button type="button" className="ghost-danger" onClick={logout}>
              Salir
            </button>
          </div>
        </header>

        {notice ? <p className="notice">{notice}</p> : null}

        <section className="metrics-grid" aria-label="Indicadores generales">
          <Metric label="Presupuesto total" value={formatMoney(totals.budget)} tone="ink" />
          <Metric label="Ingresos" value={formatMoney(totals.income)} tone="green" />
          <Metric label="Gastos" value={formatMoney(totals.expenses)} tone="red" />
          <Metric label="Balance" value={formatMoney(totals.balance)} tone="blue" />
        </section>

        {activeTab === "resumen" ? (
          <section className="content-grid">
            <article className="panel wide">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Proyecto seleccionado</p>
                  <h3>Operacion y punto de equilibrio</h3>
                </div>
                <span className="status-pill">{selectedProject?.status}</span>
              </div>
              <div className="project-summary">
                <div>
                  <small>Ingresos + inversiones</small>
                  <strong>{formatMoney(selectedTotals.income + selectedTotals.investment)}</strong>
                </div>
                <div>
                  <small>Gastos</small>
                  <strong>{formatMoney(selectedTotals.expenses)}</strong>
                </div>
                <div>
                  <small>Avance a equilibrio</small>
                  <strong>{selectedTotals.breakeven}%</strong>
                </div>
              </div>
              <div className="progress-track">
                <span style={{ width: `${selectedTotals.breakeven}%` }} />
              </div>
              <p className="body-copy">{selectedProject?.objective}</p>
            </article>

            <article className="panel">
              <div className="panel-heading">
                <h3>Flujo reciente</h3>
              </div>
              <ul className="activity-list">
                {data.movements.slice(0, 5).map((movement) => (
                  <li key={movement.id}>
                    <span className={`dot ${movement.type.toLowerCase()}`} />
                    <div>
                      <strong>{movement.concept}</strong>
                      <small>
                        {projectName(data, movement.projectId)} - {movement.type}
                      </small>
                    </div>
                    <b>{formatMoney(movement.amount)}</b>
                  </li>
                ))}
              </ul>
            </article>

            <article className="panel">
              <div className="panel-heading">
                <h3>Auditoria</h3>
              </div>
              <ul className="audit-list">
                {data.audit.slice(0, 5).map((entry) => (
                  <li key={entry.id}>
                    <strong>{entry.action}</strong>
                    <span>{entry.detail}</span>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        ) : null}

        {activeTab === "proyectos" ? (
          <section className="content-grid">
            <article className="panel wide">
              <div className="panel-heading wrap">
                <div>
                  <p className="eyebrow">Gestion independiente</p>
                  <h3>Proyectos</h3>
                </div>
                <div className="filters">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar proyecto"
                    aria-label="Buscar proyecto"
                  />
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    aria-label="Filtrar por estado"
                  >
                    <option>Todos</option>
                    <option>En revision</option>
                    <option>Aprobado</option>
                    <option>Inversion completada</option>
                    <option>Negocio activo</option>
                    <option>En funcion</option>
                    <option>Archivado</option>
                  </select>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Proyecto</th>
                      <th>Tipo</th>
                      <th>Presupuesto</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project) => (
                      <tr key={project.id}>
                        <td>{project.name}</td>
                        <td>{project.type}</td>
                        <td>{formatMoney(project.budget)}</td>
                        <td>
                          <span className="status-pill">{project.status}</span>
                        </td>
                        <td className="row-actions">
                          <button type="button" onClick={() => setSelectedProjectId(project.id)}>
                            Abrir
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              changeProjectStatus(
                                project.id,
                                project.status === "Archivado" ? "En revision" : "Archivado",
                              )
                            }
                          >
                            {project.status === "Archivado" ? "Restaurar" : "Archivar"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="panel">
              <h3>Crear proyecto</h3>
              <form className="stack-form" onSubmit={createProject}>
                <input
                  value={projectForm.name}
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Nombre"
                  required
                />
                <select
                  value={projectForm.type}
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, type: event.target.value }))
                  }
                >
                  {projectTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
                <input
                  value={projectForm.budget}
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, budget: event.target.value }))
                  }
                  inputMode="decimal"
                  placeholder="Presupuesto USD"
                />
                <textarea
                  value={projectForm.objective}
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, objective: event.target.value }))
                  }
                  placeholder="Objetivo operativo"
                />
                <button className="primary-button" disabled={saving} type="submit">
                  Crear
                </button>
              </form>
            </article>
          </section>
        ) : null}

        {activeTab === "finanzas" ? (
          <section className="content-grid">
            <article className="panel">
              <h3>Registrar movimiento</h3>
              <form className="stack-form" onSubmit={createMovement}>
                <div className="segmented">
                  {["Gasto", "Ingreso", "Inversion"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={movementForm.type === type ? "selected" : ""}
                      onClick={() =>
                        setMovementForm((current) => ({ ...current, type }))
                      }
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <input
                  value={movementForm.category}
                  onChange={(event) =>
                    setMovementForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  placeholder="Categoria"
                  required
                />
                <input
                  value={movementForm.concept}
                  onChange={(event) =>
                    setMovementForm((current) => ({
                      ...current,
                      concept: event.target.value,
                    }))
                  }
                  placeholder="Concepto"
                  required
                />
                <input
                  value={movementForm.amount}
                  onChange={(event) =>
                    setMovementForm((current) => ({
                      ...current,
                      amount: event.target.value,
                    }))
                  }
                  inputMode="decimal"
                  placeholder="Valor"
                  required
                />
                <input
                  type="date"
                  value={movementForm.movementDate}
                  onChange={(event) =>
                    setMovementForm((current) => ({
                      ...current,
                      movementDate: event.target.value,
                    }))
                  }
                  required
                />
                <button className="primary-button" disabled={saving} type="submit">
                  Registrar
                </button>
              </form>
            </article>
            <article className="panel wide">
              <div className="panel-heading">
                <h3>Movimientos del proyecto</h3>
                <button type="button" onClick={() => downloadText("movimientos-pron.csv", "text/csv;charset=utf-8", buildMovementCsv(data))}>
                  Exportar CSV
                </button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>Categoria</th>
                      <th>Concepto</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectMovements.map((movement) => (
                      <tr key={movement.id}>
                        <td>{movement.movementDate}</td>
                        <td>{movement.type}</td>
                        <td>{movement.category}</td>
                        <td>{movement.concept}</td>
                        <td>{formatMoney(movement.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        ) : null}

        {activeTab === "socios" ? (
          <section className="content-grid">
            <article className="panel wide">
              <div className="panel-heading">
                <h3>Socios e inversionistas</h3>
              </div>
              <div className="cards-grid">
                {data.partners.map((partner) => (
                  <div className="data-card" key={partner.id}>
                    <span>{partner.type}</span>
                    <strong>{partner.name}</strong>
                    <small>{projectName(data, partner.projectId)}</small>
                    <div className="card-row">
                      <b>{formatMoney(partner.contribution)}</b>
                      <b>{partner.participation}%</b>
                    </div>
                  </div>
                ))}
              </div>
            </article>
            <article className="panel">
              <h3>Control de aportes</h3>
              <p className="body-copy">
                Los aportes pertenecen al proyecto donde se registran y no se mezclan
                con otras operaciones.
              </p>
              <button type="button" onClick={() => setActiveTab("finanzas")}>
                Registrar aporte
              </button>
            </article>
          </section>
        ) : null}

        {activeTab === "inventario" ? (
          <section className="content-grid">
            <article className="panel">
              <h3>Agregar inventario</h3>
              <form className="stack-form" onSubmit={createInventory}>
                <input
                  value={inventoryForm.item}
                  onChange={(event) =>
                    setInventoryForm((current) => ({ ...current, item: event.target.value }))
                  }
                  placeholder="Item"
                  required
                />
                <input
                  value={inventoryForm.category}
                  onChange={(event) =>
                    setInventoryForm((current) => ({ ...current, category: event.target.value }))
                  }
                  placeholder="Categoria"
                  required
                />
                <input
                  value={inventoryForm.quantity}
                  onChange={(event) =>
                    setInventoryForm((current) => ({ ...current, quantity: event.target.value }))
                  }
                  inputMode="numeric"
                  placeholder="Cantidad"
                  required
                />
                <input
                  value={inventoryForm.unitCost}
                  onChange={(event) =>
                    setInventoryForm((current) => ({ ...current, unitCost: event.target.value }))
                  }
                  inputMode="decimal"
                  placeholder="Costo unitario"
                />
                <button className="primary-button" disabled={saving} type="submit">
                  Agregar
                </button>
              </form>
            </article>
            <article className="panel wide">
              <h3>Inventario por proyecto</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Proyecto</th>
                      <th>Item</th>
                      <th>Categoria</th>
                      <th>Cantidad</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.inventory.map((item) => (
                      <tr key={item.id}>
                        <td>{projectName(data, item.projectId)}</td>
                        <td>{item.item}</td>
                        <td>{item.category}</td>
                        <td>{item.quantity}</td>
                        <td>{formatMoney(item.quantity * item.unitCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        ) : null}

        {activeTab === "usuarios" ? (
          <section className="content-grid">
            <article className="panel">
              <h3>Invitar usuario</h3>
              <form className="stack-form" onSubmit={createUser}>
                <input
                  value={userForm.name}
                  onChange={(event) =>
                    setUserForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Nombre"
                  required
                />
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(event) =>
                    setUserForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="Correo de invitacion"
                  required
                />
                <select
                  value={userForm.role}
                  onChange={(event) =>
                    setUserForm((current) => ({ ...current, role: event.target.value }))
                  }
                >
                  {roleMatrix.map((role) => (
                    <option key={role.role}>{role.role}</option>
                  ))}
                </select>
                <select
                  value={userForm.projectId}
                  onChange={(event) =>
                    setUserForm((current) => ({
                      ...current,
                      projectId: event.target.value,
                    }))
                  }
                >
                  {data.projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <button className="primary-button" disabled={saving} type="submit">
                  Enviar invitacion
                </button>
              </form>
            </article>
            <article className="panel wide">
              <h3>Roles y permisos</h3>
              <div className="permission-list">
                {roleMatrix.map((role) => (
                  <div key={role.role}>
                    <strong>{role.role}</strong>
                    <span>{role.scope}</span>
                    <p>{role.permissions}</p>
                  </div>
                ))}
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Rol</th>
                      <th>Proyecto</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map((appUser) => (
                      <tr key={appUser.id}>
                        <td>{appUser.name}</td>
                        <td>{appUser.role}</td>
                        <td>{projectName(data, appUser.projectId)}</td>
                        <td>{appUser.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        ) : null}

        {activeTab === "reportes" ? (
          <section className="content-grid">
            <article className="panel wide">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Informes descargables</p>
                  <h3>Indicadores ejecutivos</h3>
                </div>
                <div className="row-actions">
                  <button type="button" onClick={downloadReport}>
                    Descargar informe PDF
                  </button>
                  <button type="button" onClick={downloadChart}>
                    Descargar grafico
                  </button>
                </div>
              </div>
              <div className="bar-chart">
                {data.projects.map((project) => {
                  const width = Math.max(10, Math.round((project.budget / Math.max(totals.budget, 1)) * 100));
                  return (
                    <div key={project.id}>
                      <span>{project.name}</span>
                      <div>
                        <i style={{ width: `${width}%` }} />
                      </div>
                      <b>{formatMoney(project.budget)}</b>
                    </div>
                  );
                })}
              </div>
            </article>
            <article className="panel">
              <h3>Configuracion del informe</h3>
              <p className="body-copy">
                Moneda {data.settings.currency}, pais {data.settings.country}, zona{" "}
                {data.settings.timezone}.
              </p>
              <button type="button" onClick={() => downloadText("movimientos-pron.csv", "text/csv;charset=utf-8", buildMovementCsv(data))}>
                Exportar movimientos
              </button>
            </article>
          </section>
        ) : null}

        {activeTab === "configuracion" ? (
          <section className="content-grid">
            <article className="panel wide">
              <div className="panel-heading">
                <h3>Configuracion general</h3>
              </div>
              <div className="settings-grid">
                {Object.entries(data.settings).map(([key, value]) => (
                  <label key={key}>
                    {key}
                    <input value={value} readOnly />
                  </label>
                ))}
              </div>
            </article>
            <article className="panel">
              <h3>Seguridad</h3>
              <ul className="check-list">
                <li>Sesion con cookie HttpOnly.</li>
                <li>Credenciales iniciales sin texto visible.</li>
                <li>Bloqueo temporal por intentos fallidos.</li>
                <li>Usuarios nuevos solo por invitacion.</li>
              </ul>
            </article>
          </section>
        ) : null}
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ink" | "green" | "red" | "blue";
}) {
  return (
    <article className={`metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
