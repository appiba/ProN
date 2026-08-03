var CONFIG = {
  APP_NAME: "ProN",
  SHEET_ID: "1KCzz2B59PN3IvcyM2_G2uvTi8nA759oV7rUsaXvrcSY",
  TIMEZONE: "America/Guayaquil",
  CURRENCY: "USD",
  COUNTRY: "Ecuador",
  SUPERADMIN_EMAIL_SHA256:
    "88e0ce076c34f4b41124bf348680fcaf025f8bda0e1e13ad7339be6d6f359cec",
  PASSWORD_SALT: "pron-apps-script-password-v1",
  SUPERADMIN_PASSWORD_SHA256:
    "105682a7333783a9e62bee3a503321582a8df6b9ca899512c1f8f53c3b59803f",
  SESSION_SECRET:
    "38f2d743a5e503fe22e6f743c640c35f8cdab6e916edd34f43f78ceab0009538",
};

var HEADERS = {
  Settings: ["key", "value"],
  Projects: [
    "id",
    "name",
    "type",
    "country",
    "currency",
    "timezone",
    "status",
    "budget",
    "objective",
    "createdAt",
    "updatedAt",
  ],
  Movements: [
    "id",
    "projectId",
    "type",
    "category",
    "concept",
    "amount",
    "movementDate",
    "status",
    "createdAt",
  ],
  Partners: [
    "id",
    "projectId",
    "name",
    "type",
    "contribution",
    "participation",
    "status",
  ],
  Inventory: [
    "id",
    "projectId",
    "item",
    "category",
    "quantity",
    "unitCost",
    "status",
  ],
  Users: ["id", "name", "role", "status", "emailHash", "projectId", "createdAt"],
  Audit: ["id", "action", "detail", "actorRole", "projectId", "createdAt"],
  Sessions: ["id", "tokenHash", "status", "expiresAt", "createdAt"],
};

function doGet(e) {
  var callback = e && e.parameter ? e.parameter.callback : "";

  try {
    setupWorkbook_();
    return respond_(handlePayload_(parseGetPayload_(e)), callback);
  } catch (error) {
    return respond_({ ok: false, error: errorMessage_(error) }, callback);
  }
}

function doPost(e) {
  try {
    setupWorkbook_();
    return respond_(handlePayload_(parsePayload_(e)));
  } catch (error) {
    return respond_({ ok: false, error: errorMessage_(error) });
  }
}

function handlePayload_(payload) {
  var action = text_(payload.action, "health");

  if (action === "health") {
    return {
      ok: true,
      app: CONFIG.APP_NAME,
      sheetId: CONFIG.SHEET_ID,
      timezone: CONFIG.TIMEZONE,
      data: loadData_(),
    };
  }

  if (action === "login") {
    return login_(payload);
  }

  var user = requireSession_(payload.token);

  if (action === "get-data") {
    return { ok: true, user: user, data: loadData_() };
  }

  if (action === "create-project") {
    createProject_(payload);
    return { ok: true, user: user, data: loadData_() };
  }

  if (action === "create-movement") {
    createMovement_(payload);
    return { ok: true, user: user, data: loadData_() };
  }

  if (action === "create-partner") {
    createPartner_(payload);
    return { ok: true, user: user, data: loadData_() };
  }

  if (action === "create-inventory") {
    createInventory_(payload);
    return { ok: true, user: user, data: loadData_() };
  }

  if (action === "create-user") {
    createUser_(payload);
    return { ok: true, user: user, data: loadData_() };
  }

  if (action === "update-project-status") {
    updateProjectStatus_(payload);
    return { ok: true, user: user, data: loadData_() };
  }

  throw new Error("Accion no reconocida.");
}

function setupProN() {
  setupWorkbook_();
  return loadData_();
}

