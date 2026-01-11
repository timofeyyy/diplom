import path from 'path'
import fs from 'fs'

export const getConfig = (): any => {
    let config;
    try {
        config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'appsettings.json'), { encoding: 'utf-8' }))
    }
    catch {}
    return config
} 