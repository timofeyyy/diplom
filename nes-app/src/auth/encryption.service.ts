import { Injectable } from "@nestjs/common"
import { createCipheriv, randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { createDecipheriv } from 'node:crypto';
import * as argon2 from 'argon2';

@Injectable()
export class EncryptionService {
    async hash(password: string) {
        return argon2.hash(password);
    }

    async verify(hash: string, password: string) {
        return argon2.verify(hash, password);
    }

    generate(length) {
        if (length < 2) {
            return ""
        }

        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const all = uppercase + lowercase + numbers;

        let result: string[] = [];

        result.push(uppercase[Math.floor(Math.random() * uppercase.length)]);
        result.push(numbers[Math.floor(Math.random() * numbers.length)]);

        for (let i = 2; i < length; i++) {
            result.push(all[Math.floor(Math.random() * all.length)]);
        }

        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }

        return result.join('');
    }
}