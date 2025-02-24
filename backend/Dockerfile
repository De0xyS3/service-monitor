# Usa una imagen base de Node.js
FROM node:18-alpine
RUN apk add --no-cache curl htop
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]

