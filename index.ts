import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import TodoModel, { Todo } from './src/models/Todo';
import UserModel from './src/models/Users';
import isLoggedIn from './src/middeware/user.auth';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import swaggerjsdoc from 'swagger-jsdoc';
import swaggerui from 'swagger-ui-express';

dotenv.config();

const app = express();
app.use(express.json());

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Todos API Documentation",
      version: "1.0.0",
      description: "This is a simple todo API application made with Express and documented with Swagger.",
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
        Todo: {
          type: "object",
          properties: {
            heading: {
              type: "string"
            },
            status: {
              type: "boolean"
            }
          },
          required: ["heading", "status"]
        },
        Login: {
          type: "object",
          properties: {
            email: {
              type: "string"
            },
            password: {
              type: "string"
            }
          },
          required: ["email", "password"]
        },
        Register: {
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
      '/api-docs',
      swaggerui.serve,
      swaggerui.setup(spacs)

    )
    console.log('Database connected successfully');
  })
  .catch((error) => console.log(error));

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string }; 
    }
  }
}
// Todo routes

/**
 * @swagger
 * tags:
 *   name: Todos
 *   description: Todo management endpoints
 */

/**
  * @swagger
 * /:
 *   get:
 *     summary: Retrieve all todos
 *     description: Retrieve a list of all todos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 */


// Todo routes
app.get('/', async (_req: Request, res: Response) => {
  try {
    const todos = await TodoModel.find();
    res.status(200).json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new todo
 *     description: Create a new todo with the provided heading and status status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Todo'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The created todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 */



app.post('/', isLoggedIn, async (req: Request, res: Response) => {
  try {
    const { heading, status } = req.body;
    if (!status || !heading) {
      return res.status(400).json({ message: 'Missing or invalid "status" field or "heading" field' });
    }
    const todo = new TodoModel({ heading, status });
    await todo.save();
    res.status(200).json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


/**
 * @swagger
 * /{id}:
 *   put:
 *     summary: Update a todo
 *     description: Update the heading and/or status status of a todo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the todo to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Todo'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The updated todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 */
// update
app.put('/:id', isLoggedIn, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { heading, status } = req.body;

    const todo = await TodoModel.findById(id);

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    todo.heading = heading || todo.heading;
    todo.status = status ?? todo.status;
    await todo.save();

    res.json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete a todo
 *     description: Delete a todo by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the todo to delete
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Todo deleted successfully
 */

// delete

app.delete('/:id', isLoggedIn, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await TodoModel.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Users routes
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

// Login router

app.post('/login', async (req: Request, res: Response) => {
  try {
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

    res.status(200).json({ message: 'Logged in successfully', token, name: user.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to authenticate user' });
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

// register router
app.post('/register', async (req: Request, res: Response) => {
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


export default app;
