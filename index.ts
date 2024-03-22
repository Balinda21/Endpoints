import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import TodoModel, { Todo } from './models/Todo';
import UserModel from './models/Users';


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
      user?: { userId: string }; // Define the shape of the user property
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

app.post('/', async (req: Request, res: Response) => {
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

app.put('/:id', async (req: Request, res: Response) => {
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

app.delete('/:id', async (req: Request, res: Response) => {
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
    const { name, email, location, password } = req.body;
    if (!name || !email || !location || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const newUser = new UserModel({ name, email, location, password });
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
    const { name, email, location, password } = req.body;

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.location = location || user.location;
    user.password = password || user.password;

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



app.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, location, password } = req.body;
    if (!name || !email || !location || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const newUser = new UserModel({ name, email, password, location });
    await newUser.save();
    res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default app;
