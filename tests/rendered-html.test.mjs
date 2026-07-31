import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);
const BASE_PATH = "/ai-adoption-workshop-kit";

async function render(pathname = `${BASE_PATH}/`, requestHeaders = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const host = requestHeaders.host ?? "localhost";

  return worker.fetch(
    new Request(`http://${host}${pathname}`, {
      headers: { accept: "text/html", ...requestHeaders },
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
  assert.match(html, new RegExp(`${BASE_PATH}/assets/`));
  assert.match(html, new RegExp(`${BASE_PATH}/og\\.png`));
  assert.match(html, new RegExp(`${BASE_PATH}/assets/_vinext_fonts/`));
  assert.doesNotMatch(html, /(?:href|src)="\/assets\//);
});

test("rejects requests outside the branded subpath mount", async () => {
  const response = await render("/");
  assert.equal(response.status, 404);
});

test("omits upstream chatgpt.site from Open Graph, Twitter, and icon metadata", async () => {
  const proxied = await render(`${BASE_PATH}/`, {
    host: "ai-adoption-workshop-kit.example.chatgpt.site",
    "x-forwarded-host": "portfolio.example",
    "x-forwarded-proto": "https",
  });
  assert.equal(proxied.status, 200);
  const proxiedHtml = await proxied.text();
  assert.doesNotMatch(proxiedHtml, /chatgpt\.site/i);
  assert.match(
    proxiedHtml,
    /(?:property|name)="og:image" content="https:\/\/portfolio\.example\/ai-adoption-workshop-kit\/og\.png"/,
  );
  assert.match(
    proxiedHtml,
    /name="twitter:image" content="https:\/\/portfolio\.example\/ai-adoption-workshop-kit\/og\.png"/,
  );
  assert.match(
    proxiedHtml,
    /rel="icon" href="https:\/\/portfolio\.example\/ai-adoption-workshop-kit\/og\.png"/,
  );

  const upstreamOnly = await render(`${BASE_PATH}/`, {
    host: "ai-adoption-workshop-kit.example.chatgpt.site",
  });
  assert.equal(upstreamOnly.status, 200);
  const upstreamHtml = await upstreamOnly.text();
  assert.doesNotMatch(upstreamHtml, /chatgpt\.site/i);
  assert.match(
    upstreamHtml,
    new RegExp(`(?:property|name)="og:image" content="${BASE_PATH}/og\\.png"`),
  );
  assert.match(
    upstreamHtml,
    new RegExp(`name="twitter:image" content="${BASE_PATH}/og\\.png"`),
  );
  assert.match(
    upstreamHtml,
    new RegExp(`rel="(?:shortcut )?icon" href="${BASE_PATH}/og\\.png"`),
  );
});

test("ships all required workshop capabilities in the interactive source", async () => {
  const [page, css, layout, design, nextConfig, basePathConfig] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../DESIGN.md", import.meta.url), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../config/base-path.ts", import.meta.url), "utf8"),
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
  assert.match(nextConfig, /basePath:\s*BASE_PATH/);
  assert.match(basePathConfig, new RegExp(`BASE_PATH = "${BASE_PATH}"`));

  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
  await assert.rejects(access(new URL("../public/_sites-preview", templateRoot)));
});
