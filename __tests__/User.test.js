import request from 'supertest';
// import authRouter from "../../app/routes/Auth.routes.js"
import app from "../app.js"



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