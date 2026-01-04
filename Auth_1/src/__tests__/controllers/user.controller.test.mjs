import createUserConroller from '../../controller/user.controller.mjs';

describe("test user controller!", () => {
    let userController = null;
    beforeEach(() => {
        const UserService = {
            updatePassword: async (userId, password) => {
                return {};
            },
            read: async (userId, me) => {
                return {
                    id: "dsfasdjsadljflasdfljas",
                    username: "toklas495",
                    full_name: "nimesh thakur",
                    ...(me && { email: "email@gmail.com" }),
                    bio: "i never go back on my words",
                    created_at: new Date(),
                    updated_at: new Date(Date.now() + 1000)
                }
            },

            update: async ({ userId, username, full_name, email, bio }) => {
                return
            },
            destroy: async (userId) => { return }
        }
        userController = createUserConroller({ UserService });
    })


    describe("read", () => {
        const next = (error) => {
            throw error;
        }

        it("should return 200", async () => {
            const req = { params: { userId: "dfjasfjasdlfaslfjasjf" } };
            const res = await userController.read(req, undefined, next);
            expect(res).to.includes.keys("status", "body");
            expect(res.body).to.includes.keys("data");
            expect(res.status).to.equal(200);
        })

        it("should return 400", async () => {
            const payload = [
                { params: { userId: "ldfjasldfjlasdjfsa" } },
                { params: {} },
                { params: 0 },
                { params: null },
                {},
                null,
                0
            ]

            for (let req of payload) {
                try {
                    const res = await userController.read(req, undefined, next);
                    expect(res.status).to.equal(200);
                } catch (error) {
                    expect(error.status).to.equal(400)
                }
            }
        })
    })

    describe("update", () => {
        const next = (err) => {
            throw err;
        }

        it("should return 200", async () => {
            const req =
            {
                body: { username: "toklas495", full_name: "Nimesh thakur", email: "nimesh@gmail.com", bio: "i never go back on my words" },
                session: { user_id: "sfdfasdfkjlasdfajsdfajdsfjasf" }
            };
            const res = await userController.update(req, undefined, next);
            expect(res).to.includes.keys("status", "body");
            expect(res.body).to.includes.keys("message");
            expect(res.status).to.equal(200)
        })

        it("should return 400", async () => {
            const payload = [
                { body: {}, session: {} },
                { body: 0, session: 0 },
                0,
                null
            ]

            for (let req of payload) {
                try {
                    const res = await userController.update(req, undefined, next);
                    expect(res.status).to.equal(200);
                } catch (error) {
                    expect(error.status).to.equal(400)
                }
            }
        })
    })


    describe("update password", () => {
        const next = (error) => {
            throw error;
        }

        it("should return 200", async () => {
            const req = { session: { user_id: "dfjaslfjasdf" }, body: { password: "sdfasdfasf" } };
            const res = await userController.updatePassword(req, undefined, next);
            expect(res).to.includes.keys("status", "body");
            expect(res.body).to.includes.keys("message");
            expect(res.status).to.equal(200);
        })


        it("should return 400", async () => {
            const payload = [
                { session: { user_id: "fjasfjlsaf" }, body: { password: "dfjasfjas" } },
                { session: {}, body: {} },
                {},
                0,
                null,
                { session: null, body: null }
            ]

            for (let req of payload) {
                try {
                    const res = await userController.updatePassword(req, undefined, next);
                    expect(res.status).to.equal(200);
                } catch (error) {
                    expect(error.status).to.equal(400)
                }
            }
        })
    })
})