# express-async-api

Philosophy
 - explicit (routes, no middlewares)
 - simple
 - async - await -> you can return the result + throw an exception if something goes wrong
  
wanna replace with a simple server that only knows this and built on top of the native http lib

## Installation

```
npm i --save-dev express-async-api
```

## Usage

createApiServer

exposed _expressServer for testing (with supertest)

### apiServer.listen(port)

### apiServer.get(route, handler)

### apiServer.post(route, handler)

### apiServer.put(route, handler)

### apiServer.delete(route, handler)


## Upcoming features
 - custom error handlers for routes
 - redirects
 - logger
