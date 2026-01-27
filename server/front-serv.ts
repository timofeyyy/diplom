import express from 'express'
import { getConfig } from './src/app-config'
import path from 'path'
import proxy from 'express-http-proxy'

const config = getConfig()
const app = express()

app.use(express.static(config.dist_path))

app.get("/*path", (req, res) => {
    res.sendFile(path.join(config.dist_path, 'index.html'));
});

app.listen(4200, () => console.log("angular"))  