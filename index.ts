import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import TodoModel, { Todo } from './src/models/Todo';
import UserModel from './src/models/Users';
import isLoggedIn from './src/middeware/user.auth';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


const app = express();
app.use(express.json());

mongoose.connect('mongodb+srv://balinda:Famillyy123@cluster0.8izzdgk.mongodb.net/Tasks')
  .then(() => {
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
app.get('/', async (_req: Request, res: Response) => {
  try {
    const todos = await TodoModel.find();
    res.status(200).json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


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