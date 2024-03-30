import { expect } from 'chai';
import request from 'supertest';
import app from '../index'; // Assuming this is the path to your Express app

describe('Getting blogs', () => {
    let authToken: string;

    before(async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'Morris', password: 'Morris' });
        authToken = response.body.token;
    });

    it('should return status 200 for GET /api/blogs', async () => {
        const response = await request(app)
            .get('/api/blogs')
            .set('Authorization', `Bearer ${authToken}`);
        expect(response.status).to.equal(200);
    });

    // Add more test cases as needed
});
