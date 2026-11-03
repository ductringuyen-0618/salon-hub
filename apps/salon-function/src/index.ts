import { handle, realDeps } from "./handler.js";

export { handle };

const deps = realDeps();

/** DigitalOcean Functions entry. A web function receives the HTTP method as `http.method` or `__ow_method`. */
export async function main(args: { http?: { method?: string; headers?: Record<string, string | undefined> }; __ow_method?: string }) {
  const origin = args.http?.headers?.origin;
  const res = await handle({ method: (args.http?.method ?? args.__ow_method ?? "GET").toUpperCase(), ...(origin ? { origin } : {}) }, deps);
  return { statusCode: res.statusCode, headers: res.headers, body: res.body };
}
