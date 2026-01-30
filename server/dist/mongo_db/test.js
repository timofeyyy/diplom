"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("./connection");
connection_1.mongoClient.connect().then((client) => {
    console.log("succeses");
    client.close().then(() => console.log("closed"));
})
    .catch((err) => {
    console.log(`err: ${err}`);
});
