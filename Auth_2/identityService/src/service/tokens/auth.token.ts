import type { KeyStore, StoredKey } from "../../type/cache.type.js";
import type { ErrorSchema } from "../../utils/error.js";
import jwt,{type JwtPayload,type JwtHeader,type VerifyErrors} from 'jsonwebtoken';
import { getCache } from "../../core/redis/cache.registry.js";
import {JwksClient,type SigningKey} from 'jwks-rsa';
import type { OauthResultSchema, providerSchema } from "../../type/oauth.type.js";
import { genToken, hashCodeChallenge } from "./alg.token.js";


interface Options {
    Error: ErrorSchema,
}


export const createJwt = (opts:Options)=>{
    const jwtSign = async () => {
        const store = await getCache("secret").get("jwt-keys");
        if (!store || !store.active) {
            throw new Error("Jwt Key store not initialized!");
        }
        const kid = store.active;
        const keyEntry: StoredKey = store.keys[kid];
        if (!keyEntry) {
            throw opts.Error.notFound("kid not found!");
        }

        const signingKey =
            keyEntry.alg === "HS256"
                ? keyEntry.secret
                : keyEntry.privateKey;

        if (!signingKey) {
            throw opts.Error.notFound("Signing key missing");
        }

        return (
            payload: string | object | Buffer,
            expiresInMin: number = 15,
            jwtId: string
        ) =>
            jwt.sign(payload, signingKey, {
                algorithm: keyEntry.alg,
                jwtid: jwtId,
                issuer: "404auth",
                expiresIn: `${expiresInMin}m`,
                header: { kid }
            });

    }

    const jwtVerify = async (token:string) => {
        const decoded = jwt.decode(token,{complete:true});
        if(!decoded||!decoded.header){
            throw opts.Error.unAuthorized("Invalid JWT token!");
        }
        const {kid,alg} = decoded.header;
        const store:KeyStore = await getCache("secret").get("jwt-keys");
        if(!store||!store.keys[kid]){
            throw opts.Error.notFound("unknown key id(kid)");
        }
        const keyEntry:StoredKey = store.keys[kid];
        if(keyEntry.alg!==alg){
            throw opts.Error.unAuthorized("JWT Algorithm mismatch");
        }

        const verifyKey = 
            keyEntry.alg==="HS256"
            ?keyEntry.publicKey
            :keyEntry.publicKey

        if(!verifyKey){
            throw opts.Error.notFound("Verification key missing!");
        }

        return jwt.verify(token,verifyKey,{
            algorithms:[keyEntry.alg],
            issuer:"404auth"
        });
    }
    return {
        jwtVerify,jwtSign
    }
}



type VerifyResult = OauthResultSchema|JwtPayload;

export const oauthJwtVerify = async (
  token: string,
  jwks_uri: string,
  issuer: string,
  audience: string
): Promise<VerifyResult> => {
  const client = new JwksClient({
    jwksUri: jwks_uri,
    cache: true,
    cacheMaxAge: 10 * 60 * 1000, // 10 minutes
    cacheMaxEntries: 5
  });

  const getKey = (
    header: JwtHeader,
    callback: (err: Error | null, key?: string) => void
  ): void => {
    if (!header.kid) {
      return callback(new Error("Missing kid in token header"));
    }

    client.getSigningKey(header.kid, (err, key: SigningKey) => {
      if (err) {
        return callback(err);
      }

      const publicKey = key.getPublicKey();
      callback(null, publicKey);
    });
  };

  return new Promise<VerifyResult>((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        algorithms: ["RS256"],
        issuer,
        audience
      },
      (err: VerifyErrors | null, decoded: VerifyResult | undefined) => {
        if (err) {
          return reject(err);
        }
        resolve(decoded as VerifyResult);
      }
    );
  });
};



export const deleteAuthFlow = async(flow_id:string|undefined)=>{
  if(!flow_id) return;
  await getCache("auth")?.remove(flow_id,"AUTH_FLOW");
}

export const getAuthFlow = async(flow_id:string|undefined)=>{
  if(!flow_id) return;
  return await getCache("auth")?.get(flow_id,"AUTH_FLOW");
}

export const updateAuthFlow = async(flow_id:string|undefined,payload:object)=>{
  if(!flow_id) return;
  const flow = await getCache("auth").get(flow_id,"AUTH_FLOW");
  await getCache("auth")?.set({...flow,...payload},flow_id,"AUTH_FLOW");
}

export const saveAuthFlow = async(provider:providerSchema)=>{
  const [state,nonce,codeVerifier,flow_id] =  Array.from({ length: 4 }, () => genToken(32));
  const codeChallenge = hashCodeChallenge(codeVerifier);
  const payload = {
    status:"INIT",
    intent:"LOGIN",
    initial_provider:provider,
    oauth:{
      state,
      nonce,
      codeVerifier
    },
    created_at:new Date().toISOString()
  }
  await getCache("auth")?.set(payload,flow_id,"AUTH_FLOW");
  return {
    state,
    nonce,
    code_challenge:codeChallenge,
    flow_id,
    code_challenge_method:"S256"
  }
}


export type JwtSchema = ReturnType<typeof createJwt>;