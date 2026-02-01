import argon2 from 'argon2';
import crypto from 'crypto';

export const hashSHA256 = (payload: string) => crypto.createHash("sha256").update(payload).digest().toString("hex");
export const genToken = (size: number = 32) => crypto.randomBytes(size).toString("hex");
export const hashArgon2 = async (payload: string) => {
    return await argon2.hash(payload, {
        memoryCost: 1024 * 64,
        type: argon2.argon2id,
        parallelism: 3,
        timeCost: 2
    })
}
export const verifyArgon2 = async (digest: string, payload: string) => {
    return await argon2.verify(digest, payload);
}

export const genSHA256Key = () => {
    return {
        secret: genToken(64)
    }
}

export const genRSA256Key = () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" }
    });

    return {
        publicKey,
        privateKey
    }
}

export const hashCodeChallenge = (payload: string) => {
    return crypto.createHash("sha256").update(payload).digest()
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

export const genES256Key = () => {
    const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
        namedCurve: "P-256",
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" }
    });
    return { privateKey, publicKey };
}