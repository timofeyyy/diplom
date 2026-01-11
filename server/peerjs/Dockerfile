FROM node:20-alpine

WORKDIR /peerjs_dir

COPY package*.json ./

COPY tsconfig.json ./tsconfig.json

COPY localhost+3*.pem ./etc/

COPY appsettings.json ./appsettings.json

RUN npm install

COPY peerjs.ts ./peerjs.ts

COPY src/app-config.ts ./src/app-config.ts

EXPOSE 8000

CMD ["npx", "ts-node", "peerjs.ts"]