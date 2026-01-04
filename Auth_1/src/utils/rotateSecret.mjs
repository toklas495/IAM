import { getCache } from './Cache.mjs';
import crypto from 'crypto';
import AppError, { normalizeError } from './Error.mjs';


function generateHS256Key(){
    return {
        secret:crypto.randomBytes(64).toString("hex")
    }
}

function generateRS256Key(){
    const {publicKey,privateKey} = crypto.generateKeyPairSync("rsa",{
        modulusLength:2048,
        publicKeyEncoding:{type:"spki",format:"pem"},
        privateKeyEncoding:{type:"pkcs8",format:"pem"}
    });
    return {publicKey,privateKey};
}

function generateES256Key(){
    const {publicKey,privateKey} = crypto.generateKeyPairSync("ec",{
        namedCurve:"P-256",
        publicKeyEncoding:{type:"spki",format:"pem"},
        privateKeyEncoding:{type:"pkcs8",format:"pem"}
    })
    return {publicKey,privateKey};
}


const rotateSecret = async (alg="HS256") => {
    try {
        const cache = getCache("secret");

        let store = await cache.get("jwt-keys");
        if (!store) {
            store = { active: null, keys: {} }
        };

        const kid = `key-${Date.now()}`;

        // 1 Mark current active and passive
        let keyMaterial;
        if(alg==="HS256") keyMaterial = generateHS256Key();
        if(alg==="RS256") keyMaterial = generateRS256Key();
        if(alg==="ES256") keyMaterial = generateES256Key(); 

        // 2 demote old active
        if (store.active && store.keys[store.active]) {
            store.keys[store.active].status = "PASSIVE";
        }

        // 3 insert new active key 
        store.keys[kid] = {
            alg,
            status:"ACTIVE",
            created_at: Date.now(),
            ...keyMaterial
        }

        store.active = kid;

        // 3. keep only last 2 keys

        const kids = Object.entries(store.keys)
            .sort((a, b) => a[1].created_at - b[1].created_at);

        while (kids.length > 3) {
            const [oldkid] = kids.shift();
            delete store.keys[oldkid];
        };
        await cache.setTtl(604800).set(store, "jwt-keys");
    } catch (error) {
        throw normalizeError(error,{
            layer:"layer.utils",
            event:"event.utils.rotateSecret"
        })
    }
}

let isRun = false;
let rotating = false;

export async function scheduler() {
    if (isRun) return;
    isRun = true;

    const safeRotate = async () => {
        if (rotating) return;
        rotating = true;

        try {
            await rotateSecret();
            console.log("[auth] JWT secret rotated");
        } catch (error) {
            console.error("[auth] JWT rotation failed", error);
            //   emit metric / alert here
            throw normalizeError(error,{layer:"layer.utils",event:"event.utils.rotateSecret.safeRotate"})
        } finally {
            rotating = false;
        }
    };

    // initial run (after startup)
    setTimeout(safeRotate, 10_000);

    // daily rotation
    setInterval(safeRotate, 86_400_000);
}


export default scheduler;