function login_(payload) {
  var emailHash =
    text_(payload.emailHash) || sha256Hex_(text_(payload.email).toLowerCase());
  var passwordHash =
    text_(payload.passwordHash) ||
    sha256Hex_(text_(payload.password) + ":" + CONFIG.PASSWORD_SALT);

  if (
    emailHash !== CONFIG.SUPERADMIN_EMAIL_SHA256 ||
    passwordHash !== CONFIG.SUPERADMIN_PASSWORD_SHA256
  ) {
    appendObject_("Audit", {
      id: newId_("aud"),
      action: "Inicio de sesion rechazado",
      detail: "Intento fallido de acceso al panel.",
      actorRole: "Sistema",
      projectId: "",
      createdAt: now_(),
    });
    throw new Error("Credenciales invalidas.");
  }

  var token = createToken_(payload.remember === true);
  appendObject_("Audit", {
    id: newId_("aud"),
    action: "Inicio de sesion",
    detail: "Superadministrador ingreso al panel.",
    actorRole: "Superadministrador",
    projectId: "",
    createdAt: now_(),
  });

  return {
    ok: true,
    token: token,
    user: superadmin_(),
    data: loadData_(),
  };
}

function createProject_(payload) {
  var name = text_(payload.name);

  if (!name) {
    throw new Error("El nombre del proyecto es obligatorio.");
  }

  var id = newId_("pro");
  appendObject_("Projects", {
    id: id,
    name: name,
    type: text_(payload.type, "Proyecto personalizado"),
    country: text_(payload.country, CONFIG.COUNTRY),
    currency: text_(payload.currency, CONFIG.CURRENCY),
    timezone: text_(payload.timezone, CONFIG.TIMEZONE),
    status: "Activo",
    budget: number_(payload.budget),
    objective: text_(payload.objective, "Proyecto creado desde ProN."),
    createdAt: today_(),
    updatedAt: today_(),
  });
  audit_("Proyecto creado", name + " quedo activo.", id);
}

function createMovement_(payload) {
  var projectId = text_(payload.projectId);
  var concept = text_(payload.concept);
  var amount = number_(payload.amount);

  if (!projectId || !concept || amount <= 0) {
    throw new Error("Proyecto, concepto y valor positivo son obligatorios.");
  }

  var type = text_(payload.type, "Gasto");
  appendObject_("Movements", {
    id: newId_("mov"),
    projectId: projectId,
    type: type,
    category: text_(payload.category, "Operacion"),
    concept: concept,
    amount: amount,
    movementDate: text_(payload.movementDate, today_()),
    status: "Registrado",
    createdAt: today_(),
  });
  audit_("Movimiento registrado", type + ": " + concept + ".", projectId);
}

function createPartner_(payload) {
  var projectId = text_(payload.projectId);
  var name = text_(payload.name);

  if (!projectId || !name) {
    throw new Error("Proyecto y nombre del socio son obligatorios.");
  }

  appendObject_("Partners", {
    id: newId_("soc"),
    projectId: projectId,
    name: name,
    type: text_(payload.type, "Socio"),
    contribution: number_(payload.contribution),
    participation: number_(payload.participation),
    status: "Activo",
  });
  audit_("Socio agregado", name + " fue vinculado al proyecto.", projectId);
}

function createInventory_(payload) {
  var projectId = text_(payload.projectId);
  var item = text_(payload.item);

  if (!projectId || !item) {
    throw new Error("Proyecto e item son obligatorios.");
  }

  appendObject_("Inventory", {
    id: newId_("inv"),
    projectId: projectId,
    item: item,
    category: text_(payload.category, "Inventario"),
    quantity: Math.max(0, Math.round(number_(payload.quantity))),
    unitCost: Math.max(0, number_(payload.unitCost)),
    status: "Disponible",
  });
  audit_("Inventario agregado", item + " quedo registrado.", projectId);
}

function createUser_(payload) {
  var name = text_(payload.name);
  var email = text_(payload.email);
  var role = text_(payload.role, "Invitado");

  if (!name || !email) {
    throw new Error("Nombre y correo de invitacion son obligatorios.");
  }

  appendObject_("Users", {
    id: newId_("usr"),
    name: name,
    role: role,
    status: "Invitado",
    emailHash: sha256Hex_(email.toLowerCase()),
    projectId: text_(payload.projectId),
    createdAt: today_(),
  });
  audit_("Usuario invitado", name + " fue agregado como " + role + ".", "");
}

