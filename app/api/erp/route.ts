import { env } from "cloudflare:workers";
import { readSession, sha256Hex } from "../auth/_session";

type D1Result<T> = {
  results?: T[];
};

type D1PreparedStatement = {
  bind: (...values: unknown[]) => D1PreparedStatement;
  run: () => Promise<D1Result<unknown>>;
  all: <T>() => Promise<D1Result<T>>;
  first: <T>() => Promise<T | null>;
};

type D1DatabaseLike = {
  prepare: (query: string) => D1PreparedStatement;
  batch: (statements: D1PreparedStatement[]) => Promise<D1Result<unknown>[]>;
};

type ProjectRow = {
  id: string;
  name: string;
  type: string;
  country: string;
  currency: string;
  timezone: string;
  status: string;
  budget: number;
  objective: string;
  created_at: string;
  updated_at: string;
};

type MovementRow = {
  id: string;
  project_id: string;
  type: string;
  category: string;
  concept: string;
  amount: number;
  movement_date: string;
  status: string;
  created_at: string;
};

type PartnerRow = {
  id: string;
  project_id: string;
  name: string;
  type: string;
  contribution: number;
  participation: number;
  status: string;
};

type InventoryRow = {
  id: string;
  project_id: string;
  item: string;
  category: string;
  quantity: number;
  unit_cost: number;
  status: string;
};

type UserRow = {
  id: string;
  name: string;
  role: string;
  status: string;
  project_id: string | null;
  created_at: string;
};

type AuditRow = {
  id: string;
  action: string;
  detail: string;
  actor_role: string;
  project_id: string | null;
  created_at: string;
};

type ActionPayload = {
  action?: string;
  name?: string;
  type?: string;
  country?: string;
  currency?: string;
  timezone?: string;
  budget?: number;
  objective?: string;
  projectId?: string;
  category?: string;
  concept?: string;
  amount?: number;
  movementDate?: string;
  role?: string;
  email?: string;
  item?: string;
  quantity?: number;
  unitCost?: number;
  status?: string;
};

function getDatabase() {
  return (env as { DB?: D1DatabaseLike }).DB;
}

