import express from 'express'
import cors from 'cors'

function createRequestHandler (callback, onError, log) {
  return async (req, res) => {
    try {
      const result = await callback(req)

      if (result.redirect) {
        return res.redirect(result.status || 302, result.redirect)
      }

      res.status(result.status || 200).json(result)
    } catch (e) {
      const err = onError(e)

      res.status(err.status || 500).json(err)
    }

    if (typeof log === 'function') {
      log(req, res)
    }
  }
}

export default function createApiServer (onError) {
  const expressServer = express()

  expressServer.use(cors())
  expressServer.use(express.json())

  function get (route, handlerPromise) { // meg kéne tudni adni custom onError handlereket is, ha valaki explicit akarja mutatni, hogy milyen errorok lehetnek. Ebben az esetben is, ha nincs kezelve az error azon a helyen, akkor tovább kéne küldeni a default error handlernek. Simán tovább throwolhatják az errort abban az esetben...
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
