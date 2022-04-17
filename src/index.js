import express from 'express'
import cors from 'cors'

function createRequestHandler (callback, onError) {
  return async (req, res) => {
    try {
      const result = await callback(req)

      res.status(result.status || 200).json(result)
    } catch (e) {
      onError(e, res)
    }
  }
}

export default function createApiServer (onError) {
  const expressServer = express()

  expressServer.use(cors())
  expressServer.use(express.json())

  function get (route, handlerPromise) {
    expressServer.get(route, createRequestHandler(handlerPromise, onError))
  }

  function post (route, handlerPromise) {
    expressServer.post(route, createRequestHandler(handlerPromise, onError))
  }

  function put (route, handlerPromise) {
    expressServer.put(route, createRequestHandler(handlerPromise, onError))
  }

  function del (route, handlerPromise) {
    expressServer.delete(route, createRequestHandler(handlerPromise, onError))
  }

  function listen (port) {
    return expressServer.listen(port)
  }

  return {
    _expressServer: expressServer, // published for testing purposes with supertest

    get,
    post,
    put,
    delete: del,

    listen
  }
}
