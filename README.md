# Awsu

## Installation
```shell
npm i -g awsu-cli
```
## Usage
```shell
awsu exec -- aws s3 ls
```

## Functionalities

### dotenv integration
Variable expansion is working: https://www.npmjs.com/package/dotenv-expand

* `$KEY` will expand any env with the name KEY
* `${KEY}` will expand any env with the name KEY
* `\$KEY` will escape the $KEY rather than expand
* `${KEY:-default}` will first attempt to expand any env with the name KEY. If not one, then it will return default

## Running via npx

```shell
npx awsu-cli exec -p profile -r eu-west-1 -- aws s3 ls
```

## Running locally (development)

Clone the repo

```shell
npm run cli -- exec -p profile -r eu-west-1 -- aws s3 ls
```
