/** Public mount path for reverse-proxy / branded subpath hosting. */
export const BASE_PATH = "/ai-adoption-workshop-kit";

export function hasBasePath(pathname: string, basePath: string = BASE_PATH): boolean {
  if (!basePath) return false;
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

export function stripBasePath(pathname: string, basePath: string = BASE_PATH): string {
  if (!hasBasePath(pathname, basePath)) return pathname;
  return pathname.slice(basePath.length) || "/";
}

export function withBasePath(path: string, basePath: string = BASE_PATH): string {
  if (!basePath || !path.startsWith("/") || path.startsWith("//")) return path;
  if (hasBasePath(path, basePath)) return path;
  return `${basePath}${path}`;
}