function updateProjectStatus_(payload) {
  var projectId = text_(payload.projectId);
  var status = text_(payload.status);

  if (!projectId || !status) {
    throw new Error("Proyecto y estado son obligatorios.");
  }

  updateObjectById_("Projects", projectId, {
    status: status,
    updatedAt: today_(),
  });
  audit_("Estado actualizado", "Estado cambiado a " + status + ".", projectId);
}

function loadData_() {
  return {
    settings: settings_(),
    projects: readObjects_("Projects").map(function (row) {
      return {
        id: row.id,
        name: row.name,
        type: row.type,
        country: row.country,
        currency: row.currency,
        timezone: row.timezone,
        status: row.status,
        budget: number_(row.budget),
        objective: row.objective,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    }),
    movements: readObjects_("Movements").map(function (row) {
      return {
        id: row.id,
        projectId: row.projectId,
        type: row.type,
        category: row.category,
        concept: row.concept,
        amount: number_(row.amount),
        movementDate: row.movementDate,
        status: row.status,
        createdAt: row.createdAt,
      };
    }),
    partners: readObjects_("Partners").map(function (row) {
      return {
        id: row.id,
        projectId: row.projectId,
        name: row.name,
        type: row.type,
        contribution: number_(row.contribution),
        participation: number_(row.participation),
        status: row.status,
      };
    }),
    inventory: readObjects_("Inventory").map(function (row) {
      return {
        id: row.id,
        projectId: row.projectId,
        item: row.item,
        category: row.category,
        quantity: number_(row.quantity),
        unitCost: number_(row.unitCost),
        status: row.status,
      };
    }),
    users: readObjects_("Users").map(function (row) {
      return {
        id: row.id,
        name: row.name,
        role: row.role,
        status: row.status,
        projectId: row.projectId || null,
        createdAt: row.createdAt,
      };
    }),
    audit: readObjects_("Audit")
      .slice()
      .reverse()
      .slice(0, 30)
      .map(function (row) {
        return {
          id: row.id,
          action: row.action,
          detail: row.detail,
          actorRole: row.actorRole,
          projectId: row.projectId || null,
          createdAt: row.createdAt,
        };
      }),
  };
}

function setupWorkbook_() {
  Object.keys(HEADERS).forEach(function (sheetName) {
    ensureSheet_(sheetName, HEADERS[sheetName]);
  });

  if (sheet_("Settings").getLastRow() <= 1) {
    appendObject_("Settings", { key: "language", value: "es" });
    appendObject_("Settings", { key: "country", value: CONFIG.COUNTRY });
    appendObject_("Settings", { key: "currency", value: CONFIG.CURRENCY });
    appendObject_("Settings", { key: "timezone", value: CONFIG.TIMEZONE });
    appendObject_("Settings", { key: "moneyFormat", value: "$1.250,00" });
    appendObject_("Settings", { key: "dateFormat", value: "DD/MM/AAAA" });
  }

  if (sheet_("Projects").getLastRow() <= 1) {
    seedData_();
  }
}

function seedData_() {
  [
    {
      id: "hotel-manta",
      name: "Hotel Boutique Manta",
      type: "Negocio",
      country: CONFIG.COUNTRY,
      currency: CONFIG.CURRENCY,
      timezone: CONFIG.TIMEZONE,
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
      country: CONFIG.COUNTRY,
      currency: CONFIG.CURRENCY,
      timezone: CONFIG.TIMEZONE,
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
      country: CONFIG.COUNTRY,
      currency: CONFIG.CURRENCY,
      timezone: CONFIG.TIMEZONE,
      status: "Activo",
      budget: 98000,
      objective: "Medir punto de equilibrio, inventario critico y personal.",
      createdAt: "2026-08-01",
      updatedAt: "2026-08-03",
    },
  ].forEach(function (item) {
    appendObject_("Projects", item);
  });

  [
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
  ].forEach(function (item) {
    appendObject_("Movements", item);
  });

  appendObject_("Partners", {
    id: "soc-001",
    projectId: "hotel-manta",
    name: "Socio fundador A",
    type: "Socio",
    contribution: 32000,
    participation: 42,
    status: "Activo",
  });
  appendObject_("Partners", {
    id: "soc-002",
    projectId: "local-guayaquil",
    name: "Inversionista operativo",
    type: "Inversionista",
    contribution: 18000,
    participation: 24,
    status: "Activo",
  });
  appendObject_("Inventory", {
    id: "inv-001",
    projectId: "local-guayaquil",
    item: "Mesas de servicio",
    category: "Activo fijo",
    quantity: 24,
    unitCost: 135,
    status: "Disponible",
  });
  appendObject_("Inventory", {
    id: "inv-002",
    projectId: "hotel-manta",
    item: "Kit lenceria habitacion",
    category: "Inventario",
    quantity: 80,
    unitCost: 26,
    status: "Controlado",
  });
  appendObject_("Users", {
    id: "usr-owner",
    name: "Administrador General",
    role: "Superadministrador",
    status: "Activo",
    emailHash: "",
    projectId: "",
    createdAt: "2026-08-03",
  });
  appendObject_("Users", {
    id: "usr-guest",
    name: "Usuario Invitado",
    role: "Invitado",
    status: "Activo",
    emailHash: "",
    projectId: "",
    createdAt: "2026-08-03",
  });
  appendObject_("Audit", {
    id: "aud-001",
    action: "Sistema inicializado",
    detail: "ProN preparo usuarios iniciales, proyectos base y catalogos.",
    actorRole: "Superadministrador",
    projectId: "",
    createdAt: "2026-08-03",
  });
}

function settings_() {
  var settings = {
    language: "es",
    country: CONFIG.COUNTRY,
    currency: CONFIG.CURRENCY,
    timezone: CONFIG.TIMEZONE,
    moneyFormat: "$1.250,00",
    dateFormat: "DD/MM/AAAA",
  };

  readObjects_("Settings").forEach(function (row) {
    settings[row.key] = row.value;
  });

  return settings;
}

function spreadsheet_() {
  return SpreadsheetApp.openById(CONFIG.SHEET_ID);
}

function sheet_(name) {
  return spreadsheet_().getSheetByName(name);
}

function ensureSheet_(name, headers) {
  var ss = spreadsheet_();
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);

  if (sheet.getMaxColumns() < headers.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  }

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
}

