import { createServer } from "node:http";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { main } = require(process.env.FUNCTION_BUNDLE ?? "./packages/salon/get/index.js");
const port = Number(process.env.DEV_PORT ?? 8788);

createServer(async (req, res) => {
  const out = await main({ http: { method: req.method, headers: { origin: req.headers.origin } } });
  res.writeHead(out.statusCode, out.headers);
  res.end(out.body);
}).listen(port, "127.0.0.1", () => console.log(`salon function on http://127.0.0.1:${port}`));
