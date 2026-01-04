function buildGoogleAuthUrl(state,options={}){
    const client_id =`client_id=${options.client_id}`;
    const redirect_uri = `redirect_uri=${options.redirect_uri}`;
    const auth_uri = options.auth_uri;
    const response_type = `response_type=${options?.response_type||"code"}`; 
    const scope = `scope=${options?.scope||"openid email profile"}`;
    const access_type = `access_type=${options?.access_type||"offline"}`
    const prompt =`prompt=${options?.prompt||"consent"}`
    const nonce = options?.nonce?`nonce=${options.nonce}`:undefined;
    const code_challenge = `code_challenge=${options.code_challenge}`;
    const code_challenge_method = `code_challenge_method=${options.code_challenge_method}`;

    // google auth url
    let url =  `${auth_uri}?${client_id}&${redirect_uri}&${response_type}&${scope}&state=${state}&${access_type}&${prompt}&${code_challenge}&${code_challenge_method}` 
    if(nonce) url+=`&${nonce}`
    return url;
}

export default buildGoogleAuthUrl;