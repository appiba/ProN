import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const templateRoot = new URL("../", import.meta.url);
const sourceRoots = ["app", "db", "worker", "public"];
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
});

test("keeps private bootstrap credentials out of app source", async () => {
  const source = (
    await Promise.all(
      sourceRoots.map((root) =>
        collectTextFiles(path.join(templateRootPath, root)),
      ),
    )
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
