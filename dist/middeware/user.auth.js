import jwt from 'jsonwebtoken';
import UserModel from '../models/Users.js';
const isLoggedIn = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Assuming the token is in the format: Bearer <token>
        if (!token) {
            return res.status(401).json({ message: 'You need to login first' });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
        const user = await UserModel.findById(decodedToken.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = { userId: decodedToken.id };
        next();
    }
    catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Unauthorized' });
    }
};
export default isLoggedIn;
//# sourceMappingURL=user.auth.js.map