FROM node:18-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /user/src/app

COPY . .
 
RUN npm install

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
