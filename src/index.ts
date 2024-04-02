import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import isLoggedIn from './middeware/user.auth';
import UserModel from './models/Users';
import BlogModel from './models/blogs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import swaggerjsdoc from 'swagger-jsdoc';
import swaggerui from 'swagger-ui-express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import Joi from 'joi';
import ContactModel, { Contact as ContactModelInterface } from './models/contact'; 
import CommentModel from './models/comments';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://balinda21.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});


const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Todos API Documentation",
      version: "1.0.0",
      description: "This application consists of a basic todo API developed using Express and detailed using Swagger documentation",
      contact: {
        name: "Maurice Kwizera Balinda",
        email: "balindamoris@gmail.com"
      }
    },
    servers: [
      {
        url: "http://localhost:3000"
      }
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            name: {
              type: "string"
            },
            email: {
              type: "string"
            },
            password: {
              type: "string"
            }
          },
          required: ["name", "email", "password"]
        },
        BlogPost: {
          type: "object",
          properties: {
            picture: {
              type: "string"
            },
            title: {
              type: "string"
            },
            date: {
              type: "string",
              format: "date"
            },
            description: {
              type: "string"
            }
          },
          required: ["title", "description"]
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ["./dist/*.js"] // Adjusted path to match route handler files
};



mongoose.connect('mongodb+srv://balinda:Famillyy123@cluster0.8izzdgk.mongodb.net/Tasks')
  .then(() => {

    const spacs = swaggerjsdoc(options)
    app.use(
      '/endpoints-docs',
      swaggerui.serve,
      swaggerui.setup(spacs)

    )
    console.log('Connected to database');
  })
  .catch((error) => console.log(error));

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string }; 
    }
  }
}

interface Contact {
  name: string;
  email: string;
  subject: string;
  message: string;
}


app.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await UserModel.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


app.post('/users', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(200).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.name = name || user.name;
    user.email = email || user.email;
    user.password = hashedPassword || user.password;

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await UserModel.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticate user
 *     description: Login with email and password to receive a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 name:
 *                   type: string
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Failed to authenticate user
 */


// Define Joi schema for login fields
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid email address'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

app.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate request body against Joi schema
    const validationResult = loginSchema.validate(req.body);
    if (validationResult.error) {
      // If validation fails, return error response
      return res.status(400).json({ message: validationResult.error.details[0].message });
    }

    const { email, password } = req.body;
    console.log('Login attempt with email:', email); 
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('User found:', user); 

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "default_secret", { expiresIn: '1d' });
    
    // Assuming you have retrieved the user's name from the database after successful login
    const userName = user.name;

    // Set the JWT token cookie
    res.cookie('token', token, { httpOnly: true, maxAge: 86400000 });

    // Set the user_name cookie
    res.cookie('user_name', userName, { maxAge: 86400000 });

    // Send response
    res.status(200).json({ message: 'Logged in successfully', token, name: user.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to authenticate user' });
  }
});



/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout user
 *     description: Clear the authentication token stored in the client's browser cookies.
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       500:
 *         description: Server Error
 */


