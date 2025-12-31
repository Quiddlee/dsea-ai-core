ARG NODE_VERSION=23

FROM node:${NODE_VERSION}-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

RUN apk add --no-cache graphicsmagick imagemagick ghostscript

WORKDIR /ai-core

COPY package.json .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install && pnpm i -g @nestjs/cli

COPY . .

CMD ["pnpm", "start:dev"]
