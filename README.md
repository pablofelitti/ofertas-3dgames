# ofertas-3dgames

Lambda that checks for new posts in a specific thread in 3dgames for sales

## Installation

### To run locally with nodejs

`cd src`

`npm install`

`npm run start:local`

### To build and run the lambda locally:

`cd src`

`npm install --only=prod`

`sam build`

`sam local invoke`

## Deployment

`sam build`

`sam deploy`

## TODO list

- [ ] Speed up Lambda cold start by initializing stuff outside handler
- [ ] Reduce application logic by enhancing queries
