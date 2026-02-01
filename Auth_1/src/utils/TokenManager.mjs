import jwt from "jsonwebtoken";
import crypto from "crypto";
import argon2 from "argon2";
import bcrypt from "bcrypt";
import JwksClient from "jwks-rsa";
import AppError from "./Error.mjs";


/* -------------------- HASHING -------------------- */
export const hashify = (payload) => ({
  SHA256: () =>
    crypto.createHash("sha256").update(payload).digest("hex"),

  argon2: async () =>
    argon2.hash(payload, {
      type: argon2.argon2id,
      parallelism: 4,
      memoryCost: 16 * 1024,
      timeCost: 3
    }),

  bcrypt: async (salt = 10) =>
    bcrypt.hash(payload, salt)
});

export const hashVerify = (payload, digest) => ({
  argon2: async () => argon2.verify(digest, payload),
  bcrypt: async () => bcrypt.compare(payload, digest)
});

/* -------------------- RANDOM TOKENS -------------------- */

export const genToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

export const genUser = (eamil) => {
  const username = eamil.split("@")[0];
  return `${username}_${crypto.randomBytes(3).toString("hex")}`;
}

export const ranToken = () =>
  crypto.randomUUID();

/* -------------------- JWT SIGN -------------------- */

export const jwtSign = async (cache) => {
  const store = await cache.get("jwt-keys");
  if (!store || !store.active) {
    throw AppError.known({
      message:"JWT key store not initialized",
      event:"event.utils.token-manager.jwtSign",
      layer:"layer.utils",
      status:400,
      code:"SERVER_ERROR"
    });
  }

  const kid = store.active;
  const keyEntry = store.keys[kid];
  if (!keyEntry) {
    throw AppError.known({
      message:"kid not found",
      status:404,
      code:"NOT_FOUND",
      layer:"layer.utils",
      event:"event.utils.token-manager.jwtSign"
    });
  }

  const signingKey =
    keyEntry.alg === "HS256"
      ? keyEntry.secret
      : keyEntry.privateKey;

  if (!signingKey) {
    throw AppError.known({
      message:"Signing key missing",
      status:404,
      code:"NOT_FOUND",
      layer:"layer.utils",
      event:"event.utils.token-manager.jwtSign"
    });
  }

  return (payload, expiresInMin = 15, jwtid) =>
    jwt.sign(payload, signingKey, {
      algorithm: keyEntry.alg,
      issuer: "404-auth",
      expiresIn: `${expiresInMin}m`,
      jwtid: jwtid || crypto.randomUUID(),
      header: { kid }
    });
};

/* -------------------- JWT VERIFY -------------------- */

export const jwtVerify = async (cache, token) => {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || !decoded.header) {
    throw AppError.known({
      message:"Invalid JWT token!",
      status:401,
      code:"AUTH",
      layer:"layer.utils",
      event:"event.utils.token-manager.jwtVerify"
    });
  }

  const { kid, alg } = decoded.header;

  const store = await cache.get("jwt-keys");
  if (!store || !store.keys[kid]) {
    throw AppError.known({
      message:"Unknown key id (kid)",
      status:404,
      code:"NOT_FOUND",
      layer:"layer.utils",
      event:"event.utils.token-manager.jwtVerify"
    });
  }

  const keyEntry = store.keys[kid];

  if (keyEntry.alg !== alg) {
    throw AppError.known({
      message:"JWT algorithm mismatch",
      status:400,
      layer:"layer.utils",
      event:"event.utils.token-manager.jwtVerify",
      code:"BAD_REQ"
    });
  }

  const verifyKey =
    keyEntry.alg === "HS256"
      ? keyEntry.secret
      : keyEntry.publicKey;

  if (!verifyKey) {
    throw AppError.known({
      message:"Verification key missing",
      status:404,
      code:"NOT_FOUND",
      layer:"layer.utils",
      event:"event.utils.token-manager.jwtVerify"
    });
  }

  return jwt.verify(token, verifyKey, {
    algorithms: [keyEntry.alg],
    issuer: "404-auth"
  });
};


export const oauth_jwtVerify = async (token, options = {}) => {
  const client = new JwksClient({
    jwksUri: options?.jwks_uri || "https://www.googleapis.com/oauth2/v3/certs",
    cache: true,
    cacheMaxAge: 10 * 60 * 1000,
    cacheMaxEntries: 5
  })
  function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        return callback(err);
      }
      const publicKey = key.getPublicKey();
      callback(null, publicKey);
    })
  }

  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        algorithms: ["RS256"],
        issuer: options?.issuer || "https://accounts.google.com",
        audience: options?.audience
      },
      (err, decoded) => {
        if (err) {
          return reject(err);
        }
        resolve(decoded);
      }
    )
  })
}

export const pkceGen = () => {
  const code_verifier = genToken(32);
  const code_challenge = crypto.createHash("sha256").update(code_verifier).digest();
  const base64_challenge = code_challenge
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return {
    code_verifier,
    code_challenge: base64_challenge,
    code_challenge_method: "SHA256"
  }
}

/* -------------------- PUBLIC API -------------------- */

const tokenManager = {
    hashify,
    hashVerify,
    genToken,
    ranToken,
    jwtSign,
    jwtVerify,
    genUser,
    oauth_jwtVerify,
    pkceGen
};

export default tokenManager;
