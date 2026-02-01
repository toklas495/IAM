import mongoose from 'mongoose'
import type { FastifyInstance } from 'fastify/types/instance.js';
import { envConfig } from '../../config/index.js';


let isConnected = false;

export const connectDb = async (fastify:FastifyInstance):Promise<void>=>{
    if(isConnected) return;
    try{
        mongoose.set("strictQuery",true);
        await mongoose.connect(envConfig.db.mongo.url,{
            autoIndex:true,
            serverSelectionTimeoutMS:5_000,
            socketTimeoutMS:45_000
        });
        isConnected = true;
        fastify.log.info("Mongodb connected!");

        mongoose.connection.on("error",(err)=>{
            fastify.log.fatal(". Mongodb connection error ",err);
        })

        fastify.addHook("onClose",async()=>{
            await closeDb();
        })

        mongoose.connection.on("disconnected",(err)=>{
            fastify.log.warn("Mongodb disconnected!");
            isConnected = false;
        })
    }catch(error){
        fastify.log.error(`X Mongodb initial connection failed! ${error}`);
        process.exit(1);
    }
}




export const closeDb = async():Promise<void>=>{
    if(!isConnected) return;
    try{
        await mongoose.connection.close(false);
        isConnected = false;
        process.stdout.write("Mongodb connection closed!");
    }catch(err){
        process.stderr.write(`x Error closing mongodb connection ${err}`);
    }
}