import request from 'supertest';
// import authRouter from "../../app/routes/Auth.routes.js"
import app from "../app.js"


describe("User tests", () => {
  const createUser = {
    email: `test-user-${Date.now()}@example.com`,
    password: "Testpassword@12341234",
    firstName: "Test",
    lastName: "User"
  };
  let user = {};

  // for maintaining cookies
  const agent = request.agent(app);

  beforeAll(async () => {
    const signupResponse = await agent.post('/auth/email/signup').send(createUser);

    if (signupResponse.statusCode !== 201) {
      throw new Error("Failed to create test user");
    }

    const signInResponse = await agent.post("/auth/email/login").send({
      email: createUser.email,
      password: createUser.password
    });

    if (signInResponse.statusCode !== 200) {
      throw new Error("Failed to login test user");
    }

    user = signInResponse.body.user;

    if (user.email !== createUser.email) {
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

  describe("GET /user?id=", () => {
    it("Should return authenticated user's data", async () => {
      const response = await agent.get(`/user?id=${user.id}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(user.id);
      expect(response.body.email).toBe(user.email);
    });

    it("Should return 403 if user not found or if user is not authenticated for that id", async () => {
      const response = await agent.get("/user?id=invalid-id");
      expect(response.statusCode).toBe(403);
    });

    it("should return 401 if not authenticated", async () => {
      const response = await request(app).get(`/user?id=${user.id}`);
      expect(response.statusCode).toBe(401);
    });
  });



})
