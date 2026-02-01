import createApp from "./app/app.js";
import createServer from "./server.js";
// import { connectDb } from "./core/db/mongoose.index.js";
import { connectDb } from "./core/db/knex.index.js";
import { connectRedis } from "./core/redis/index.js";
import {attachLifeCycle} from "./lifeCycle.js";


const app = createApp();
attachLifeCycle(app);
connectRedis(app);
await connectDb(app);
await createServer(app);
