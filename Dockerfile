FROM node:lts AS dist
COPY package.json yarn.lock ./

# Force timeout when install dependencies
RUN yarn config set network-timeout 300000

RUN yarn install

COPY . ./

RUN yarn build:prod

FROM node:lts AS node_modules

ENV CHROMIUM_PATH /usr/bin/chromium

COPY package.json yarn.lock ./

# Force timeout when install dependencies
RUN yarn config set network-timeout 300000

RUN yarn install --prod

FROM node:slim

# === For Staging and PROD
# FROM --platform=linux/arm64 node:slim
ENV CHROMIUM_PATH /usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install chromium
RUN apt-get update && apt-get install curl gnupg -y \
  && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install chromium -y --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=dist dist /app/dist
COPY --from=node_modules node_modules /app/node_modules

COPY ./ /app/

CMD ["yarn", "start:prod"]
