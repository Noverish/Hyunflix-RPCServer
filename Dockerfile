FROM node:10.16.3-alpine

RUN apk add --no-cache ffmpeg
RUN apk add --no-cache procps

# Install Python3
RUN apk add --no-cache python3 \
 && ln -s /usr/bin/python3 /usr/bin/python \
 && python3 -m ensurepip \
 && rm -r /usr/lib/python*/ensurepip \
 && pip3 install --no-cache --upgrade pip setuptools wheel

# Install youtube-dl
RUN apk add --no-cache curl
RUN curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/bin/youtube-dl \
 && chmod a+rx /usr/bin/youtube-dl

# Timezone
RUN apk add --no-cache tzdata
ENV TZ='Asia/Seoul'

WORKDIR /app

COPY node_modules  /app/node_modules
COPY src           /app/src
COPY ormconfig.js  /app
COPY package.json  /app
COPY tsconfig.json /app

ENV PORT 80

CMD ["npm", "run", "dev"]