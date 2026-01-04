// bootstrap.mjs
import { initRedis } from "./infra/redis/redis-index.mjs";
import { initCache } from "./utils/Cache.mjs";
import scheduler from "./utils/rotateSecret.mjs";
import setRateLimit from "./middleware/rateLimit.middleware.mjs";

export const bootstrap = async () => {
  const redis = await initRedis(
    ["auth", "user", "secret"],
    "404-auth");
  initCache(redis, ["auth", "user", "secret"]);
  setRateLimit(redis);
  await scheduler();

  return { redis };
};

// startServer.mjs
export const startServer = (server, config) => {
  server.listen(config.PORT, config.HOST);

  server.on("listening", () => {
    const addr = server.address();
    console.log(`SERVER READY > http://${addr.address}:${addr.port}`);
  });

  server.on("error", (error) => {
    if (error.syscall !== "listen") throw error;

    switch (error.code) {
      case "EACCES":
        console.error("PERMISSION_DENIED");
        break;
      case "EADDRINUSE":
        console.error("PORT_IN_USE");
        break;
      default:
        console.error("SERVER_ERROR", error);
    }
    process.exit(1);
  });
};
