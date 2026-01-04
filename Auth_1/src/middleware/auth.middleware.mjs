import AppError, { normalizeError } from "../utils/Error.mjs";

export default function createAuth({
    AuthService
}) {
    const checkAuth = (req, res, next) => {
        try {
            if (req.session) return next();
            throw AppError.known({
                message:"Authentication Required!",
                status:401,
                code:"AUTH",
                layer:"layer.middleware",
                event:"event.auth"
            })
        } catch (error) {
            if(error instanceof AppError) throw  error;
            throw AppError.unKnown(error,{
                layer:"layer.middleware",
                event:"event.auth"
            })
        }
    }
    const authMiddleware = async (req, res, next) => {
        try {
            const authorization_header = req.headers["authorization"];
            if (!authorization_header) return next();
            if (typeof authorization_header === "string" && !authorization_header.startsWith("Bearer ")) {
                throw AppError.known({
                    message:"Invalid Authorization Token!",
                    status:401,
                    code:"AUTH",
                    layer:"layer.middleware",
                    event:"event.auth"
                })
            }
            const token = authorization_header.trim().split(" ")[1];
            const session = await AuthService.verifyJWT_TOKEN({jwt:token});
            req.session = session;
            next();
        } catch (error) {
            throw normalizeError(error,{
                layer:"layer.middleware",
                event:"event.auth",
            })
        }
    }
    return {
        checkAuth,
        authMiddleware
    }
}