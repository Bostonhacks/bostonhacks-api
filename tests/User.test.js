import request from 'supertest';
// import authRouter from "../../app/routes/Auth.routes.js"
import app from "../app.js"


describe("User tests", () => {
  const createUser = {
    email: `test-user-${Date.now()}@example.com`,
    password: "testpassword",
    name: "Test User"
  };
  let user = {};

  // for maintaining cookies
  const agent = request.agent(app);

  beforeAll(async () => {
    const signupResponse = await agent.post('/auth/signup/email').send(createUser);

    if (signupResponse.statusCode !== 201) {
      throw new Error("Failed to create test user");
    }

    const signInResponse = await agent.post("/auth/email/login").send({
      email: testUser.email,
      password: testUser.password
    });

    if (signInResponse.statusCode !== 200) {
      throw new Error("Failed to login test user");
    }

    userResponse = signInResponse.body.user;

    if (userResponse.email !== createUser.email) {
      throw new Error("Failed to get user data");
    }
  });

  describe("GET /user/me", () => {
    it("Should return authenticated user data", async () => {
      const response = await agent.get("/user/me");

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(user.id);
    });

    it("Should return 401 if not authenticated", async () => {
      const response = await request(app).get("/user/me");
      expect(response.statusCode).toBe(401);
    });
  })

  describe("GET /user/:id", () => {
    it("Should return authenticated user's data", async () => {
      const response = await agent.get(`/user/${user.id}`);
      expect(respons.e.statusCode).toBe(200);
      expect(response.body.id).toBe(user.id);
      expect(response.body.email).toBe(user.email);
    });

    it("Should return 404 if user not found", async () => {
      const response = await agent.get("/user/invalid-id");
      expect(response.statusCode).toBe(404);
    });

    it("should return 401 if not authenticated", async () => {
      const response = await request(app).get(`/user/${user.id}`);
      expect(response.statusCode).toBe(401);
    });
  });



})
