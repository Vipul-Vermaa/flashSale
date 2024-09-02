import request from 'supertest';
import app from '../app.js'
import { User } from '../models/userModel.js'
import mongoose from 'mongoose';

describe('POST /login', () => {
  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a user to test login
    await User.create({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
    });
  });

  afterAll(async () => {
    // Clean up the test database
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('should login the user with correct credentials', async () => {
    const response = await request(app)
      .post('/api/v1/login')
      .send({ email: 'testuser@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Logged in Successfully');
  });

  it('should return an error if the email is incorrect', async () => {
    const response = await request(app)
      .post('/api/v1/login')
      .send({ email: 'wrongemail@example.com', password: 'password123' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Incorrect Email or Password');
  });

  it('should return an error if the password is incorrect', async () => {
    const response = await request(app)
      .post('/api/v1/login')
      .send({ email: 'testuser@example.com', password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Incorrect Email or Password');
  });

  it('should return an error if any field is missing', async () => {
    const response = await request(app)
      .post('/api/v1/login')
      .send({ email: 'testuser@example.com' }); // Missing password

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Enter all fields');
  });
});

