# ofertas-3dgames

* Checks for new posts in a specific thread in 3dgames forum that contain potentially good deals 
and sends a notification to a Telegram group

Contents
========

* [Why?](#why)
* [Usage](#usage)
* [Deployment](#deployment)

### Why?

I needed a way to:
* Be notified of a post with a potential good deal as soon as 
* Avoid having to manually go through all the posts
* Save time to do other stuff :)

### Usage

#### To run local node (no lambda)

```
cd src
npm install
npm run start:local
```

#### To build and run the lambda in local:

```
cd src
npm install --only=prod
sam build
sam local invoke
```

### Deployment

> **Warning**
> This requires AWS access to deploy using SAM

```
sam build
sam deploy
```

## TODO list

- [ ] Speed up Lambda cold start by initializing stuff outside handler
- [ ] Reduce application logic by enhancing queries
