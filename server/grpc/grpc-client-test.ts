import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import fs from 'fs'
import { getConfig } from '../src/app-config';
const pkgDef = protoLoader.loadSync(__dirname + '/grpc/test.proto');
const proto = grpc.loadPackageDefinition(pkgDef) as any;
const config = getConfig()
const rootCert = fs.readFileSync(config.cert_local);
console.log(`${config.host}:${config.port}`)
const client = new proto.hello.HelloService(
    `${config.host}:${config.port}`,
    grpc.credentials.createSsl(rootCert)
); 

client.Hello({ number: 5 }, (err: any, response: any) => {
    console.log(err);
    console.log(response);
});
