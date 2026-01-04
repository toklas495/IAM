import util from 'util';

let isShuttingDown = false;

export const attachLifeCycle = (server,{onShutdown})=>{
    const closeServer = util.promisify(server.close.bind(server));

    const shutdown = async (signal)=>{
        if(isShuttingDown) return;
        isShuttingDown = true;
        console.log(`SHUTDOWN_SIGNAL > ${signal}`);

        try{
            if(onShutdown) await onShutdown();
            await closeServer();
            process.exit(0);
        }catch(error){
            console.error(`SHUTDOWN_ERROR > ${error}`);
            process.exit(1);
        }
    }

    ["SIGINT","SIGTERM","SIGHUP","SIGQUIT"].forEach((sig)=>{
        process.on(sig,shutdown);
    })

    process.on("uncaughtException",async(error)=>{
        console.error(`UNCAUGHT_EXCEPTION: ${error}`);
        await shutdown("UNCAUGHT_EXCEPTION");
    });
    process.on("unhandledRejection",(reason)=>{
        console.error(`UNHANDLE_REJECTION: ${reason}`);
        process.exit(1);
    });
}