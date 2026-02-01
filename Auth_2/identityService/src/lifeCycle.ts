import type { FastifyInstance } from "fastify";
import type { Socket } from "node:net";

export const attachLifeCycle = (fastify: FastifyInstance) => {
  let shuttingDown = false;
  const sockets = new Set<Socket>();
  const SHUTDOWN_TIMEOUT = 10000;

  /* -------------------- socket tracking -------------------- */
  fastify.server.on("connection", (socket: Socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
  });

  /* -------------------- shutdown logic -------------------- */
  const shutdown = async (signal: NodeJS.Signals | string) => {
    if (shuttingDown) return;
    shuttingDown = true;

    fastify.log.info({ signal }, "SHUTDOWN_STARTED");

    // 🧠 Stop keep-alive sockets first (KEY FIX)
    if (typeof fastify.server.closeIdleConnections === "function") {
      fastify.log.info("CLOSING_IDLE_CONNECTIONS");
      fastify.server.closeIdleConnections();
    }

    const forceTimer = setTimeout(() => {
      fastify.log.fatal("FORCE_SHUTDOWN");

      // last resort — kill everything
      if (typeof fastify.server.closeAllConnections === "function") {
        fastify.server.closeAllConnections();
      }

      for (const socket of sockets) {
        socket.destroy();
      }

      process.exit(1);
    }, SHUTDOWN_TIMEOUT);

    forceTimer.unref();

    try {
      await fastify.close(); // waits for in-flight requests only
      clearTimeout(forceTimer);

      fastify.log.info("SHUTDOWN_COMPLETE");
      process.exit(0);
    } catch (err) {
      fastify.log.error({ err }, "SHUTDOWN_FAILED");
      process.exit(1);
    }
  };

  /* -------------------- OS signals -------------------- */
  ["SIGINT", "SIGTERM", "SIGHUP", "SIGQUIT"].forEach((signal) => {
    process.on(signal, shutdown);
  });

  /* -------------------- fatal process errors -------------------- */
  process.on("uncaughtException", (err) => {
    fastify.log.fatal({ err }, "UNCAUGHT_EXCEPTION");
    shutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    fastify.log.fatal({ reason }, "UNHANDLED_REJECTION");
    shutdown("unhandledRejection");
  });
};
