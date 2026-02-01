export type JWTAlg = "HS256" | "RS256" | "ES256"

export interface KeyMaterial {
    publicKey?: string;
    privateKey?: string;
    secret?: string;
}
export interface StoredKey extends KeyMaterial {
    alg: JWTAlg;
    status: "ACTIVE" | "PASSIVE";
    created_at: number;
}

export interface KeyStore {
    active: string | null;
    keys: Record<string, StoredKey>;
}