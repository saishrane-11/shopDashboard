import { createApp } from "./app.js";
import { assertEnv, env } from "./config/env.js";

assertEnv();

const app = createApp();

app.listen(env.port, () => {
  console.log(`Shop Book API running on http://localhost:${env.port}`);
});
