import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { getConfig } from '../src/app-config';
const config = getConfig();
const pkgDef = protoLoader.loadSync(config.proto.root_dir+config.proto.contracts.test);
const proto = grpc.loadPackageDefinition(pkgDef) as any;

const server = new grpc.Server();

server.addService(proto.hello.HelloService.service, {
    Hello: (call: any, callback: any) => {
        const num = call.request.number;
	console.log("hello from client");
        callback(null, {
            result: num + 1
        });
    }
});

server.bindAsync(
    '0.0.0.0:12000',
    grpc.ServerCredentials.createInsecure(),
    () => {
        console.log('gRPC server started');
        server.start();
    }
);
