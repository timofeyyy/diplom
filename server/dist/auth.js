"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const grpc = __importStar(require("@grpc/grpc-js"));
const protoLoader = __importStar(require("@grpc/proto-loader"));
const app_config_1 = require("./src/app-config");
const fs_1 = __importDefault(require("fs"));
const pkgDef = protoLoader.loadSync(__dirname + '/grpc/auth.proto');
const proto = grpc.loadPackageDefinition(pkgDef);
const config = (0, app_config_1.getConfig)();
const rootCert = fs_1.default.readFileSync(config.cert_local);
const grpcClient = new proto.auth.VerifyTokenService(`${config.host}:${config.port}`, grpc.credentials.createSsl(rootCert));
dotenv_1.default.config({ path: __dirname + '/.env' });
const SaveToken = (token, callback) => {
    grpcClient.SaveToken({ id: token }, (err, response) => {
        callback(err !== null && err !== void 0 ? err : null, response !== null && response !== void 0 ? response : null);
    });
};
const app = (0, express_1.default)();
app.use((0, express_session_1.default)({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport_1.default.initialize());
// читает req.session.passport.user
// вызывает deserializeUser
// кладёт пользователя в req.user
// Без express-session он не работает
// app.use(passport.session());
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `https://${config.host}:${config.port}/auth-serv/google/callback`
    // callbackURL: "http://localhost:10000/google/callback"
}, (accesToken, refreshToken, profile, done) => {
    // // console.log("отправка в бд инфы о пользователе")
    // // console.log(profile)
    // const user: any = {}
    // user.displayName = profile.displayName;
    // user.email = profile.emails;
    // user.picture = profile.photos![0].value;
    return done(null, profile);
}));
passport_1.default.serializeUser((user, done) => done(null, user));
passport_1.default.deserializeUser((user, done) => done(null, user));
app.use((req, res, next) => {
    // console.log(req.sessionID);
    next();
});
app.get('/test_auth', (req, res) => {
    // console.log("test_auth");
    res.send("auth");
});
// app.get("/login", (req, res) => {
//     res.send("<a href='/auth/google'>Login</a>")
// })
app.get("/auth/google", passport_1.default.authenticate("google", { scope: ["profile", "email"], prompt: "consent", accessType: "offline" }));
app.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
    const user = req.user;
    const token = jsonwebtoken_1.default.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
    SaveToken(token, (err, response) => {
        // console.log(err);
        // console.log("\n\n\n\n\n");
        // console.log(response);
        if (response) {
            res.cookie('jwt', token, {
                httpOnly: false,
                secure: true,
                sameSite: 'none',
                maxAge: 24 * 60 * 60 * 1000
            });
            res.redirect(`https://${config.host}:${config.port}/front-serv/home`);
        }
        else {
            res.redirect(`https://${config.host}:${config.port}/front-serv/error`);
        }
    });
});
app.get("/logout", (req, res) => {
    // res.redirect("/login")
    // // console.log(`log out ${req.session.id}`)
    // req.logOut(() => {
    res.clearCookie("jwt");
    // req.session.destroy(() => // console.log("Пользовтаель отключился"))
    // // console.log(`log out ${req.session.id}`)
    res.redirect("/user-auth");
    // })
});
app.listen(10000, () => // console.log("auth"));
// google auth + custom email/password => mongodb (или mssql)
// redis server с бэкапом в mongo db
// межссесийные действия mongodb
// socketio взаимодействие в redis через grpc
// auth сервер будет отдавать токены и на socket io проверка jwt токен -> redis -> mongodb
