import request from 'supertest';
import app from "../app.js";

describe("Auth Routes Tests", () => {
  // Test user credentials that we'll use across tests
  const testUser = {
    email: `test-user-${Date.now()}@example.com`,
    password: 'SecurePass123!',
    name: 'Test User'
  };

  // Token storage for tests that need authentication
  let accessToken;

  describe("GET /", () => {
    it("Should redirect to /docs", async () => {
      const response = await request(app).get("/");
      expect(response.redirect).toBe(true);
    });
  });

  describe("GET /auth/google/login", () => {
    it("should redirect to Google OAuth page", async () => {
      const response = await request(app).get('/auth/google/login');

      expect(response.statusCode).toBe(302); // Redirect status code
      expect(response.headers.location).toBeDefined();
      // Google OAuth URLs typically contain these elements
      const locationHeader = response.headers.location.toLowerCase();
      expect(locationHeader.includes('accounts.google.com') ||
        locationHeader.includes('oauth') ||
        locationHeader.includes('auth')).toBe(true);
    });
  });

  describe("POST /auth/signup/email", () => {
    it("should create a new user with valid email and password", async () => {
      const response = await request(app)
        .post('/auth/signup/email')
        .send(testUser);

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);


    });

    it("should return error for duplicate email", async () => {
      // Try to create the same user again
      const response = await request(app)
        .post('/auth/signup/email')
        .send(testUser);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it("should return error for invalid email format", async () => {
      const invalidData = {
        ...testUser,
        email: 'invalid-email-format'
      };

      const response = await request(app)
        .post('/auth/signup/email')
        .send(invalidData);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return error for missing password", async () => {
      const invalidData = {
        email: `missing-password-${Date.now()}@example.com`,
        name: 'Test User'
      };

      const response = await request(app)
        .post('/auth/signup/email')
        .send(invalidData);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return error for password too short", async () => {
      const invalidData = {
        email: `short-password-${Date.now()}@example.com`,
        password: '123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/auth/signup/email')
        .send(invalidData);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });


  describe("POST /auth/login", () => {
    it("should login user with valid credentials", async () => {
      // Create a new agent for login
      // const loginAgent = request.agent(app);

      const response = await request(app)
        .post('/auth/email/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);

      // Check that the access_token cookie is set
      const cookies = response.headers['set-cookie'] || [];
      expect(cookies.some(cookie => cookie.includes('access_token'))).toBe(true);

      // get access token to use for future
      accessToken = cookies.find(cookie => cookie.startsWith('access_token')).split(';')[0].split('=')[1];


    });

    it("should reject login with incorrect password", async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');

      // Check that no auth cookie is set
      const cookies = response.headers['set-cookie'] || [];
      expect(cookies.some(cookie => cookie.includes('access_token'))).toBe(false);
    });

    it("should reject login with non-existent email", async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: `nonexistent-${Date.now()}@example.com`,
          password: 'SomePassword123!'
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should validate email format", async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalid-email-format',
          password: 'SomePassword123!'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });


  describe("POST /auth/logout", () => {
    it("should successfully logout user and clear cookie", async () => {
      // First login
      const logoutAgent = request.agent(app);

      // Login first to get cookie
      await logoutAgent
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      // Now logout
      const response = await logoutAgent
        .post('/auth/logout');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out');

      // Check that the cookie is cleared or marked for expiration
      const cookies = response.headers['set-cookie'] || [];
      const hasExpiredCookie = cookies.some(cookie => {
        return cookie.includes('access_token') &&
          (cookie.includes('Max-Age=0') || cookie.includes('Expires=Thu, 01 Jan 1970'));
      });

      expect(hasExpiredCookie).toBe(true);

      // Verify we're actually logged out by trying to access protected route
      const verifyResponse = await logoutAgent.get('/auth/verify');

      const getMeResponse = await logoutAgent.get("/user/me");
      expect(getMeResponse.statusCode).toBe(401);
    });

    it("should handle logout for already logged out user", async () => {
      // Using a fresh request without auth
      const response = await request(app)
        .post('/auth/logout');

      // This should either return 401 (unauthorized) or 200 (already logged out)
      expect([200, 401]).toContain(response.statusCode);
    });
  });

  // Tests for protected routes
  describe("Protected Routes", () => {
    it("should access protected routes when authenticated", async () => {
      // Use agent that's logged in from signup
      const response = await agent
        .get('/api/users/profile');

      expect(response.statusCode).toBe(200);
    });

    it("should deny access to protected routes when not authenticated", async () => {
      // Use a fresh request without auth cookies
      const response = await request(app)
        .get('/api/users/profile');  // Replace with your actual protected route

      expect(response.statusCode).toBe(401);
    });
  });
});

