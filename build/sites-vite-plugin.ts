import { access, cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { Plugin } from "vite";
import { BASE_PATH } from "../config/base-path";

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function walkFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        return walkFiles(path);
      }
      return [path];
    }),
  );
  return files.flat();
}

/**
 * Vinext self-hosted Google fonts embed root-absolute `/assets/_vinext_fonts/`
 * URLs and currently omit next.config basePath. Rewrite them so reverse-proxy
 * mounts only need to forward the branded subpath.
 */
async function rewriteFontAssetUrls(root: string): Promise<void> {
  const unprefixed = "/assets/_vinext_fonts/";
  const prefixed = `${BASE_PATH}/assets/_vinext_fonts/`;
  const targets = ["dist/server", "dist/client"].map((relative) =>
    resolve(root, relative),
  );

  for (const target of targets) {
    if (!(await exists(target))) {
      continue;
    }

    for (const file of await walkFiles(target)) {
      if (!/\.(js|css|html|json)$/.test(file)) {
        continue;
      }

      const original = await readFile(file, "utf8");
      if (!original.includes(unprefixed) && !original.includes(prefixed)) {
        continue;
      }

      const updated = original
        .split(prefixed)
        .join(unprefixed)
        .split(unprefixed)
        .join(prefixed);

      if (updated !== original) {
        await writeFile(file, updated);
      }
    }
  }
}

/**
 * Mirror dist/client under the branded subpath so Cloudflare Assets (and any
 * assets-first host) can resolve /ai-adoption-workshop-kit/assets/* and
 * /ai-adoption-workshop-kit/og.png without rewriting the public URL.
 */
async function mirrorClientUnderBasePath(root: string): Promise<void> {
  const clientDir = resolve(root, "dist", "client");
  if (!(await exists(clientDir))) {
    return;
  }

  const mountSegment = BASE_PATH.replace(/^\//, "");
  if (!mountSegment) {
    return;
  }

  const mirrorDir = resolve(clientDir, mountSegment);
  await rm(mirrorDir, { recursive: true, force: true });
  await mkdir(mirrorDir, { recursive: true });

  const entries = await readdir(clientDir, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => entry.name !== mountSegment)
      .map((entry) =>
        cp(resolve(clientDir, entry.name), resolve(mirrorDir, entry.name), {
          recursive: true,
        }),
      ),
  );
}

// Packages Sites metadata and migrations after Vite finishes compiling.
export function sites(): Plugin {
  let root = process.cwd();

  return {
    name: "sites",
    apply: "build",
    configResolved(config) {
      root = config.root;
    },
    async closeBundle() {
      const outputDirectory = resolve(root, "dist", ".openai");
      const hostingConfig = resolve(root, ".openai", "hosting.json");
      const drizzleSource = resolve(root, "drizzle");

      await rm(outputDirectory, { recursive: true, force: true });
      await mkdir(outputDirectory, { recursive: true });

      if (await exists(hostingConfig)) {
        await cp(hostingConfig, resolve(outputDirectory, "hosting.json"));
      }
      if (await exists(drizzleSource)) {
        await cp(drizzleSource, resolve(outputDirectory, "drizzle"), {
          recursive: true,
        });
      }

      await rewriteFontAssetUrls(root);
      await mirrorClientUnderBasePath(root);
    },
  };
}
