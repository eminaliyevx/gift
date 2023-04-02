FROM node:18-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /user/src/app

COPY . .
 
RUN npm install

RUN npm run build

COPY /apps/frontend/dist /user/src/app/apps/backend/public

EXPOSE 80

CMD ["npm", "start"]
