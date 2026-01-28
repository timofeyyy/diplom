import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, "..", '/.env') })
const USER = process.env.USER_MONGO_DB
const PASSWORD = process.env.PASSWORD_MONGO_DB
const url = `mongodb://${USER}:${PASSWORD}@78.153.130.219:27017/`;
export const mongoClient = new MongoClient(url);
