import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import passport, { Profile } from 'passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { getConfig } from '../src/app-config';
import fs from 'fs'
import path from 'path';
import cookieParser from 'cookie-parser';

const config = getConfig()
const pkgDef = protoLoader.loadSync(config.proto.root_dir + config.proto.contracts.auth);
const proto = grpc.loadPackageDefinition(pkgDef) as any;

const rootCert = fs.readFileSync(config.cert_local);

const grpcClient = new proto.auth.VerifyTokenService(
    `${config.host}:${config.port}`,
    grpc.credentials.createSsl(rootCert)
);

dotenv.config({ path: path.join(__dirname, "..", '/.env') })

const SaveToken = (token: string, callback: any) => {
    grpcClient.SaveToken({ id: token }, (err: any, response: any) => {
        callback(
            err ?? null,
            response ?? null
        )
    })
}
const RemoveToken = (token: string, callback: any) => {
    grpcClient.RemoveToken({ id: token }, (err: any, response: any) => {
        callback(
            err ?? null,
            response ?? null
        )
    })
}




const app = express()
app.use(cookieParser())
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());

// читает req.session.passport.user
// вызывает deserializeUser
// кладёт пользователя в req.user
// Без express-session он не работает
// app.use(passport.session());
passport.use(new Strategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: `https://${config.host}:${config.port}/auth-serv/google/callback`
        // callbackURL: "http://localhost:10000/google/callback"
    },
    (accesToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
        // console.log("отправка в бд инфы о пользователе")
        // console.log(profile)
        // const user: any = {}
        // user.displayName = profile.displayName;
        // user.email = profile.emails;
        // user.picture = profile.photos![0].value;


        return done(null, profile)
    }
))

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user as any))

app.use((req, res, next) => {
    console.log(req.sessionID)
    next();
});

app.get('/test_auth', (req, res) => {
    console.log("test_auth")
    res.send("auth")
})

// app.get("/login", (req, res) => {
//     res.send("<a href='/auth/google'>Login</a>")
// })

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"], prompt: "consent", accessType: "offline" })
)

app.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
    const user: any = req.user;
    const token = jwt.sign(
        user,
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
    );
    SaveToken(token, (err: any, response: any) => {
        console.log(err)
        console.log("\n\n\n\n\n")
        console.log(response)
        if (response) {
            res.cookie('jwt', token, {
                httpOnly: false,
                secure: true,
                sameSite: 'none',
                maxAge: 5 * 60 * 1000
            });
            res.redirect(`https://${config.host}:${config.port}/front-serv/home`);
        }
        else {
            res.redirect(`https://${config.host}:${config.port}/front-serv/error`);
        }
    })
})


app.get("/logout", (req, res) => {

    // res.redirect("/login")
    // console.log(`log out ${req.session.id}`)
    // req.logOut(() => {
    // res.clearCookie("jwt")
    // Cookies that have not been signed
    const token = req.cookies["jwt"]
    if (token) {
        // console.log(jwt)
        RemoveToken(token, (err: any, response: any) => {
            console.log(err)
            console.log("\n\n\n\n\n")
            console.log(response)
            if (response) {
                res.clearCookie("jwt")
                res.redirect(`https://${config.host}:${config.port}/front-serv/user-auth`);
            }
            else {
                res.redirect(`https://${config.host}:${config.port}/front-serv/error`);
            }
        })
    }
    else {
        res.sendStatus(401)
    }


    // req.session.destroy(() => console.log("Пользовтаель отключился"))
    // console.log(`log out ${req.session.id}`)

    // })
})

app.listen(10000, () => console.log("auth"))



// google auth + custom email/password => mongodb (или mssql)
// redis server с бэкапом в mongo db
// межссесийные действия mongodb
// socketio взаимодействие в redis через grpc
// auth сервер будет отдавать токены и на socket io проверка jwt токен -> redis -> mongodb