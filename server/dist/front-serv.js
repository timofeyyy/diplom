"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app_config_1 = require("./src/app-config");
const path_1 = __importDefault(require("path"));
const config = (0, app_config_1.getConfig)();
const app = (0, express_1.default)();
app.use(express_1.default.static(config.dist_path));
app.get("/*path", (req, res) => {
    res.sendFile(path_1.default.join(config.dist_path, 'index.html'));
});
app.listen(4200, () => console.log("angular"));
