"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const Todo_1 = __importDefault(require("./src/models/Todo"));
const Users_1 = __importDefault(require("./src/models/Users"));
const user_auth_1 = __importDefault(require("./src/middeware/user.auth"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
mongoose_1.default.connect('mongodb+srv://balinda:Famillyy123@cluster0.8izzdgk.mongodb.net/Tasks')
    .then(() => {
    console.log('Database connected successfully');
})
    .catch((error) => console.log(error));
// Todo routes
app.get('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todos = yield Todo_1.default.find();
        res.status(200).json(todos);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
// Apply isLoggedIn middleware to routes that require authentication
app.post('/', user_auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { heading, status } = req.body;
        if (!status || !heading) {
            return res.status(400).json({ message: 'Missing or invalid "status" field or "heading" field' });
        }
        const todo = new Todo_1.default({ heading, status });
        yield todo.save();
        res.status(200).json(todo);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
// update
app.put('/:id', user_auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { heading, status } = req.body;
        const todo = yield Todo_1.default.findById(id);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        todo.heading = heading || todo.heading;
        todo.status = status !== null && status !== void 0 ? status : todo.status;
        yield todo.save();
        res.json(todo);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
// delete
app.delete('/:id', user_auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield Todo_1.default.findByIdAndDelete(id);
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
// Users routes
app.get('/users', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield Users_1.default.find();
        res.status(200).json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
app.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new Users_1.default({ name, email, password: hashedPassword });
        yield newUser.save();
        res.status(200).json(newUser);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
app.put('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;
        const user = yield Users_1.default.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        user.name = name || user.name;
        user.email = email || user.email;
        user.password = hashedPassword || user.password;
        yield user.save();
        res.status(200).json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
app.delete('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield Users_1.default.findByIdAndDelete(id);
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
// Login route
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        console.log('Login attempt with email:', email); // Add this logging statement
        const user = yield Users_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        console.log('User found:', user); // Add this logging statement
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET || "default_secret", { expiresIn: '1d' });
        res.status(200).json({ message: 'Logged in successfully', token, name: user.name });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to authenticate user' });
    }
}));
// Register routenpm run 
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new Users_1.default({ name, email, password: hashedPassword });
        yield newUser.save();
        res.status(200).json(newUser);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
exports.default = app;
