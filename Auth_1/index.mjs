import {createApp} from './src/app.mjs';
import { createServer } from './src/server.mjs';
import { attachLifeCycle } from './src/lifeCycle.mjs';
import { bootstrap, startServer } from './src/start.mjs';
import config from './envConfig.mjs';
import {closeDb} from './src/infra/db/index.mjs';
import { closeRedis } from './src/infra/redis/redis-index.mjs';
import createContainer from './src/app/container.mjs';

const container = createContainer();
const app = createApp(container);
const server = createServer(app);


attachLifeCycle(server,{
    onShutdown:async()=>{
        console.log("CLEANUP_RESOURCES");
        await closeDb();
        await closeRedis();
    }
});

try{
    await bootstrap();
    startServer(server,config);
}catch(error){
    console.error("BOOTSTRAP_FAILED: ",error);
    process.exit(1);
}