function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function numericValue(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

async function ensureDatabase(db: D1DatabaseLike) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'Ecuador',
      currency TEXT NOT NULL DEFAULT 'USD',
      timezone TEXT NOT NULL DEFAULT 'America/Guayaquil',
      status TEXT NOT NULL DEFAULT 'Activo',
      budget REAL NOT NULL DEFAULT 0,
      objective TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS movements (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id),
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      concept TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      movement_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Registrado',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS partners (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id),
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      contribution REAL NOT NULL DEFAULT 0,
      participation REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Activo'
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS inventory_items (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id),
      item TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      unit_cost REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Disponible'
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Activo',
      email_hash TEXT,
      project_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      detail TEXT NOT NULL,
      actor_role TEXT NOT NULL DEFAULT 'Superadministrador',
      project_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS movements_project_idx ON movements(project_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS partners_project_idx ON partners(project_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS inventory_project_idx ON inventory_items(project_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS audit_project_idx ON audit_log(project_id)"),
  ]);

  const count = await db
    .prepare("SELECT COUNT(*) AS total FROM projects")
    .first<{ total: number }>();

  if (count?.total) {
    return;
  }

  await db.batch([
    db
      .prepare(
        `INSERT INTO projects
        (id, name, type, country, currency, timezone, status, budget, objective)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        "hotel-manta",
        "Hotel Boutique Manta",
        "Negocio",
        "Ecuador",
        "USD",
        "America/Guayaquil",
        "Activo",
        185000,
        "Apertura controlada con seguimiento financiero semanal.",
      ),
    db
      .prepare(
        `INSERT INTO projects
        (id, name, type, country, currency, timezone, status, budget, objective)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        "evento-quito",
        "Festival Corporativo Quito",
        "Evento",
        "Ecuador",
        "USD",
        "America/Guayaquil",
        "En revision",
        64000,
        "Planificar proveedores, ingresos por patrocinio y control de accesos.",
      ),
    db
      .prepare(
        `INSERT INTO projects
        (id, name, type, country, currency, timezone, status, budget, objective)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        "local-guayaquil",
        "Restaurante ProN Guayaquil",
        "Apertura de local",
        "Ecuador",
        "USD",
        "America/Guayaquil",
        "Activo",
        98000,
        "Medir punto de equilibrio, inventario critico y personal base.",
      ),
    db
      .prepare(
        `INSERT INTO movements
        (id, project_id, type, category, concept, amount, movement_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        "mov-001",
        "hotel-manta",
        "Inversion",
        "Aporte inicial",
        "Capital de socios para adecuaciones",
        52000,
        "2026-08-01",
        "Aprobado",
      ),
    db
      .prepare(
        `INSERT INTO movements
        (id, project_id, type, category, concept, amount, movement_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        "mov-002",
        "hotel-manta",
        "Gasto",
        "Activos",
        "Equipamiento de habitaciones",
        18750,
        "2026-08-02",
        "Registrado",
      ),
    db
      .prepare(
        `INSERT INTO movements
        (id, project_id, type, category, concept, amount, movement_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        "mov-003",
        "evento-quito",
        "Ingreso",
        "Patrocinio",
        "Primer acuerdo de patrocinio",
        24000,
        "2026-08-02",
        "Aprobado",
      ),
    db
      .prepare(
        `INSERT INTO movements
        (id, project_id, type, category, concept, amount, movement_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        "mov-004",
        "local-guayaquil",
        "Gasto",
        "Personal",
        "Reserva nomina operativa",
        9200,
        "2026-08-03",
        "Registrado",
      ),
    db
      .prepare(
        `INSERT INTO partners
        (id, project_id, name, type, contribution, participation, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind("soc-001", "hotel-manta", "Socio fundador A", "Socio", 32000, 42, "Activo"),
    db
      .prepare(
        `INSERT INTO partners
        (id, project_id, name, type, contribution, participation, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind("soc-002", "local-guayaquil", "Inversionista operativo", "Inversionista", 18000, 24, "Activo"),
    db
      .prepare(
        `INSERT INTO inventory_items
        (id, project_id, item, category, quantity, unit_cost, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind("inv-001", "local-guayaquil", "Mesas de servicio", "Activo fijo", 24, 135, "Disponible"),
    db
      .prepare(
        `INSERT INTO inventory_items
        (id, project_id, item, category, quantity, unit_cost, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind("inv-002", "hotel-manta", "Kit lenceria habitacion", "Inventario", 80, 26, "Controlado"),
    db
      .prepare(
        `INSERT INTO users
        (id, name, role, status, email_hash, project_id)
        VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind("usr-owner", "Administrador General", "Superadministrador", "Activo", null, null),
    db
      .prepare(
        `INSERT INTO users
        (id, name, role, status, email_hash, project_id)
        VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind("usr-guest", "Usuario Invitado", "Invitado", "Activo", null, null),
    db
      .prepare(
        `INSERT INTO audit_log
        (id, action, detail, actor_role, project_id)
        VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(
        "aud-001",
        "Sistema inicializado",
        "ProN creo usuarios iniciales, proyectos base y catalogos operativos.",
        "Superadministrador",
        null,
      ),
  ]);
}

async function loadData(db: D1DatabaseLike) {
  const [projects, movements, partners, inventory, users, audit] =
    await Promise.all([
      db
        .prepare("SELECT * FROM projects ORDER BY updated_at DESC, created_at DESC")
        .all<ProjectRow>(),
      db
        .prepare("SELECT * FROM movements ORDER BY movement_date DESC, created_at DESC")
        .all<MovementRow>(),
      db.prepare("SELECT * FROM partners ORDER BY name").all<PartnerRow>(),
      db.prepare("SELECT * FROM inventory_items ORDER BY item").all<InventoryRow>(),
      db.prepare("SELECT id, name, role, status, project_id, created_at FROM users ORDER BY created_at DESC").all<UserRow>(),
      db.prepare("SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 30").all<AuditRow>(),
    ]);

  return {
    settings: {
      language: "es",
      country: "Ecuador",
      currency: "USD",
      timezone: "America/Guayaquil",
      moneyFormat: "$1.250,00",
      dateFormat: "DD/MM/AAAA",
    },
    projects:
      projects.results?.map((project) => ({
        id: project.id,
        name: project.name,
        type: project.type,
        country: project.country,
        currency: project.currency,
        timezone: project.timezone,
        status: project.status,
        budget: Number(project.budget),
        objective: project.objective,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      })) ?? [],
    movements:
      movements.results?.map((movement) => ({
        id: movement.id,
        projectId: movement.project_id,
        type: movement.type,
        category: movement.category,
        concept: movement.concept,
        amount: Number(movement.amount),
        movementDate: movement.movement_date,
        status: movement.status,
        createdAt: movement.created_at,
      })) ?? [],
    partners:
      partners.results?.map((partner) => ({
        id: partner.id,
        projectId: partner.project_id,
        name: partner.name,
        type: partner.type,
        contribution: Number(partner.contribution),
        participation: Number(partner.participation),
        status: partner.status,
      })) ?? [],
    inventory:
      inventory.results?.map((item) => ({
        id: item.id,
        projectId: item.project_id,
        item: item.item,
        category: item.category,
        quantity: Number(item.quantity),
        unitCost: Number(item.unit_cost),
        status: item.status,
      })) ?? [],
    users:
      users.results?.map((user) => ({
        id: user.id,
        name: user.name,
        role: user.role,
        status: user.status,
        projectId: user.project_id,
        createdAt: user.created_at,
      })) ?? [],
    audit:
      audit.results?.map((entry) => ({
        id: entry.id,
        action: entry.action,
        detail: entry.detail,
        actorRole: entry.actor_role,
        projectId: entry.project_id,
        createdAt: entry.created_at,
      })) ?? [],
  };
}

async function audit(
  db: D1DatabaseLike,
  action: string,
  detail: string,
  projectId: string | null,
) {
  await db
    .prepare(
      `INSERT INTO audit_log (id, action, detail, actor_role, project_id)
      VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(newId("aud"), action, detail, "Superadministrador", projectId)
    .run();
}

async function requireReadyDatabase(request: Request) {
  const session = await readSession(request);

  if (!session) {
    return { response: jsonError("Sesion requerida.", 401), db: null };
  }

  const db = getDatabase();

  if (!db) {
    return { response: jsonError("La base persistente no esta disponible.", 503), db: null };
  }

  await ensureDatabase(db);
  return { response: null, db };
}

export async function GET(request: Request) {
  const { response, db } = await requireReadyDatabase(request);

  if (response || !db) {
    return response;
  }

  return Response.json({ data: await loadData(db) });
}

export async function POST(request: Request) {
  const { response, db } = await requireReadyDatabase(request);

  if (response || !db) {
    return response;
  }

  let payload: ActionPayload;

  try {
    payload = (await request.json()) as ActionPayload;
  } catch {
    return jsonError("Solicitud invalida.");
  }

  switch (payload.action) {
    case "create-project": {
      const name = textValue(payload.name);
      const type = textValue(payload.type, "Proyecto personalizado");

      if (!name) {
        return jsonError("El nombre del proyecto es obligatorio.");
      }

      const id = newId("pro");
      await db
        .prepare(
          `INSERT INTO projects
          (id, name, type, country, currency, timezone, status, budget, objective)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          id,
          name,
          type,
          textValue(payload.country, "Ecuador"),
          textValue(payload.currency, "USD"),
          textValue(payload.timezone, "America/Guayaquil"),
          "Activo",
          numericValue(payload.budget),
          textValue(payload.objective, "Proyecto creado desde el panel ProN."),
        )
        .run();
      await audit(db, "Proyecto creado", `${name} quedo activo.`, id);
      break;
    }
    case "create-movement": {
      const projectId = textValue(payload.projectId);
      const concept = textValue(payload.concept);
      const amount = numericValue(payload.amount);

      if (!projectId || !concept || amount <= 0) {
        return jsonError("Proyecto, concepto y valor positivo son obligatorios.");
      }

      const type = textValue(payload.type, "Gasto");
      await db
        .prepare(
          `INSERT INTO movements
          (id, project_id, type, category, concept, amount, movement_date, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          newId("mov"),
          projectId,
          type,
          textValue(payload.category, "Operacion"),
          concept,
          amount,
          textValue(payload.movementDate, new Date().toISOString().slice(0, 10)),
          "Registrado",
        )
        .run();
      await audit(db, "Movimiento registrado", `${type}: ${concept}.`, projectId);
      break;
    }
    case "create-user": {
      const name = textValue(payload.name);
      const role = textValue(payload.role, "Invitado");
      const email = textValue(payload.email);

      if (!name || !email) {
        return jsonError("Nombre y correo de invitacion son obligatorios.");
      }

      await db
        .prepare(
          `INSERT INTO users
          (id, name, role, status, email_hash, project_id)
          VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          newId("usr"),
          name,
          role,
          "Invitado",
          await sha256Hex(email.toLowerCase()),
          textValue(payload.projectId) || null,
        )
        .run();
      await audit(db, "Usuario invitado", `${name} fue agregado como ${role}.`, null);
      break;
    }
    case "create-inventory": {
      const projectId = textValue(payload.projectId);
      const item = textValue(payload.item);

      if (!projectId || !item) {
        return jsonError("Proyecto e item son obligatorios.");
      }

      await db
        .prepare(
          `INSERT INTO inventory_items
          (id, project_id, item, category, quantity, unit_cost, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          newId("inv"),
          projectId,
          item,
          textValue(payload.category, "Inventario"),
          Math.max(0, Math.round(numericValue(payload.quantity))),
          Math.max(0, numericValue(payload.unitCost)),
          "Disponible",
        )
        .run();
      await audit(db, "Inventario agregado", item, projectId);
      break;
    }
    case "update-project-status": {
      const projectId = textValue(payload.projectId);
      const status = textValue(payload.status);

      if (!projectId || !status) {
        return jsonError("Proyecto y estado son obligatorios.");
      }

      await db
        .prepare("UPDATE projects SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(status, projectId)
        .run();
      await audit(db, "Estado actualizado", `Estado cambiado a ${status}.`, projectId);
      break;
    }
    default:
      return jsonError("Accion no reconocida.");
  }

  return Response.json({ data: await loadData(db) });
}
