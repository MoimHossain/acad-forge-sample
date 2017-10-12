FROM node:8.2.1-alpine

WORKDIR /app
ADD ./server.js /app
ADD ./package.json /app
ADD ./statics /app/statics/
ADD ./services /app/services/
ADD ./samples /app/samples/
ADD ./library /app/library/

RUN npm install -q

EXPOSE 8005

CMD ["npm","start"]