function readObjects_(sheetName) {
  var headers = HEADERS[sheetName];
  var sheet = sheet_(sheetName);
  var lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return [];
  }

  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return values
    .filter(function (row) {
      return row.some(function (cell) {
        return String(cell).trim() !== "";
      });
    })
    .map(function (row) {
      var object = {};
      headers.forEach(function (header, index) {
        object[header] = cellValue_(row[index]);
      });
      return object;
    });
}

function appendObject_(sheetName, object) {
  var headers = HEADERS[sheetName];
  var row = headers.map(function (header) {
    return object[header] !== undefined ? object[header] : "";
  });
  sheet_(sheetName).appendRow(row);
}

function updateObjectById_(sheetName, id, patch) {
  var headers = HEADERS[sheetName];
  var sheet = sheet_(sheetName);
  var lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    throw new Error("No hay datos para actualizar.");
  }

  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var matchIndex = -1;
  ids.some(function (row, index) {
    if (String(row[0]) === id) {
      matchIndex = index + 2;
      return true;
    }
    return false;
  });

  if (matchIndex === -1) {
    throw new Error("Registro no encontrado.");
  }

  Object.keys(patch).forEach(function (key) {
    var column = headers.indexOf(key) + 1;
    if (column > 0) {
      sheet.getRange(matchIndex, column).setValue(patch[key]);
    }
  });
}

function createToken_(remember) {
  var maxAge = remember ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
  var payload = base64Url_(JSON.stringify({
    sub: "superadmin",
    role: "Superadministrador",
    exp: Date.now() + maxAge,
  }));
  var signature = hmacHex_(payload, CONFIG.SESSION_SECRET);
  var token = payload + "." + signature;

  appendObject_("Sessions", {
    id: newId_("ses"),
    tokenHash: sha256Hex_(token),
    status: "Activo",
    expiresAt: new Date(Date.now() + maxAge).toISOString(),
    createdAt: now_(),
  });

  return token;
}

