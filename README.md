# express-async-api

A minimalistic wrapper around express, limiting the available feature set to write explicit, JSON-only APIs.

Explicity is the key, that is why routers and middlewares are not available through this wrapper lib.
 - You will have to explicitly define your routes so you will know exactly what route params are available
 - Instead of middlewares, you will have to explicitly call functions in the handler function, so you will exactly know what happens

Besides that, a fundamental assumption is that your route handlers will be asynchronous. If you use `async` and `await`, it enables you to simply return the result you want to send back to the client, and you can throw an exception if something went wrong, and that will be handled on a separate error handler.

I built this wrapper, because recently I only use these features of express. Later on, I am going to write a lib with the same interface, that does not depend on express, but on the native http lib of Node.js. Since the interface will be the same, it will be easy to swap this lib with the new one that has no dependencies.

## Installation

```
npm i --save-dev express-async-api
```

## Usage

```javascript
import createApiServer from 'express-async-api'

import routes from './routes/index.js'

...

function errorHandler(e) {
  // the thrown error will be passed to this function
  // based on the error, you should construct and return the output
  return {
    status: 500,
    error: {
      name: e.name,
      message: e.message
    }
  }
}

function loggerCb(req, res) {
  // it gets express' req and res as params, so you can log everything whereever you want.
  // you can even aggregate your logs in a separate service
}

const apiServer = createApiServer(errorHandler, loggerCb)

routes(apiServer) // this function should append the route handlers to your server

apiServer.listen(port)

```
The underlying [express](https://www.npmjs.com/package/express) server is exposed on the `apiServer._expressServer` property, for testing purposes. See some [examples for testing](https://github.com/gyulanemeth/express-async-api/blob/master/src/index.test.js) in this very repository.

### apiServer.listen(port)

Starts listening on the given port.

### apiServer.get(route, handler)

```javascript
apiServer.get('/v1/group/:groupId/user/:id', async req => {
  // these functions have access to the original express req object
  const response = await fetchGroupUser(req.params.groupId, req.params.id) // if the promise is rejected (and you don't handle it locally), then the global errorHandler will be invoked

  return {
    status: 200, // you can control the status code of the response by this field
    result: {
      ...response
    }
  }
})
```

### apiServer.post(route, handler)

```javascript
apiServer.post('/your/:route/is/here', async req => {
  return {
    status: 201,
    result: { ... }
  }
})
```

### apiServer.postBinary(route, settings, handler)

The `settings` object must conftain the following properties:
 - fieldName (string): the name of the input field from which the server ready the binary data. (The name of the form field on the frontend that holds the binary.)
 - mimeTypes (array of strings): containing the allowed mime types. If the uploaded file's mime type is not in the array, then a `ValidationError` will be thrown from the [standard-api-errors](https://github.com/gyulanemeth/standard-api-errors/blob/master/src/index.js) lib, which translates to a HTTP 400 respones.
- maxFileSize (optional, number): the maximum file size limit in bytes. 

The `maxFileSize` property is optional and specifies the maximum file size allowed for upload. If not provided, there is no size limit imposed on the uploaded file

```javascript
const settings = {
  fieldName: 'avatar',
  mimeTypes: ['image/png', 'image/jpeg', 'image/gif']
}

apiServer.post('/your/:route/is/here', settings, async req => {
  return {
    status: 201,
    result: { ... }
  }
})
```

### apiServer.put(route, handler)

```javascript
apiServer.put('/your/:route/is/here', async req => {
  return {
    status: 200,
    result: { ... }
  }
})
```

### apiServer.patch(route, handler)

```javascript
apiServer.patch('/your/:route/is/here', async req => {
  return {
    status: 200,
    result: { ... }
  }
})
```

### apiServer.delete(route, handler)

```javascript
apiServer.delete('/your/:route/is/here', async req => {
  return {
    status: 201,
    result: { ... }
  }
})
```

## Redirects

You can also redirect in your handlers.

```javascript
async function handler(req) {
  ...
  return {
    status: 302,
    redirect: 'https://example.com'
  }
}
```

## Binary response
If you want to respond with binary data.

```javascript
async function handler(req) {
  ...
  return {
    binary: <Node JS Buffer ...>
  }
}
```

## Errors & Logging

If you take a look at the first example, you can see, that the `createApiServer` function has two parameters. The first is an error handler callback, the second is a callback for logging.

The error handler callback gets the thrown error as an argument, based on which, you can put together the final output that your server produces. You **must** implement the error handler function.

The log callback is optional. It recieves the original express req and res objects, which contains everything about the request and the response. You can aggreagate these in a log service, or just simply console.log something.


## Upcoming features
 - custom error handlers for routes
 - execution time -> log function
