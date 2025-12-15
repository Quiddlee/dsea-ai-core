ARG NODE_VERSION=23

FROM node:${NODE_VERSION}-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /ai-core

COPY package.json .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

COPY . .

CMD ["pnpm", "start:dev"]