function requireSession_(token) {
  if (!token) {
    throw new Error("Sesion requerida.");
  }

  var parts = String(token).split(".");
  if (parts.length !== 2) {
    throw new Error("Sesion invalida.");
  }

  if (hmacHex_(parts[0], CONFIG.SESSION_SECRET) !== parts[1]) {
    throw new Error("Sesion invalida.");
  }

  var session = JSON.parse(base64UrlDecode_(parts[0]));
  if (
    session.sub !== "superadmin" ||
    session.role !== "Superadministrador" ||
    !session.exp ||
    session.exp < Date.now()
  ) {
    throw new Error("Sesion expirada.");
  }

  return superadmin_();
}

function superadmin_() {
  return {
    name: "Administrador General",
    role: "Superadministrador",
    access: "Completo",
  };
}

function audit_(action, detail, projectId) {
  appendObject_("Audit", {
    id: newId_("aud"),
    action: action,
    detail: detail,
    actorRole: "Superadministrador",
    projectId: projectId || "",
    createdAt: now_(),
  });
}

function parsePayload_(e) {
  var raw = e && e.postData && e.postData.contents ? e.postData.contents : "{}";

  try {
    return JSON.parse(raw);
  } catch (error) {
    return e && e.parameter ? e.parameter : {};
  }
}

function parseGetPayload_(e) {
  var params = e && e.parameter ? e.parameter : {};
  var payload = {};

  if (params.payload) {
    try {
      payload = JSON.parse(params.payload);
    } catch (error) {
      payload = {};
    }
  }

  Object.keys(params).forEach(function (key) {
    if (key !== "payload" && key !== "callback") {
      payload[key] = params[key];
    }
  });

  return payload;
}

function respond_(payload, callback) {
  if (callback) {
    var name = callbackName_(callback);
    return ContentService.createTextOutput(name + "(" + JSON.stringify(payload) + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function json_(payload) {
  return respond_(payload);
}

function callbackName_(value) {
  var name = String(value || "");

  if (!/^[A-Za-z_$][0-9A-Za-z_$.]*$/.test(name)) {
    throw new Error("Callback invalido.");
  }

  return name;
}

function errorMessage_(error) {
  return error && error.message ? error.message : String(error);
}

function text_(value, fallback) {
  var text = value === undefined || value === null ? "" : String(value).trim();
  return text || fallback || "";
}

function number_(value, fallback) {
  var number = Number(String(value === undefined || value === null ? "" : value).replace(",", "."));
  return Number.isFinite(number) ? number : fallback || 0;
}

function cellValue_(value) {
  if (Object.prototype.toString.call(value) === "[object Date]") {
    return Utilities.formatDate(value, CONFIG.TIMEZONE, "yyyy-MM-dd");
  }
  return value;
}

function today_() {
  return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd");
}

function now_() {
  return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd HH:mm:ss");
}

function newId_(prefix) {
  return prefix + "-" + Utilities.getUuid();
}

function sha256Hex_(value) {
  return bytesToHex_(
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      value,
      Utilities.Charset.UTF_8,
    ),
  );
}

function hmacHex_(value, secret) {
  return bytesToHex_(
    Utilities.computeHmacSha256Signature(value, secret, Utilities.Charset.UTF_8),
  );
}

function bytesToHex_(bytes) {
  return bytes
    .map(function (byte) {
      var value = byte < 0 ? byte + 256 : byte;
      return ("0" + value.toString(16)).slice(-2);
    })
    .join("");
}

function base64Url_(value) {
  return Utilities.base64EncodeWebSafe(value, Utilities.Charset.UTF_8).replace(/=+$/, "");
}

function base64UrlDecode_(value) {
  var padded = value + "====".slice(0, (4 - (value.length % 4)) % 4);
  return Utilities.newBlob(Utilities.base64DecodeWebSafe(padded)).getDataAsString();
}
