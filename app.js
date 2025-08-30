import "dotenv/config";
import { connectDB } from "./src/config/connect.js";
import fastify from "fastify";
import { PORT } from "./src/config/config.js";
import fastifySocketIo from "fastify-socket.io";
import { registerRoutes } from "./src/routes/index.js";
import { admin, buildAdminRouter } from "./src/config/setup.js";

const start = async () => {
  await connectDB(process.env.DATABASE_URI);

  const app = fastify();

  app.register(fastifySocketIo, {
    cors: {
      origin: "*",
    },
    pingInterval: 10000,
    pingTimeout: 5000,
    transports: ["websocket"],
  });

  await registerRoutes(app);
  await buildAdminRouter(app);
  app.listen({ port: PORT, host: "0.0.0.0" }, (err, add) => {
    if (err) {
      console.log(err);
    } else {
      console.log(
        `Grocery APP running on http://localhost:${PORT}${admin.options.rootPath}`
      );
    }
  });

  app.ready().then(() => {
    app.io.on("connection", (socket) => {
      console.log("A User Connected");
      socket.on("joinRoom", (orderId) => {
        socket.join(orderId);
        console.log(`User Joined room ${orderId}`);
      });

      socket.on("disconnect", () => {
        console.log("User disconnnected");
      });
    });
  });
};

start();
