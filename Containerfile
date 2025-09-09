FROM node:24-trixie-slim AS build
ENV DEBIAN_FRONTEND noninteractive
RUN apt -y update && apt install -y --no-install-recommends dumb-init bzip2

WORKDIR /app
ENV HUSKY=0

COPY package.json /app/package.json
COPY package-lock.json /app/

RUN npm install -g npm@latest
RUN npm ci --omit dev --no-audit

# RUN --mount=type=cache,target=/usr/src/app/.npm \
#   npm set cache /usr/src/app/.npm && \
#   npm ci --omit=dev


FROM node:24-trixie-slim
ENV NODE_ENV production
ENV DEBIAN_FRONTEND noninteractive
RUN apt -y update && apt install -y --no-install-recommends iputils-ping iproute2 curl
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init

USER node
WORKDIR /app


COPY --chown=node:node --from=build /app/node_modules /app/node_modules
COPY --chown=node:node ./static /app/static
COPY --chown=node:node ./srv /app/srv
COPY --chown=node:node ./build /app/build
COPY package*.json /app/

EXPOSE 2300

CMD ["dumb-init", "node", "--experimental-loader", "./srv/loader.js", "./srv/server.js"]
