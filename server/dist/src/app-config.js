"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const getConfig = () => {
    let config;
    try {
        config = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, '..', 'appsettings.json'), { encoding: 'utf-8' }));
    }
    catch (_a) { }
    return config;
};
exports.getConfig = getConfig;
