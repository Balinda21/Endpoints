import request from 'supertest';
import app from '../index';
import { describe } from 'node:test';

describe('GET /', () => {
  test('should return an array of todos', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('POST /', () => {
   describe('given a heading and status',() => {
     test('should respond with the status of 200', async() => {
      const response = await request(app).post('/').send({
        heading: "learn typescript",
        status: true
      })
      expect(response.statusCode).toBe(200)
     })

     test('should send json in the content type header', async() => {
      const response = await request(app).post('/').send({
        heading: "learn typescript",
        status: true
      })
      expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
     })
   });

   describe('when the heading and status is missing', () => {
    test('should respond with a status code of 400', async() => {
      const bodyData = [
        {heading: 'heading'},
        {status: true},
        {}
      ]

       for(const body of bodyData) {
        const response = await request(app).post('/').send(body)
        expect(response.statusCode).toBe(400)
       }
    })

   })

   
});




// users

describe('GET /users', () => {
  test('should return an array of users', async () => {
    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('POST /users', () => {
   describe('given a name, email, location, password',() => {
     test('should respond with the status of 200', async() => {
      const response = await request(app).post('/users').send({
        name: "balinda",
        email: "balindamoris@gmail.com",
        location : "kicukiro",
        password: "balinda"

      })
      expect(response.statusCode).toBe(200)
     })

     test('should send json in the content type header', async() => {
      const response = await request(app).post('/users').send({
        name: "balinda",
        email: "balindamoris@gmail.com",
        location : "kicukiro",
        password: "balinda"
      })
      expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
     })
   });

   describe('when the name, email, location, password is missing', () => {
    test('should respond with a status code of 400', async() => {
      const bodyData = [
        {name: 'balinda'},
        {email: "balindamoris@gmail.com"},
        {location: "kicukiro"},
        {password: "balinda"},
        {}
      ]

       for(const body of bodyData) {
        const response = await request(app).post('/users').send(body)
        expect(response.statusCode).toBe(400)
       }
    })

   })

   
});
