var CONFIG = {
  APP_NAME: "ProN",
  SHEET_ID: "1KCzz2B59PN3IvcyM2_G2uvTi8nA759oV7rUsaXvrcSY",
  TIMEZONE: "America/Guayaquil",
  CURRENCY: "USD",
  COUNTRY: "Ecuador",
  CLEAN_START_VERSION: "pron-clean-start-20260803-v1",
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
    "partnerId",
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
  Users: [
    "id",
    "name",
    "role",
    "status",
    "emailHash",
    "projectId",
    "createdAt",
    "username",
    "loginHash",
    "passwordHash",
  ],
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

  if (action === "delete-project") {
    deleteProject_(payload);
    return { ok: true, user: user, data: loadData_() };
  }

  if (action === "delete-movement") {
    deleteMovement_(payload);
    return { ok: true, user: user, data: loadData_() };
  }

  if (action === "delete-partner") {
    deletePartner_(payload);
    return { ok: true, user: user, data: loadData_() };
  }

  if (action === "delete-inventory") {
    deleteInventory_(payload);
    return { ok: true, user: user, data: loadData_() };
  }

  if (action === "delete-user") {
    deleteUser_(payload);
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
  var loginHash =
    text_(payload.loginHash) || emailHash;
  var passwordHash =
    text_(payload.passwordHash) ||
    sha256Hex_(text_(payload.password) + ":" + CONFIG.PASSWORD_SALT);

  if (
    emailHash === CONFIG.SUPERADMIN_EMAIL_SHA256 &&
    passwordHash === CONFIG.SUPERADMIN_PASSWORD_SHA256
  ) {
    var ownerToken = createToken_(payload.remember === true, superadmin_());
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
      token: ownerToken,
      user: superadmin_(),
    };
  }

  var appUser = userByCredentials_(loginHash, passwordHash);

  if (!appUser) {
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

  var userProfile = userProfile_(appUser);
  var userToken = createToken_(payload.remember === true, userProfile);
  appendObject_("Audit", {
    id: newId_("aud"),
    action: "Inicio de sesion",
    detail: appUser.name + " ingreso al panel.",
    actorRole: appUser.role || "Usuario",
    projectId: appUser.projectId || "",
    createdAt: now_(),
  });

  return {
    ok: true,
    token: userToken,
    user: userProfile,
  };
}

function userByCredentials_(loginHash, passwordHash) {
  var rows = readObjects_("Users");

  for (var index = 0; index < rows.length; index += 1) {
    if (
      rows[index].status === "Activo" &&
      rows[index].role !== "Superadministrador" &&
      rows[index].loginHash === loginHash &&
      rows[index].passwordHash === passwordHash
    ) {
      return rows[index];
    }
  }

  return null;
}

function userProfile_(row) {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    role: row.role || "Invitado",
    access: row.projectId ? projectNameById_(row.projectId) : "Todos los proyectos",
    projectId: row.projectId || null,
  };
}

function existingLoginHash_(loginHash) {
  var rows = readObjects_("Users");

  return rows.some(function (row) {
    return row.loginHash === loginHash || row.emailHash === loginHash;
  });
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
    status: text_(payload.status, "En revision"),
    budget: number_(payload.budget),
    objective: text_(payload.objective, "Proyecto creado desde ProN."),
    createdAt: today_(),
    updatedAt: today_(),
  });
  audit_("Proyecto creado", name + " quedo en revision.", id);
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
    status: text_(payload.status, "Registrado"),
    createdAt: today_(),
    partnerId: text_(payload.partnerId),
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
  var username = text_(payload.username).toLowerCase();
  var loginHash = text_(payload.loginHash);
  var passwordHash = text_(payload.passwordHash);
  var role = text_(payload.role, "Invitado");

  if (!name || !username || !loginHash || !passwordHash) {
    throw new Error("Nombre, usuario y clave son obligatorios.");
  }

  if (existingLoginHash_(loginHash)) {
    throw new Error("Ese usuario ya existe.");
  }

  appendObject_("Users", {
    id: newId_("usr"),
    name: name,
    role: role,
    status: "Activo",
    emailHash: loginHash,
    projectId: text_(payload.projectId),
    createdAt: today_(),
    username: username,
    loginHash: loginHash,
    passwordHash: passwordHash,
  });
  audit_("Usuario creado", name + " fue creado como " + role + ".", text_(payload.projectId));
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

function deleteProject_(payload) {
  var projectId = text_(payload.projectId);

  if (!projectId) {
    throw new Error("Proyecto obligatorio para eliminar.");
  }

  var projectName = projectNameById_(projectId);
  deleteObjectById_("Projects", projectId);
  deleteRowsByColumnValue_("Movements", "projectId", projectId);
  deleteRowsByColumnValue_("Partners", "projectId", projectId);
  deleteRowsByColumnValue_("Inventory", "projectId", projectId);
  deleteRowsByColumnValue_("Users", "projectId", projectId);
  audit_("Proyecto eliminado", projectName + " y sus registros vinculados fueron eliminados.", projectId);
}

function deleteMovement_(payload) {
  var movementId = text_(payload.movementId);

  if (!movementId) {
    throw new Error("Movimiento obligatorio para eliminar.");
  }

  deleteObjectById_("Movements", movementId);
  audit_("Movimiento eliminado", movementId + " fue eliminado.", "");
}

