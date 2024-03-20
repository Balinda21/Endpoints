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
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("./index"));
const node_test_1 = require("node:test");
(0, node_test_1.describe)('GET /', () => {
    test('should return an array of todos', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default).get('/');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    }));
});
(0, node_test_1.describe)('POST /', () => {
    (0, node_test_1.describe)('given a heading and status', () => {
        test('should respond with the status of 200', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.default).post('/').send({
                heading: "learn typescript",
                status: true
            });
            expect(response.statusCode).toBe(200);
        }));
        test('should send json in the content type header', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.default).post('/').send({
                heading: "learn typescript",
                status: true
            });
            expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
        }));
    });
    (0, node_test_1.describe)('when the heading and status is missing', () => {
        test('should respond with a status code of 400', () => __awaiter(void 0, void 0, void 0, function* () {
            const bodyData = [
                { heading: 'heading' },
                { status: true },
                {}
            ];
            for (const body of bodyData) {
                const response = yield (0, supertest_1.default)(index_1.default).post('/').send(body);
                expect(response.statusCode).toBe(400);
            }
        }));
    });
});
// users
(0, node_test_1.describe)('GET /users', () => {
    test('should return an array of users', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default).get('/users');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    }));
});
(0, node_test_1.describe)('POST /users', () => {
    (0, node_test_1.describe)('given a name, email, location, password', () => {
        test('should respond with the status of 200', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.default).post('/users').send({
                name: "balinda",
                email: "balindamoris@gmail.com",
                location: "kicukiro",
                password: "balinda"
            });
            expect(response.statusCode).toBe(200);
        }));
        test('should send json in the content type header', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.default).post('/users').send({
                name: "balinda",
                email: "balindamoris@gmail.com",
                location: "kicukiro",
                password: "balinda"
            });
            expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
        }));
    });
    (0, node_test_1.describe)('when the name, email, location, password is missing', () => {
        test('should respond with a status code of 400', () => __awaiter(void 0, void 0, void 0, function* () {
            const bodyData = [
                { name: 'balinda' },
                { email: "balindamoris@gmail.com" },
                { location: "kicukiro" },
                { password: "balinda" },
                {}
            ];
            for (const body of bodyData) {
                const response = yield (0, supertest_1.default)(index_1.default).post('/users').send(body);
                expect(response.statusCode).toBe(400);
            }
        }));
    });
});
