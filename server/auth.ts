import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import passport, { Profile } from 'passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const pkgDef = protoLoader.loadSync(__dirname + '/grpc/auth.proto');
const proto = grpc.loadPackageDefinition(pkgDef) as any;
const client = new proto.auth.VerifyTokenService(
    'localhost:12000',
    // sslCreds
    grpc.credentials.createInsecure()
);

dotenv.config({ path: __dirname + '/.env' })

const SaveToken = (token: string, callback: any) => {
    client.SaveToken({ id: token }, (err: any, response: any) => {
        // console.log(response)
        // console.log(err); 
        // console.log(response);
        callback(
            err ?? null,
            response ?? null
        )
    })
}




const app = express()
// const store = new session.MemoryStore();

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
app.use(passport.session());
passport.use(new Strategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: "https://localhost:3000/auth-serv/google/callback"
        // callbackURL: "http://localhost:10000/google/callback"
    },
    (accesToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
        console.log("отправка в бд инфы о пользователе")
        // console.log(profile)
        const user: any = {}
        user.displayName = profile.displayName;
        user.email = profile.emails;
        user.picture = profile.photos![0].value;


        return done(null, profile)
    }
))

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user as any))

app.use((req, res, next) => {
    console.log(req.sessionID)
    next();
});

function ensureAuth(req: any, res: any, next: any) {
    if (req.isAuthenticated()) return next();
    res.redirect('https://localhost:3000/user-auth');
}

app.get('/test_auth', ensureAuth, (req, res) => {
    console.log("test_auth")
    res.send("auth")
})

app.get("/login", (req, res) => {
    res.send("<a href='/auth/google'>Login</a>")
})

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"], prompt: "consent", accessType: "offline" })
)

app.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
    const user: any = req.user;
    console.log("callback")
    const token = jwt.sign(
        {
            sub: user.id,
            email: user.emails[0].value,
            jti: crypto.randomUUID()
        },
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
                // maxAge: 1000
                maxAge: 24 * 60 * 60 * 1000
            });
            // console.log(token)
            res.redirect('https://localhost:3000/home');
        }
        else {
            res.redirect('https://localhost:3000/error');
        }
    })
    // res.redirect("/login")
})


app.get("/logout", (req, res) => {
    console.log(`log out ${req.session.id}`)
    req.logOut(() => {
        req.session.destroy(() => console.log("Пользовтаель отключился"))
        console.log(`log out ${req.session.id}`)
        res.redirect("/login")
    })
})

app.listen(10000, () => console.log("auth"))



// google auth + custom email/password => mongodb (или mssql)
// redis server с бэкапом в mongo db
// межссесийные действия mongodb
// socketio взаимодействие в redis через grpc
// auth сервер будет отдавать токены и на socket io проверка jwt токен -> redis -> mongodb