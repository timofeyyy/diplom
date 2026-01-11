FROM node:20-alpine

WORKDIR /iosocket_dir

COPY package*.json ./

COPY tsconfig.json ./tsconfig.json

COPY localhost+3*.pem ./etc/

COPY appsettings.json ./appsettings.json

RUN npm install

COPY iosocket.ts ./iosocket.ts

COPY src/app-config.ts ./src/app-config.ts

EXPOSE 9000

CMD ["npx", "ts-node", "iosocket.ts"]