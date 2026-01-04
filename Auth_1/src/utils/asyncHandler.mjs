import AppError, { normalizeError } from "./Error.mjs"

const clearCookieHandler = (cookies,res)=>{
    cookies.forEach(cookie=>{
        res.clearCookie(cookie,{
            path:"/",
            httpOnly:true,
            secure:true,
            sameSite:"lax"
        })
    })
}

const cookieHandler = (cookies, res) => {
    cookies.forEach(cookie => {
        if(typeof cookie!=="object")  return;
        const { name, value, age, path } = cookie;
        res.cookie(name, value, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: age || 1000 * 60 * 15,
            path: path || "/"
        })
    })
}

const c_asyncHandler = (fn) => async (req, res, next) => {
    try {
        const result = await fn(req, res, next);
        if (result?.cookies && Array.isArray(result.cookies)) cookieHandler(result.cookies,res);
        if(result?.c_cookies && Array.isArray(result.c_cookies)) clearCookieHandler(result.c_cookies,res);
        if(result?.redirect) return res.redirect(result.url);
        res.status(result.status ?? 200).send(result.body);
    } catch (e) {
        next(normalizeError(e,{layer:"layer.controller",event:'event.unknown'}))
    }
}

const n_asyncHandler = (fn) => {
    return (...argv) => {
        try {
            return Promise.resolve(fn(...argv));
        } catch (error) {
            throw normalizeError(error,{layer:"layer.service",event:"event.unknown"});
        }
    }
}

const m_asyncHandler = (fn) => {
    return async function modelAsyncHandler(...argv) {
        try {
            return await fn(...argv);
        } catch (error) {
            throw normalizeError(error,{layer:"layer.model",event:"event.unknown"});
        }
    }
}


export { c_asyncHandler, n_asyncHandler, m_asyncHandler };
