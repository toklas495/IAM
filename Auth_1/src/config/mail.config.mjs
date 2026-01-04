import envConfig from '../../envConfig.mjs';

export const mailConfig = {
    service:"gmail",
    auth:{
        user:envConfig.EMAIL.gmail.user,
        pass:envConfig.EMAIL.gmail.pass
    }
}

export const gmailConfig = {
    from:`Admin <${envConfig.EMAIL.gmail.user}>`,
    retryCount:0
}