import express from 'express'
import { getConfig } from '../src/app-config'
import path from 'path'
import proxy from 'express-http-proxy'

const app = express()
app.get("/*path", (req, res) => {
    res.redirect(`http://localhost:4200${req.url}`)
});

app.listen(4201, () => // console.log("angular"))  