import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import fs from 'fs';
import { getConfig } from '../src/app-config';
const config = getConfig();
const pkgDef = protoLoader.loadSync(config.proto.root_dir+config.proto.contracts.test);
const proto = grpc.loadPackageDefinition(pkgDef) as any;

const rootCert = fs.readFileSync(config.root_ca_pem);
// console.log(`${config.host}:${config.port}`)
const client = new proto.hello.HelloService(
    `${config.host}:${3000}`,
    grpc.credentials.createSsl(rootCert)
); 

client.Hello({ number: 5 }, (err: any, response: any) => {
    // console.log(err);
    // console.log(response);
});
