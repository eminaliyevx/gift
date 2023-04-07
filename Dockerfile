FROM node:18-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /usr/src/app

COPY . .
 
RUN npm install

RUN npm run build

EXPOSE 80

CMD ["npm", "start"]