function deletePartner_(payload) {
  var partnerId = text_(payload.partnerId);

  if (!partnerId) {
    throw new Error("Socio obligatorio para eliminar.");
  }

  deleteObjectById_("Partners", partnerId);
  audit_("Socio eliminado", partnerId + " fue eliminado.", "");
}

function deleteInventory_(payload) {
  var inventoryId = text_(payload.inventoryId);

  if (!inventoryId) {
    throw new Error("Inventario obligatorio para eliminar.");
  }

  deleteObjectById_("Inventory", inventoryId);
  audit_("Inventario eliminado", inventoryId + " fue eliminado.", "");
}

function deleteUser_(payload) {
  var userId = text_(payload.userId);

  if (!userId) {
    throw new Error("Usuario obligatorio para eliminar.");
  }

  if (userId === "usr-owner") {
    throw new Error("El superadministrador no se puede eliminar.");
  }

  deleteObjectById_("Users", userId);
  audit_("Usuario eliminado", userId + " fue eliminado.", "");
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
        partnerId: row.partnerId || "",
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
        username: row.username || "",
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

  if (settingValue_("cleanStartVersion") !== CONFIG.CLEAN_START_VERSION) {
    resetWorkbookData_();
    writeDefaultSettings_();
    seedData_();
    return;
  }

  ensureDefaultSettings_();

  if (sheet_("Users").getLastRow() <= 1) {
    seedData_();
  }
}

function seedData_() {
  appendObject_("Users", {
    id: "usr-owner",
    name: "Administrador General",
    role: "Superadministrador",
    status: "Activo",
    emailHash: CONFIG.SUPERADMIN_EMAIL_SHA256,
    projectId: "",
    createdAt: "2026-08-03",
    username: "superadmin",
    loginHash: CONFIG.SUPERADMIN_EMAIL_SHA256,
    passwordHash: "",
  });
}

function resetWorkbookData_() {
  Object.keys(HEADERS).forEach(function (sheetName) {
    clearSheetRows_(sheetName);
  });
}

function clearSheetRows_(sheetName) {
  var target = sheet_(sheetName);
  var lastRow = target.getLastRow();

  if (lastRow <= 1) {
    return;
  }

  target.getRange(2, 1, lastRow - 1, target.getMaxColumns()).clearContent();
}

function writeDefaultSettings_() {
  appendObject_("Settings", { key: "cleanStartVersion", value: CONFIG.CLEAN_START_VERSION });
  appendObject_("Settings", { key: "language", value: "es" });
  appendObject_("Settings", { key: "country", value: CONFIG.COUNTRY });
  appendObject_("Settings", { key: "currency", value: CONFIG.CURRENCY });
  appendObject_("Settings", { key: "timezone", value: CONFIG.TIMEZONE });
  appendObject_("Settings", { key: "moneyFormat", value: "$1.250,00" });
  appendObject_("Settings", { key: "dateFormat", value: "DD/MM/AAAA" });
}

function ensureDefaultSettings_() {
  var current = settings_();

  if (!current.cleanStartVersion) {
    appendObject_("Settings", { key: "cleanStartVersion", value: CONFIG.CLEAN_START_VERSION });
  }
}

function settings_() {
  var settings = {
    cleanStartVersion: CONFIG.CLEAN_START_VERSION,
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

function settingValue_(key) {
  var rows = readObjects_("Settings");

  for (var index = rows.length - 1; index >= 0; index -= 1) {
    if (rows[index].key === key) {
      return rows[index].value;
    }
  }

  return "";
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

function deleteObjectById_(sheetName, id) {
  var deleted = deleteRowsByColumnValue_(sheetName, "id", id);

  if (!deleted) {
    throw new Error("Registro no encontrado.");
  }
}

function deleteRowsByColumnValue_(sheetName, columnName, value) {
  var headers = HEADERS[sheetName];
  var column = headers.indexOf(columnName) + 1;
  var sheet = sheet_(sheetName);
  var lastRow = sheet.getLastRow();
  var deleted = 0;

  if (column <= 0 || lastRow <= 1) {
    return deleted;
  }

  var values = sheet.getRange(2, column, lastRow - 1, 1).getValues();

  for (var index = values.length - 1; index >= 0; index -= 1) {
    if (String(values[index][0]) === String(value)) {
      sheet.deleteRow(index + 2);
      deleted += 1;
    }
  }

  return deleted;
}

function projectNameById_(projectId) {
  var rows = readObjects_("Projects");

  for (var index = 0; index < rows.length; index += 1) {
    if (String(rows[index].id) === String(projectId)) {
      return rows[index].name || projectId;
    }
  }

  return projectId;
}

function createToken_(remember, user) {
  var maxAge = remember ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
  var profile = user || superadmin_();
  var payload = base64Url_(JSON.stringify({
    sub: profile.id || "superadmin",
    name: profile.name,
    username: profile.username || "",
    role: profile.role || "Invitado",
    access: profile.access || "",
    projectId: profile.projectId || null,
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
  if (!session.sub || !session.role || !session.exp || session.exp < Date.now()) {
    throw new Error("Sesion expirada.");
  }

  return {
    id: session.sub,
    name: session.name || "Usuario ProN",
    username: session.username || "",
    role: session.role,
    access: session.access || "",
    projectId: session.projectId || null,
  };
}

function superadmin_() {
  return {
    id: "superadmin",
    name: "Administrador General",
    username: "superadmin",
    role: "Superadministrador",
    access: "Completo",
    projectId: null,
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
