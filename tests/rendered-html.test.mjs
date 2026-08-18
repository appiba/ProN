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
  assert.doesNotMatch(html, /Informe TXT|Sincronizar|Sincronizando|Grafico SVG|Correo de invitacion|Enviar invitacion|Invitar usuario/);
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
  assert.doesNotMatch(
    source,
    /Hotel Boutique Manta|Festival Corporativo Quito|Restaurante ProN Guayaquil|hotel-manta|evento-quito|local-guayaquil|mov-001|usr-guest/i,
  );
  assert.doesNotMatch(source, /Correo de invitacion|Enviar invitacion|Invitar usuario|cuenta por invitacion/i);
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
  assert.match(pages, /pron_local_database_clean_v1/);
  assert.match(pages, /CLEAN_START_VERSION/);
  assert.match(pages, /normalizeRemoteData/);
  assert.match(index, /summaryScopeSelect/);
  assert.match(index, /projectionMetrics/);
  assert.match(index, /projectionPlane/);
  assert.match(index, /projectionInsights/);
  assert.match(index, /financePie/);
  assert.match(index, /budgetPie/);
  assert.match(index, /cashflowCandles/);
  assert.match(index, /cashflowGuide/);
  assert.match(index, /data-view="proyecto-detalle"/);
  assert.match(index, /detailProjectionMetrics/);
  assert.match(index, /detailProjectionPlane/);
  assert.match(index, /detailStatusForm/);
  assert.match(index, /administrationArea/);
  assert.match(index, /detailAdminForm/);
  assert.match(index, /detailAdminCancelButton/);
  assert.match(index, /admin-workspace/);
  assert.match(index, /adminPendingTotal/);
  assert.match(index, /Guardar administracion/);
  assert.match(index, /exportTopButton/);
  assert.match(index, /Descargar PDF/);
  assert.match(index, /exportPdfButton/);
  assert.match(index, /reportProjectionMetrics/);
  assert.match(index, /reportProjectionPlane/);
  assert.match(index, /reportFinancePie/);
  assert.match(index, /reportBudgetPie/);
  assert.match(index, /reportCandles/);
  assert.match(index, /Plano de flujo y proyeccion/);
  assert.match(index, /Descargar informe PDF/);
  assert.match(index, /Crear usuario/);
  assert.match(index, /Usuario de acceso/);
  assert.match(index, /Clave de acceso/);
  assert.match(index, /20260818-central-status/);
  assert.doesNotMatch(index, /20260807-vinilos-socios|20260807-editable-projects|20260807-editable-sync|20260818-budget-inline|20260818-partner-sync|20260818-central-sync/);
  assert.match(index, /detailEditProjectButton/);
  assert.match(index, /detailBudgetInlineForm/);
  assert.match(index, /detailBudgetInlineCancel/);
  assert.match(index, /budget-inline-card/);
  assert.match(index, /detailProjectEditForm/);
  assert.match(index, /budgetChangePreview/);
  assert.match(index, /interactive-kpi/);
  assert.match(index, /detailMovementCancelButton/);
  assert.match(index, /detailPartnerCancelButton/);
  assert.match(index, /detailInventoryCancelButton/);
  assert.match(index, /eventControlPanel/);
  assert.match(index, /eventScorecards/);
  assert.match(index, /eventBudgetBody/);
  assert.match(index, /eventScenarioCards/);
  assert.match(index, /eventPartnerShare/);
  assert.match(index, /eventReferencePanel/);
  assert.match(index, /eventReferenceGallery/);
  assert.match(index, /Socio \/ responsable/);
  assert.match(index, /partnerProjectInput/);
  assert.match(index, /Aporte USD \(opcional\)/);
  assert.match(index, /Participacion % del presupuesto/);
  assert.match(index, /partnerParticipationStatus/);
  assert.match(index, /partnersEquitySummary/);
  assert.match(index, /partners-project-panel/);
  assert.doesNotMatch(
    index,
    /Informe TXT|Descargar JSON|Google Sheet|Sincronizar Sheets|Apps Script no respondio|Base de datos local activa|Failed to fetch/i,
  );
  assert.match(pages, /delete-project/);
  assert.match(pages, /update-project/);
  assert.match(pages, /submitOptimisticAction/);
  assert.match(pages, /openBudgetInlineEditor/);
  assert.match(pages, /PENDING_LOCAL_CHANGES_KEY/);
  assert.match(pages, /setPendingLocalChanges/);
  assert.match(pages, /REQUIRED_APPS_SCRIPT_VERSION/);
  assert.match(pages, /isOutdatedBackendResponse/);
  assert.match(pages, /backendSyncFailureMessage/);
  assert.match(pages, /JSONP_TIMEOUT_MS = 60000/);
  assert.match(pages, /remoteDataIncludesAction/);
  assert.match(pages, /partnerMatchesPayload/);
  assert.match(pages, /hasRemoteRowsExtra/);
  assert.match(pages, /update-movement/);
  assert.match(pages, /update-partner/);
  assert.match(pages, /update-inventory/);
  assert.match(pages, /editDetailMovement/);
  assert.match(pages, /editDetailPartner/);
  assert.match(pages, /editDetailInventory/);
  assert.match(pages, /retireDetailPartner/);
  assert.match(pages, /projectInitialBudget/);
  assert.match(pages, /lastBudgetReason/);
  assert.match(pages, /editAdminMovement/);
  assert.match(pages, /clearAdminEditMode/);
  assert.match(pages, /downloadProjectReport/);
  assert.match(pages, /downloadPdf/);
  assert.match(pages, /buildReportPdf/);
  assert.match(pages, /pron-informe-completo/);
  assert.match(pages, /merge-local-data/);
  assert.match(pages, /Datos guardados en el respaldo central/);
  assert.match(pages, /mergeLocalSnapshotIfNeeded/);
  assert.match(pages, /syncLocalSnapshotToBackend/);
  assert.match(pages, /deleteRemoteRowsMissingLocally/);
  assert.match(pages, /remoteRowsMissingLocally/);
  assert.match(pages, /isRemoteDataShape/);
  assert.match(pages, /pruneLegacySeedRows/);
  assert.match(pages, /replayLocalRowsToLegacyBackend/);
  assert.match(pages, /legacyReplaceMovement/);
  assert.match(pages, /projectReportAnalysis/);
  assert.match(pages, /projectionSummary/);
  assert.match(pages, /projectionText/);
  assert.match(pages, /renderProjectionDashboard/);
  assert.match(pages, /renderProjectionPlane/);
  assert.match(pages, /reportConclusions/);
  assert.match(pages, /FALTANTES CRITICOS POR PROYECTO/);
  assert.match(pages, /DETALLE COMPLETO POR PROYECTO/);
  assert.match(pages, /drawPdfPie/);
  assert.match(pages, /drawPdfCandleChart/);
  assert.match(pages, /enterDashboardNow/);
  assert.match(pages, /syncLoginInBackground/);
  assert.match(pages, /BACKGROUND_SYNC_DELAY_MS/);
  assert.match(pages, /renderCandleChart/);
  assert.match(pages, /openProject/);
  assert.match(pages, /PROJECT_STATUSES/);
  assert.match(pages, /ADMIN_READY_STATUSES/);
  assert.match(pages, /Evento en marcha/);
  assert.match(pages, /VINILOS_PROJECT_ID/);
  assert.match(pages, /vinilosSeed/);
  assert.match(pages, /withVinilosSeed/);
  assert.match(pages, /legacyVinilosIds/);
  assert.match(pages, /isLegacyVinilosLinked/);
  assert.match(pages, /partnerFormProjectId/);
  assert.match(pages, /Este porcentaje equivale/);
  assert.match(pages, /Valor segun % presupuesto/);
  assert.match(pages, /Estimacion inicial de Vinilos/);
  assert.match(pages, /eventFinancialSummary/);
  assert.match(pages, /renderEventControlPanel/);
  assert.match(pages, /renderEventProjectionPlane/);
  assert.match(pages, /Punto equilibrio/);
  assert.match(pages, /linea punto equilibrio/);
  assert.match(pages, /projection-point/);
  assert.match(pages, /Pasa el mouse/);
  assert.match(pages, /activeProjectPartners/);
  assert.match(pages, /buildEventReportLines/);
  assert.match(pages, /EVENT_REFERENCE_ASSETS/);
  assert.match(pages, /eventReferenceAssets/);
  assert.match(pages, /renderEventReferencePanel/);
  assert.match(pages, /ibarra-resumen\.png/);
  assert.match(pages, /IVA_RATE/);
  assert.match(pages, /CONTINGENCY_RATE/);
  assert.match(pages, /administrationTotals/);
  assert.match(pages, /activateProjectAdministration/);
  assert.match(pages, /Negocio activo/);
  assert.match(pages, /En funcion/);
  assert.match(pages, /MOVEMENT_CATEGORIES/);
  assert.match(pages, /USER_PASSWORD_SALT/);
  assert.match(pages, /buildUserPayload/);
  assert.match(pages, /publicUsers/);
  assert.match(pages, /localUserByCredentials/);
  assert.match(pages, /renderPartnerSelects/);
  assert.match(pages, /partnerStats/);
  assert.match(pages, /partnerName/);
  assert.match(pages, /MOVIMIENTOS ASIGNADOS/);
  assert.match(pages, /projectParticipationStats/);
  assert.match(pages, /validatePartnerParticipation/);
  assert.match(pages, /Capital real socios/);
  assert.match(pages, /partner-card-head/);
  assert.doesNotMatch(index, /Correo de invitacion|Enviar invitacion|Invitar usuario/i);
  assert.match(appsScript, /function doGet/);
  assert.match(appsScript, /function doPost/);
  assert.match(appsScript, /SCRIPT_VERSION/);
  assert.match(appsScript, /versionedPayload_/);
  assert.match(appsScript, /CLEAN_START_VERSION/);
  assert.match(appsScript, /resetWorkbookData_/);
  assert.match(appsScript, /function parseGetPayload_/);
  assert.match(appsScript, /ContentService\.MimeType\.JAVASCRIPT/);
  assert.match(appsScript, /deleteProject_/);
  assert.match(appsScript, /mergeLocalData_/);
  assert.match(appsScript, /pruneObjectsMissingFromSnapshot_/);
  assert.match(appsScript, /upsertObjects_/);
  assert.match(appsScript, /updateProject_/);
  assert.match(appsScript, /updateMovement_/);
  assert.match(appsScript, /updatePartner_/);
  assert.match(appsScript, /updateInventory_/);
  assert.match(appsScript, /initialBudget/);
  assert.match(appsScript, /lastBudgetReason/);
  assert.match(appsScript, /userByCredentials_/);
  assert.match(appsScript, /passwordHash/);
  assert.match(appsScript, /partnerId/);
  assert.match(appsScript, /projectParticipationTotal_/);
  assert.match(appsScript, /deleteRowsByColumnValue_/);
  assert.match(appsScript, /text_\(payload\.status, "En revision"\)/);
  assert.match(appsScript, /1KCzz2B59PN3IvcyM2_G2uvTi8nA759oV7rUsaXvrcSY/);
});
