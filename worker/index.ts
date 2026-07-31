/** Cloudflare Worker entry point for the AI Adoption Workshop Kit. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { stripBasePath } from "../config/base-path";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

function isStaticAssetPath(pathname: string): boolean {
  return (
    pathname.startsWith("/assets/") ||
    pathname === "/og.png" ||
    /\.[a-z0-9]+$/i.test(pathname)
  );
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const strippedPath = stripBasePath(url.pathname);

    // Checked after basePath stripping so /<basePath>/_vinext/image works.
    if (strippedPath === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      const imageRequest =
        url.pathname === strippedPath
          ? request
          : new Request(new URL(strippedPath + url.search, request.url), request);
      return handleImageOptimization(imageRequest, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    // When the reverse proxy preserves the branded subpath, hashed client
    // assets and public files are requested under BASE_PATH while on-disk /
    // ASSETS paths remain unprefixed. Resolve those before the RSC handler.
    if (
      env.ASSETS &&
      url.pathname !== strippedPath &&
      isStaticAssetPath(strippedPath)
    ) {
      const assetResponse = await env.ASSETS.fetch(
        new Request(new URL(strippedPath + url.search, request.url), request),
      );
      if (assetResponse.ok || assetResponse.status === 304) {
        return assetResponse;
      }
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
