import AppError from "../utils/Error.mjs"

export const errorHandler = (err,req,res,next)=>{
    // normalize error;
    const error = err instanceof AppError?err:AppError.unKnown(err);

    // 2.INTERNAL LOGGING
    console.info({
        requestId:req.id,
        code:error?.code,
        layer:error?.layer,
        event:error?.event,
        isOpernational:error?.isOperational,
        message:error?.message,
        detail:error?.detail,
        // stack:error?.stack
    })

    // 3 user response
    return res.status(error?.status).json({
        error:error?.message,
        code:error?.code,
        ...(error?.url!==undefined&&{url:error?.url})
    })

    // 4 OPTIONAL crash on programmer error;
}