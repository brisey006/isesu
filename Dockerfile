FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm cache clean --force

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]