import jwt from 'jsonwebtoken';

const ERROR_CODE = {
    400: "BAD_REQ",
    401: "UNAUTH",
    403: "FORBIDDEN",
    409: "DUPLICATE",
    429: "RATE_LIMIT",
    404: "NOT_FOUND",
    500: "INTERNAL_SERVER"
}



class AppError extends Error {
    constructor({
        message,
        status,
        code,
        layer = "SERVICE",
        event,
        detail,
        isOperational = true,
        url
    }) {
        super(message);
        this.status = status;
        this.code = code || ERROR_CODE[status];
        this.layer = layer;
        this.event = event;
        this.detail = detail;
        this.url = url;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }

    static known({
        message,
        status = 400,
        code,
        layer = "SERVICE",
        detail,
        event,
        url
    }) {
        return new AppError({
            message,
            status,
            code,
            layer,
            event,
            detail,
            url,
            isOperational: true
        })
    }

    static unKnown(err, options = {}) {
        return new AppError({
            message: "Internal Server Error",
            status: err?.status || 500,
            code: "INTERNAL_ERROR",
            layer: options?.layer || "SERVICE",
            event: options?.event || "UNKNOWN_EVENT",
            detail: err,
            isOperational: false
        })
    }
}

export const normalizeError = function (err, options = {}) {
    //already normalized;
    if (err instanceof AppError) return err;

    // jwt error are KNOWN
    if (
        err instanceof jwt.JsonWebTokenError ||
        err instanceof jwt.NotBeforeError ||
        err instanceof jwt.TokenExpiredError
    ) {
        return AppError.known({
            message: jwtMessage(err),
            status:401,
            code:ERROR_CODE[401],
            layer:options?.layer,
            event:options?.event,
            detail:err
        })
    }
    return AppError.unKnown(err,options);
}

const jwtMessage = (err) => {
    if (err instanceof jwt.TokenExpiredError) return "Token expired";
    if (err instanceof jwt.NotBeforeError) return "Token not active yet";
    return "Invalid token";
}

export const BAD_REQ = ({ message, event, layer }) => {
    return AppError.known({
        message: "Invalid params!" || message,
        status: 400,
        code: ERROR_CODE[400],
        layer,
        event
    })
}

export default AppError