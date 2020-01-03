FROM node
MAINTAINER lukepark327@gmail.com

ADD . /VMO-backend
WORKDIR /VMO-backend

RUN npm install

CMD ["npm", "start"]
