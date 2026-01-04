import http from 'http';

export const createServer = (app)=>{
    return http.createServer(app);
}