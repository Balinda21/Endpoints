import jwt from 'jsonwebtoken';
import UserModel from '../models/Users.js'; // Adjust the import path as per your project structure
import bcrypt from 'bcrypt';
// Function to authenticate user
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user by email
        const user = await UserModel.findOne({ email });
        // Check if user exists and password is correct
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Generate JWT token
        const secretOrPrivateKey = process.env.JWT_SECRET || "default_secret";
        const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, secretOrPrivateKey, { expiresIn: '1h' });
        // Send token and user information in response
        res.status(200).json({ token, user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'An error occurred during login' });
    }
};
//# sourceMappingURL=authController.js.map