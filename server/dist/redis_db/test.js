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
const connection_1 = __importDefault(require("./connection"));
connection_1.default.connect()
    .then((client) => __awaiter(void 0, void 0, void 0, function* () {
    // let tokensStr = await client.get("tokens");
    yield client.set("test", 1);
    let test = yield client.get("test");
    // console.log(test);
    yield client.del("test");
    test = yield client.get("test");
    // console.log(test);
    // console.log(`TEST EXECUTED SUCCESESFULY: \n`);
}))
    .catch((err) => {
    // console.log(`CATCH ERR: \n${err}`);
});
