import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
// import fs from 'fs'
// import { getConfig } from './src/app-config';
const pkgDef = protoLoader.loadSync(__dirname + '/grpc/test.proto');
const proto = grpc.loadPackageDefinition(pkgDef) as any;

const server = new grpc.Server();
// const config = getConfig()

server.addService(proto.hello.HelloService.service, {
    Hello: (call: any, callback: any) => {
        const num = call.request.number;

        callback(null, {
            result: num + 1
        });
    }
});

// const server = https.createServer({
//     key: fs.readFileSync(config.key, 'utf-8'),
//     cert: fs.readFileSync(config.cert, 'utf-8'),
// }, app);

// const serverCredentials = grpc.ServerCredentials.createSsl(
//     null,
//     [{ cert_chain: fs.readFileSync(config.cert_local), private_key: fs.readFileSync(config.key_local) }], 
//     true
// );


server.bindAsync(
    '0.0.0.0:12000',
    grpc.ServerCredentials.createInsecure(),
    // serverCredentials,
    () => {
        console.log('gRPC server started');
        server.start();
    }
);
