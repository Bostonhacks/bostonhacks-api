import request from 'supertest';
// import authRouter from "../../app/routes/Auth.routes.js"
import app from "../app.js"
import jest from "jest"



// Mock the Auth controller
// jest.mock('../../app/controllers/Auth.controller.js', () => ({
//   googleAuth: jest.fn((req, res) => res.status(302).send('Redirecting to Google')),
//   createEmailUser: jest.fn(),
//   googleCallback: jest.fn()
// }));
describe("GET /", () => {



    it("Should redirect", async() => {
        const response = await request(app).get("/");

        expect(response.status).toBe(302);
    })



});

// describe('Auth Routes Integration Tests', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('GET /auth/google/login', () => {
//     it('should call googleAuth controller and redirect', async () => {
//       const response = await request(app).get('/auth/google/login');
      
//       expect(response.status).toBe(302);
//       expect(AuthController.googleAuth).toHaveBeenCalled();
//     });
//   });

//   describe('GET /auth/google/callback', () => {
//     it('should call googleCallback controller with code parameter', async () => {
//       // Mock implementation for testing
//       AuthController.googleCallback.mockImplementation((req, res) => {
//         return res.status(200).json({
//           message: 'Successfully authenticated',
//           user: { id: '123', email: 'test@example.com' }
//         });
//       });

//       const response = await request(app)
//         .get('/auth/google/callback')
//         .query({ code: 'test-code' });
      
//       expect(response.status).toBe(200);
//       expect(AuthController.googleCallback).toHaveBeenCalled();
//       expect(response.body.message).toBe('Successfully authenticated');
//       expect(response.body.user).toBeDefined();
//     });

//     it('should call googleCallback controller with authorization header', async () => {
//       // Mock implementation for testing
//       AuthController.googleCallback.mockImplementation((req, res) => {
//         return res.status(200).json({
//           message: 'Successfully authenticated',
//           user: { id: '123', email: 'test@example.com' }
//         });
//       });

//       const response = await request(app)
//         .get('/auth/google/callback')
//         .set('Authorization', 'Bearer test-token');
      
//       expect(response.status).toBe(200);
//       expect(AuthController.googleCallback).toHaveBeenCalled();
//       expect(response.body.message).toBe('Successfully authenticated');
//     });
//   });

//   describe('POST /auth/signup/email', () => {
//     it('should create a new user with valid email and password', async () => {
//       // Mock implementation for testing
//       AuthController.createEmailUser.mockImplementation((req, res) => {
//         if (!req.body.email || !req.body.password) {
//           return res.status(400).json({ error: 'Missing required fields' });
//         }
//         return res.status(201).json({
//           message: 'User created successfully',
//           user: { id: '123', email: req.body.email }
//         });
//       });

//       const userData = {
//         email: 'newuser@example.com',
//         password: 'securePassword123'
//       };

//       const response = await request(app)
//         .post('/auth/signup/email')
//         .send(userData);
      
//       expect(response.status).toBe(201);
//       expect(AuthController.createEmailUser).toHaveBeenCalled();
//       expect(response.body.message).toBe('User created successfully');
//       expect(response.body.user.email).toBe(userData.email);
//     });

//     it('should return 400 for invalid user data', async () => {
//       // Mock implementation for testing
//       AuthController.createEmailUser.mockImplementation((req, res) => {
//         if (!req.body.email || !req.body.password) {
//           return res.status(400).json({ error: 'Missing required fields' });
//         }
//         return res.status(201).json({
//           message: 'User created successfully',
//           user: { id: '123', email: req.body.email }
//         });
//       });

//       const invalidUserData = {
//         email: 'incomplete@example.com'
//         // Missing password
//       };

//       const response = await request(app)
//         .post('/auth/signup/email')
//         .send(invalidUserData);
      
//       expect(response.status).toBe(400);
//       expect(AuthController.createEmailUser).toHaveBeenCalled();
//       expect(response.body.error).toBe('Missing required fields');
//     });
//   });
// });