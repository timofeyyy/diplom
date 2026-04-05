import { Types } from "mongoose";

export type MongoWrapper<T> = (T & {
  _id: Types.ObjectId;
}) | null