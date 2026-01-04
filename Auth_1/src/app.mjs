import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/error.middleware.mjs';


export const createApp = (container)=>{
    const app = express();
    
    app.use(express.json());
    app.use(cookieParser());

    app.use(container.reqIdMiddleware);
    app.use(container.reqLogMiddleware)
    app.use("/api/v1",container.router);

    app.get("/ping",(req,res)=>{
        res.status(200).send({
            status:"ok",
            message:"pong",
            timestamp:new Date().toISOString()
        })
    })

    app.use(errorHandler);

    return app;
}
