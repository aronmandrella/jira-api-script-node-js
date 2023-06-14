# Jira CLI script - Detection of components without a component lead

## Installation

```sh
# Requires NodeJS 16.0.0+ and NPM 8.0.0+
npm ci
```

## Quick start

```sh
npm run everything
```

## Usage

```sh
npm run build
node dist/app.js --jira-base-url=https://herocoders.atlassian.net --jira-project-id=SP
```

## Example output:

```
Detecting Jira components without a component lead...

• Jira base url: https://herocoders.atlassian.net
• Jira project:  SP

Script detected 3 component(s) without a project lead:

[ID: 10130] Backend with 1 issue(s)
[ID: 10128] Synchronization with 2 issue(s)
[ID: 10131] Templates with 5 issue(s)
```

## Linting, testing, building, and running a demo

```sh
npm run prettier-check
npm run eslint-check
npm run tsc-check
npm run jest-check

# Or just
npm run everything
```

## Specification

✔️ Uses NodeJS

✔️ Uses Jira REST API efficiently

✔️ Has Jest tests
