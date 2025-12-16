# 🦋 DSEA AI Core

DSEA AI Core is the central AI service of the DSEA system.

# Getting Started 🚀
To run the project locally, you would have to download zip file with the repository or clone it to your computer. ✨

## Setup and Running ⚠️

What things do you need to do in order to run our project locally?

* Installed [PNPM](https://pnpm.io/)
* Installed [.git](https://git-scm.com/) on your computer.
* Code Editor of your choice.

## Installation And Preparation 🔮

1. Make sure you have all the things listed in the previous section. Then clone our repository to your computer:

```
git clone https://github.com/Quiddlee/dsea-ai-core.git
```

2. Navigate into project root and create a local environment file:

``` bash
cp .env.example .env
```

3. Edit `.env` and fill in required values:
* PostgreSQL credentials
* OpenAI API key
* Internal Token

You can find ```.env.example``` as an example file in the project root.

4. Navigate into project folder and run:

```
pnpm install
```

## Available Scripts 🥑

Here you can find all the scripts that are available in the project.

Start the app in `dev` mode:

### Development

```
pnpm start:dev
```

Start the app normally:

```
pnpm start
```

Start the app in debug mode:

```
pnpm start:debug
```

### Build & Production

Build the project:

```
pnpm build
```

Run the production build:

```
pnpm start:prod
```

### Code Quality

Format code with Prettier:

```
pnpm format
```

Lint and auto-fix issues:

```
pnpm lint
```

### Testing

Run unit tests:

```
pnpm test
```

Run unit tests in watch mode:

```
pnpm test:watch
```

Run tests with coverage report:

```
pnpm test:cov
```

Run tests in debug mode:

```
pnpm test:debug
```

Run end-to-end tests:

```
pnpm test:e2e
```

# ⚙️ Technology Stack

## 🦈 Developing
* 🦅 **Nest.js** - The Backend Framework
* 💖 **TypeScript** - The Language
* 🐳 **Docker** - The Containerization tool

## 🧹 Code Quality
* 🧪 **Jest** - The Test Runner
* 🫂 **Supertest** - The Testing Framework
* 🔔 **ESLint** — Air-bnb base - The Linter
* 👏 **Prettier** - The Code Formatter
* 😎 **EditorConfig** - The Code Style Enforcer
