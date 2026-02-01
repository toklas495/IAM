export type providerSchema = "google"|"github"|"facebook"|"password";

interface GoogleOauth {
  "iss": string; 
  "sub": string;
  "aud": string;
  "azp": string;
  "email": string;
  "email_verified": boolean;
  "name": string;
  "picture":string;
  "given_name": string;
  "family_name": string;
  "locale": string;
  "iat":number|Date;
  "exp":number|Date;
  "nonce": string;
}

export type queryOptions = {
    code:string|undefined,
    state:string|undefined,
    error:string|undefined,
    error_description:string|undefined;
}

export type OauthResultSchema = GoogleOauth;


