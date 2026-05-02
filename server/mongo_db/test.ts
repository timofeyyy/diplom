import { mongoClient } from "./connection";

mongoClient.connect().then(
    (client) => {
        // console.log("succeses");
        client.close().then(() => // console.log("closed"))
    }
)
.catch((err) => {
    // console.log(`err: ${err}`)
})