import { expect } from 'chai';
import request from 'supertest';
import app from '../index.js';
describe('Testing backend endpoints', () => {
    it('should return all blog posts', async () => {
        const resGetBlogs = await request(app).get('/api/get/blogs');
        expect(resGetBlogs.status).to.equal(200);
        expect(resGetBlogs.body).to.be.an('array');
    });
    it('should create, update, and delete a blog post', async () => {
        // Create a new blog post
        const newBlogData = {
            picture: 'https://example.com/image.jpg',
            title: 'New Blog Post',
            date: '2024-04-02',
            description: 'This is a new blog post.'
        };
        const resCreateBlog = await request(app)
            .post('/api/blogs')
            .send(newBlogData);
        expect(resCreateBlog.status).to.equal(201);
        expect(resCreateBlog.body).to.have.property('message', 'Blog added successfully');
        expect(resCreateBlog.body).to.have.property('blog');
        // Update the blog post
        const updatedBlogData = {
            title: 'Updated Blog Post',
            description: 'This is the updated blog post.'
        };
        const resUpdateBlog = await request(app)
            .put(`/api/blogs/edit/${resCreateBlog.body.blog._id}`)
            .send(updatedBlogData);
        expect(resUpdateBlog.status).to.equal(200);
        expect(resUpdateBlog.body).to.have.property('message', 'Blog updated successfully');
        expect(resUpdateBlog.body).to.have.property('blog');
        // Delete the blog post
        const resDeleteBlog = await request(app)
            .delete(`/api/blogs/delete/${resCreateBlog.body.blog._id}`);
        expect(resDeleteBlog.status).to.equal(204);
    });
    it('should submit a contact form', async () => {
        const contactFormData = {
            name: 'balinda maurice',
            email: 'balindamoris@gmail.com',
            subject: 'Test Subject',
            message: 'Test message'
        };
        const resSubmitContactForm = await request(app)
            .post('/submit-contact-form')
            .send(contactFormData);
        expect(resSubmitContactForm.status).to.equal(200);
        expect(resSubmitContactForm.body).to.have.property('message', 'Contact form submitted successfully');
        expect(resSubmitContactForm.body).to.have.property('Contact');
    });
    it('should authenticate a user', async () => {
        // Prepare login credentials
        const loginData = {
            email: 'balindamoris@gmail.com',
            password: 'maurice@123' // Replace with actual password
        };
        // Send login request
        const resLogin = await request(app)
            .post('/login')
            .send(loginData);
        // Assert the response
        expect(resLogin.status).to.equal(200);
        expect(resLogin.body).to.have.property('message', 'Logged in successfully');
        expect(resLogin.body).to.have.property('token');
        expect(resLogin.body).to.have.property('name');
    });
});
//# sourceMappingURL=test.js.map