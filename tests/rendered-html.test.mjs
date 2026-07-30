import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the fictional workshop rationale and session shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Fieldwork — AI Adoption Workshop Kit<\/title>/i);
  assert.match(html, /Why this workshop is designed this way\./);
  assert.match(html, /Fictional workshop prototype/);
  assert.match(html, /45-minute session/);
  assert.match(html, /Practice action/);
  assert.match(html, /Learning evidence/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("ships all required workshop capabilities in the interactive source", async () => {
  const [page, css, layout, design] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../DESIGN.md", import.meta.url), "utf8"),
  ]);

  assert.match(page, /AI Practice Coach/);
  assert.match(page, /Prompt structure/);
  assert.match(page, /Follow-up questions/);
  assert.match(page, /Response-review cues/);
  assert.match(page, /Escalation flags/);
  assert.match(page, /Anonymous live learning board/);
  assert.match(page, /Product-feedback backlog/);
  assert.match(page, /setBacklogItems/);
  assert.match(page, /id=\{id\}/);
  assert.match(page, /anonymous by default/i);
  assert.match(page, /Edge-case clinic/);
  assert.match(page, /Fictional session signal/);
  assert.match(page, /aria-live="polite"/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media \(max-width: 560px\)/);
  assert.match(layout, /fictional, interactive 45-minute workshop/i);
  assert.match(design, /not an Eliza client engagement/i);

  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
  await assert.rejects(access(new URL("../public/_sites-preview", templateRoot)));
});
