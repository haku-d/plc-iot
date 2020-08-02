FROM node:lts-alpine

MAINTAINER thanhdang <thanh@clgt.vn>

WORKDIR /src

# install and cache package.json
COPY package.json /src
RUN npm install --production

# Bundle app source
COPY . /src

CMD ["node","index.js"]
