import crypto from 'crypto';

function createRequestContext(){
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const requestIdMiddleware = (req,res,next)=>{
        let request_id = req.headers["x-request-id"];
        if(!request_id && !uuidRegex.test(request_id) ) request_id = crypto.randomUUID();
        req.id = request_id;
        res.setHeader("X-Request-Id",request_id);
        next();
    }

    return requestIdMiddleware;
}

export default createRequestContext;