"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoClient = void 0;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, "..", '/.env') });
const USER = process.env.USER_MONGO_DB;
const PASSWORD = process.env.PASSWORD_MONGO_DB;
const url = `mongodb://${USER}:${PASSWORD}@78.153.130.219:27017/`;
exports.mongoClient = new mongodb_1.MongoClient(url);
