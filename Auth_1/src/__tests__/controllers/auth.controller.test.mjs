import CreateAuthController from "../../controller/auth.controller.mjs";

describe("test user controller!", () => {
    let authController = null;
    beforeEach(() => {
        const AuthService = {
            create: async ({ username, email, full_name, password }) => {
                return { id: "123445-231321-3423", username, email, full_name }
            },
            checkCred: async ({ username, email, password }) => {
                return {
                    access_token: "c30ff059-42cb-430c-bef5-b51abc82ef00",
                    refresh_token: "c30ff059-42cb-430c-bef5-b51abc82ef00",
                    session_token: "c30ff059-42cb-430c-bef5-b51abc82ef00"
                }
            },
            refresh_TOKEN: async(sid,rid)=>{
                return {
                    access_token: "c30ff059-42cb-430c-bef5-b51abc82ef00",
                    refresh_token: "c30ff059-42cb-430c-bef5-b51abc82ef00",
                    session_token: "c30ff059-42cb-430c-bef5-b51abc82ef00" 
                }
            },
            logout:async(user_id,sid,all)=>{
                return {};
            },

            forgetPassword:async({username,email})=>{
                return {};
            },

            resetPass:async(token,password)=>{
                return;
            }
        }

        authController = CreateAuthController({ AuthService });
    })


    // register
    describe("regsiter", () => {
        it('should return 400 and 200!', async () => {
            let payload = [
                { body: { username: "toklas495", password: "Toklas@#123", email: "toklas@gmail.com", full_name: "Monkey D Luffy" } },
                {},
                { body: { username: "toklas495", password: "password@#233", email: "toklas@gmail.com" } }
            ]

            let res = null;
            const next = (error) => {
                throw error;
            };

            for (let req of payload) {
                try {
                    res = await authController.register(req, undefined, next)
                    expect(res.status).to.equal(200)
                    expect(res.body).to.equal({ username: "toklas495", email: "toklas@gmail.com", full_name: "Monkey D Luffy", id: "123445-231321-3423" })
                } catch (error) {
                    expect(error.status).to.equal(400)
                }
            }
        })
    })

    // login

    describe("login", () => {
        const next = (err)=>{
            throw err;
        }
        it("should return 200", async () => {
            let req = { body: { username: "luffy", email: "luffy@#123", password: "Luffy@#123" } };
            let res = null;
            res = await authController.login(req, res, next);
            expect(res.status).to.equal(200);
            expect(res).to.includes.keys("status","body","cookies");
            expect(res.body).to.includes.keys("access_token","expires_in","message")
        })

        it("should return 400",async()=>{
            const payload = [
                {body:{username:"luffy",password:"password"}},
                {body:{email:"luffy@gmail.com",password:"luffy@#123"}},
                {body:{}},
                {}
            ]
            for(let req of payload){
                try{
                    const res = await authController.login(req,undefined,next);
                    expect(res.status).to.equal(200);
                }catch(error){
                    expect(error.status).to.equal(400);
                }
            }
        })
    })


    // refresh

    describe("refresh",()=>{
        const next = (err)=>{
            throw err;
        }

        it("should return 200",async()=>{
            const req = {body:{},cookies:{sid:"1233412423431241545",rid:"12345567745234523"}};
            const res = await authController.refresh(req,undefined,next);
            expect(res).to.includes.keys("cookies","body","status");
            expect(res.status).to.equal(200);
            expect(res.body).to.includes.keys("message","expires_in","access_token");
        })


        it("should return 400",async()=>{
            const payload = [
                {body:{},cookies:{sid:"1233412423431241545",rid:"12345567745234523"}},
                {body:{},cookies:{}},
                {},
                {cookies:{sid:"faafsdjajsdfasjfjsdfsdfjjsa"}},
                0
            ]

            for(let req of payload){
                try{
                    const res = await authController.refresh(req,undefined,next);
                    expect(res.status).to.equal(200);
                }catch(error){
                    expect(error.status).to.equal(400);
                }
            }
            
        })

    })



    describe("logout",()=>{
        const next = (err)=>{
            throw err;
        }

        it("should return 200!",async()=>{
            const req = {body:{},cookies:{sid:"dfasfadfasjfasfjsadf"},params:{},query:{all:false},session:{user_id:"dfadsfasfsdfaf"}};
            const res  = await authController.logout(req,undefined,next);
            expect(res).to.includes.keys("c_cookies","body","status");
            expect(res.status).to.equal(200);
            expect(res.body).to.includes.keys("message");
        })

        it("should return 400!",async()=>{
            const payload = [
                {body:{},cookies:{sid:"djafsdjfjasldfajsdf"},params:{},query:{all:false},session:{user_id:"dfasdfa"}},
                {session:{user_id:"fasfsaf"}},
                {},
                0
            ]

            for(let req of payload){
                try{
                    const res = await authController.logout(req,undefined,next);
                    expect(res.status).to.equal(200);
                }catch(error){
                    expect(error.status).to.equal(400)
                }
            }
        })

    })


    describe("forget-password",()=>{
        const next  = (error)=>{
            throw error;
        }

        it("should return 200!",async()=>{
            const req = {body:{username:"nimesh",email:"email@gmail.com"}};
            const res = await authController.forgetPassword(req,undefined,next);
            expect(res).to.includes.keys("status","body");
            expect(res.status).to.equal(200);
            expect(res.body).to.includes.keys("message");
        })

        it("should return 400!",async()=>{
            const payload = [
                {body:{username:"nimesh",email:"email@gmail.com"}},
                {body:{}},
                {},
                0,
                undefined,
                null
            ]

            for(let req of payload){
                try{
                    const res = await authController.forgetPassword(req,undefined,next);
                    expect(res.status).to.equal(200);
                }catch(error){
                    expect(error.status).to.equal(400)
                }
            }
        })
    })


    describe("reset-pass",()=>{
        const next = (error)=>{
            throw error;
        }

        it("should return 200!",async()=>{
            const req = {body:{token:"fsfsdfsajlfsadfasdf",password:"password"}};
            const res = await authController.resetPass(req,undefined,next);
            expect(res).to.includes.keys("status","body");
            expect(res.status).to.equal(200);
            expect(res.body).to.includes.keys("message");
        })

        it("should return 400!",async()=>{
            const payload = [
                {body:{token:"dfjasdfajsdfadlfjajdf",password:"dfasdfsadfsajf"}},
                {},
                0,
                null,
                undefined,
                {body:{}},
                {body:null},{body:0}
            ]

            for(let req of payload){
                try{
                    const res = await authController.resetPass(req,undefined,next);
                    expect(res.status).to.equal(200);
                }catch(error){
                    expect(error.status).to.equal(400);
                }
            }
        })
    })
})