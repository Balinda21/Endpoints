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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Users_1 = __importDefault(require("../models/Users"));
const isLoggedIn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]; // Assuming the token is in the format: Bearer <token>
        if (!token) {
            return res.status(401).json({ message: 'No authorization token found' });
        }
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "default_secret");
        const user = yield Users_1.default.findById(decodedToken.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = { userId: decodedToken.id }; // Attach user information to the request object
        next(); // Call next to move to the next middleware or route handler
    }
    catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Unauthorized' });
    }
});
exports.default = isLoggedIn;
