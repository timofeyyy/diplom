import { createCipheriv, randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

(async () => {
    const iv = randomBytes(16);
    const password = 'Password used to generate key';

    // The key length is dependent on the algorithm.
    // In this case for aes256, it is 32 bytes.
    const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
    // console.log(key)
    const cipher = createCipheriv('aes-256-ctr', key, iv);

    const textToEncrypt = 'Nest';
    const encryptedText = Buffer.concat([
        cipher.update(textToEncrypt),
        cipher.final(),
    ]);
})() 