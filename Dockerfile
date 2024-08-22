FROM node:22-bullseye-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

WORKDIR /app
ENV HUSKY=0

COPY package-dependencies.json /app/package.json
COPY package-lock.json /app/
RUN npm ci --omit=dev --no-audit

# RUN --mount=type=cache,target=/usr/src/app/.npm \
#   npm set cache /usr/src/app/.npm && \
#   npm ci --omit=dev


FROM node:22-bullseye-slim
ENV NODE_ENV production
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
RUN apt-get update && apt-get install -y --no-install-recommends procps

USER node
WORKDIR /app


COPY --chown=node:node --from=build /app/node_modules /app/node_modules
COPY --chown=node:node ./static /app/static

COPY --chown=node:node ./srv /app/srv
COPY --chown=node:node ./build /app/build
COPY package*.json /app/

EXPOSE 2300

CMD ["dumb-init", "node", "--import", "./srv/register-hooks.js", "./srv/server.js"]
