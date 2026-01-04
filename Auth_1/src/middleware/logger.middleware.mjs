import { logger } from "../infra/logger/index.mjs";


export default function CreateLogger() {
    const reqLoggerMiddleware = (req, res, next) => {
        req.log = logger.child({
            req_id: req.id,
            ip: req?.ip,
            user_agent: req.headers["user-agent"],
            path:req?.path,
            layer:"system"
        });
        req.c_log = logger.child({req_id:req.id,layer:"controller"});
        req.s_log = logger.child({req_id:req.id,layer:"service"});
        req.m_log = logger.child({req_id:req.id,layer:"model"});
        next();
    }
    return reqLoggerMiddleware;
}