// Logout route
app.post('/logout', (req: Request, res: Response) => {
  try {
    // Clear the token cookie by setting it to an empty value and expiring it
    res.clearCookie('token');

    // Send a response indicating successful logout
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with name, email, and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server Error
 */
// Define Joi schema for registration fields
const registerSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid email address'
  }),
  password: Joi.string().required().pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$'))
    .messages({
      'any.required': 'Password is required',
      'string.pattern.base': 'Password must contain at least one letter, one number, and be at least 8 characters long'
    })
});
// register router
app.post('/register', async (req: Request, res: Response) => {
  try {
    // Validate request body against Joi schema
    const validationResult = registerSchema.validate(req.body);
    if (validationResult.error) {
      // If validation fails, return error response
      return res.status(400).json({ message: validationResult.error.details[0].message });
    }

    // If validation passes, continue processing the registration
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(200).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


/**
 * @swagger
 * 
 * /api/blogs:
 *   post:
 *     summary: Create a new blog post
 *     description: Create a new blog post with the specified details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               picture:
 *                 type: string
 *               title:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *             required:
 *               - title
 *               - description
 *     responses:
 *       '201':
 *         description: The created blog post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 blog:
 *                   $ref: '#/components/schemas/BlogPost'
 */


// Define route to add a new blog
app.post('/api/blogs', async (req: Request, res: Response) => {
  try {
      
      const { picture, title, date, description } = req.body;

     
      const newBlog = new BlogModel({
          picture,
          title,
          date,
          description
      });

      
      await newBlog.save();

      // Send response
      res.status(201).json({ message: 'Blog added successfully', blog: newBlog });
  } catch (error) {
      // Handle errors
      console.error('Error adding blog:', error);
      res.status(500).json({ message: 'Server error' });
  }
});
/**
 * @swagger
 * 
 * /api/get/blogs:
 *   get:
 *     summary: Get all blog posts
 *     description: Retrieve a list of all blog posts.
 *     responses:
 *       '200':
 *         description: A list of blog posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BlogPost'
 */

// Define route to get all blogs
app.get('/api/get/blogs', async (_req: Request, res: Response) => {
  try {
    const blogs = await BlogModel.find();
    res.status(200).json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @swagger
 * 
 * /api/blogs/{id}:
 *   put:
 *     summary: Update a blog post
 *     description: Update the details of a blog post by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog post to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               picture:
 *                 type: string
 *               title:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *             required:
 *               - title
 *               - description
 *     responses:
 *       '200':
 *         description: The updated blog post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 blog:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     picture:
 *                       type: string
 *                     title:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date
 *                     description:
 *                       type: string
 *               required:
 *                 - message
 *                 - blog
 */


app.put('/api/blogs/edit/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { picture, title, date, description } = req.body;

    // Find the blog by id
    const blog = await BlogModel.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Update the blog fields
    if (picture) blog.picture = picture;
    if (title) blog.title = title;
    if (date) blog.date = date;
    if (description) blog.description = description;

    // Save the updated blog
    await blog.save();

    // Send response
    res.json({ message: 'Blog updated successfully', blog });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


/**
 * @swagger
 * 
 * /api/blogs/{id}:
 *   delete:
 *     summary: Delete a blog post
 *     description: Delete a blog post by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog post to delete
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Blog post deleted successfully
 */

// Define route to delete a blog by ID
app.delete('/api/blogs/delete/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedBlog = await BlogModel.findByIdAndDelete(id);
    if (!deletedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


/**
 * @swagger
 * /submit-contact-form:
 *   post:
 *     summary: Submit contact form
 *     description: Submit a contact form with name, email, subject, and message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - message
 *     responses:
 *       200:
 *         description: Contact form submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 Contact:
 *                   $ref: '#/components/schemas/Contact'
 *       500:
 *         description: Server Error
 */

//  Joi schema for contact form fields
const contactSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid email address'
  }),
  subject: Joi.string().required().messages({
    'any.required': 'Subject is required'
  }),
  message: Joi.string().required().messages({
    'any.required': 'Message is required'
  })
});


app.post('/submit-contact-form', async (req: Request, res: Response) => {
  try {
    // Validate request body against Joi schema
    const { error } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Extract form data validated request body
    const { name, email, subject, message } = req.body;

    // Create a new contact document
    const newContact = new ContactModel({
      name,
      email,
      subject,
      message
    });

    try {
      await newContact.save();
      res.status(200).json({ message: 'Contact form submitted successfully', Contact: newContact });
    } catch (error) {
      console.error('Error saving contact:', error);
      res.status(500).json({ message: 'Failed to submit contact form' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Add a new comment
 *     description: Add a new comment to a post.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *             required:
 *               - text
 *     responses:
 *       '201':
 *         description: New comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *       '500':
 *         description: Server error
 *
 * /api/get/comments/:
 *   get:
 *     summary: Get comments for a post
 *     description: Retrieve all comments for a specific post.
 *     parameters:
 *       - in: path
 *         required: true
 *         description: ID of the post to retrieve comments for
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: List of comments for the specified post
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       '500':
 *         description: Server error
 *
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         text:
 *           type: string
 *       required:
 *         - text
 */


// Define endpoint to add a new comment
// Define endpoint to add a new comment
app.post('/api/comments', isLoggedIn, async  (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    // Create a new comment document
    const newComment = new CommentModel({ text });

    // Save the new comment to the database
    await newComment.save();

    // Send response
    res.status(201).json({ message: 'Comment added successfully', comment: newComment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Define endpoint to get all comments for a specific post
app.get('/api/get/comments/', async (req: Request, res: Response) => {
  try {

    // Find all comments for the specified post
    const comments = await CommentModel.find({ });
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


export default app;
