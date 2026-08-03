import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const templateRoot = new URL("../", import.meta.url);
const sourceRoots = ["app", "db", "worker", "public", "google-apps-script"];
const rootTextFiles = ["README.md", "index.html", "pages.js", "pages.css"];
const templateRootPath = fileURLToPath(templateRoot);

async function collectTextFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const chunks = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      chunks.push(...(await collectTextFiles(fullPath)));
      continue;
    }

    if (/\.(css|html|js|json|md|mjs|svg|ts|tsx)$/i.test(entry.name)) {
      chunks.push(await readFile(fullPath, "utf8"));
    }
  }

  return chunks;
}

function fromCodes(codes) {
  return String.fromCharCode(...codes);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("builds the ProN login shell", async () => {
  const serverBundle = await readFile(
    new URL("../dist/server/index.js", import.meta.url),
    "utf8",
  );
  const clientAssets = await readdir(
    new URL("../dist/client/assets", import.meta.url),
  );
  const proNAsset = clientAssets.find((file) => file.startsWith("ProNApp-"));
  assert.ok(proNAsset, "expected a ProNApp client bundle");
  const html = await readFile(
    new URL(`../dist/client/assets/${proNAsset}`, import.meta.url),
    "utf8",
  );
  const starterArtifacts = new RegExp(
    [
      ["codex", "preview"].join("-"),
      ["Skeleton", "Preview"].join(""),
      ["react", "loading", "skeleton"].join("-"),
    ].join("|"),
    "i",
  );

  assert.match(serverBundle, /ProN \| ERP Dashboard/);
  assert.match(html, /ProN/);
  assert.match(html, /Inicio de sesion/);
  assert.match(html, /Correo electronico/);
  assert.doesNotMatch(html, starterArtifacts);
  assert.doesNotMatch(html, /Informe TXT|Sincronizar|Sincronizando|Grafico SVG/);
});

test("keeps private bootstrap credentials out of app source", async () => {
  const source = (
    await Promise.all([
      ...sourceRoots.map((root) =>
        collectTextFiles(path.join(templateRootPath, root)),
      ),
      ...rootTextFiles.map((file) => readFile(path.join(templateRootPath, file), "utf8")),
    ])
  )
    .flat()
    .join("\n");
  const oldBrandPattern = new RegExp(["360", "BUSINESS"].join("\\s+"), "i");
  const privateEmail = fromCodes([
    112, 100, 97, 118, 105, 100, 110, 105, 101, 116, 111, 64, 103, 109, 97,
    105, 108, 46, 99, 111, 109,
  ]);
  const privatePassword = fromCodes([50, 52, 49, 57, 56, 55]);

  assert.doesNotMatch(source, oldBrandPattern);
  assert.doesNotMatch(source, new RegExp(escapeRegExp(privateEmail), "i"));
  assert.doesNotMatch(source, new RegExp(escapeRegExp(privatePassword)));
});

test("ships the GitHub Pages and Apps Script integration", async () => {
  const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const pages = await readFile(new URL("../pages.js", import.meta.url), "utf8");
  const appsScript = await readFile(
    new URL("../google-apps-script/Code.gs", import.meta.url),
    "utf8",
  );

  assert.match(index, /ERP Dashboard/);
  assert.match(pages, /AKfycbzf1TjxIBrBNJ6fTY5NNciAlWCl0PFKYgCpRXcdRg2S9aYKjMqDxeVCgC1JlcZet8iLNA/);
  assert.match(pages, /function jsonpRequest/);
  assert.match(pages, /LOCAL_DB_KEY/);
  assert.match(index, /summaryScopeSelect/);
  assert.match(index, /financePie/);
  assert.match(index, /budgetPie/);
  assert.match(index, /cashflowCandles/);
  assert.match(index, /data-view="proyecto-detalle"/);
  assert.match(index, /detailStatusForm/);
  assert.match(index, /administrationArea/);
  assert.match(index, /detailAdminForm/);
  assert.match(index, /adminPendingTotal/);
  assert.match(index, /Guardar administracion/);
  assert.match(index, /exportTopButton/);
  assert.match(index, /Descargar PDF/);
  assert.match(index, /exportPdfButton/);
  assert.match(index, /reportFinancePie/);
  assert.match(index, /reportBudgetPie/);
  assert.match(index, /reportCandles/);
  assert.match(index, /Descargar informe PDF/);
  assert.doesNotMatch(
    index,
    /Informe TXT|Descargar JSON|Google Sheet|Sincronizar Sheets|Apps Script no respondio|Base de datos local activa|Failed to fetch/i,
  );
  assert.match(pages, /delete-project/);
  assert.match(pages, /downloadProjectReport/);
  assert.match(pages, /downloadPdf/);
  assert.match(pages, /buildReportPdf/);
  assert.match(pages, /drawPdfPie/);
  assert.match(pages, /drawPdfCandleChart/);
  assert.match(pages, /enterDashboardNow/);
  assert.match(pages, /syncLoginInBackground/);
  assert.match(pages, /BACKGROUND_SYNC_DELAY_MS/);
  assert.match(pages, /renderCandleChart/);
  assert.match(pages, /openProject/);
  assert.match(pages, /PROJECT_STATUSES/);
  assert.match(pages, /ADMIN_READY_STATUSES/);
  assert.match(pages, /administrationTotals/);
  assert.match(pages, /activateProjectAdministration/);
  assert.match(pages, /Negocio activo/);
  assert.match(pages, /En funcion/);
  assert.match(pages, /MOVEMENT_CATEGORIES/);
  assert.match(appsScript, /function doGet/);
  assert.match(appsScript, /function doPost/);
  assert.match(appsScript, /function parseGetPayload_/);
  assert.match(appsScript, /ContentService\.MimeType\.JAVASCRIPT/);
  assert.match(appsScript, /deleteProject_/);
  assert.match(appsScript, /deleteRowsByColumnValue_/);
  assert.match(appsScript, /text_\(payload\.status, "En revision"\)/);
  assert.match(appsScript, /1KCzz2B59PN3IvcyM2_G2uvTi8nA759oV7rUsaXvrcSY/);
});
