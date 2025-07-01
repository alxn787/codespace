FROM node:20-alpine

WORKDIR /app/api

COPY app/api/ .

COPY app/code/ app/code/

RUN npm install

RUN npm run build

EXPOSE 5001

CMD ["npm", "run", "start"]