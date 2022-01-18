FROM node:17.3.1-alpine3.15
EXPOSE 80
ENV PORT=80
WORKDIR /app
COPY . .

RUN npm install

CMD ["node", "src/main.js"]