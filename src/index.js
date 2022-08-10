import express from 'express'
import cors from 'cors'
import multer from 'multer'

import { ValidationError } from 'standard-api-errors'

function createRequestHandler (callback, onError, log) {
  return async (req, res) => {
    try {
      const result = await callback(req)

      if (result.redirect) {
        res.redirect(result.status || 302, result.redirect)
      } else {
        res.status(result.status || 200).json(result)
      }
    } catch (e) {
      const err = onError(e)

      res.status(err.status || 500).json(err)
    }

    if (typeof log === 'function') {
      log(req, res)
    }
  }
}

export default function createApiServer (onError, log, settings = {}) {
  const expressServer = express()

  expressServer.use(cors())
  expressServer.use(express.json({ limit: settings.limit || '100kb' }))

  function get (route, handlerPromise) {
    expressServer.get(route, createRequestHandler(handlerPromise, onError, log))
  }

  function postBinary(route, settings, handlerPromise) {
    const upload = multer({
      storage: multer.memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (settings.mimeTypes.includes(file.mimetype)) {
          cb(null, true)
        }
        return cb(new ValidationError(`Mime type '${file.mimetype}' not allowed! Allowed mime types are: ${settings.mimeTypes.join(',')}`), false)
      }
    })
    
    expressServer.post(route, createRequestHandler(async () => {
      await new Promise((resolve, reject) => {
        upload.single(settings.fieldName)(req, null, function(err) {
          if (err) {
            return reject(err)
          }
          resolve()
        })
      })
      return handlerPromise()
    }, onError, log))
  }

  function post (route, handlerPromise) {
    expressServer.post(route, createRequestHandler(handlerPromise, onError, log))
  }

  function put (route, handlerPromise) {
    expressServer.put(route, createRequestHandler(handlerPromise, onError, log))
  }

  function patch (route, handlerPromise) {
    expressServer.patch(route, createRequestHandler(handlerPromise, onError, log))
  }

  function del (route, handlerPromise) {
    expressServer.delete(route, createRequestHandler(handlerPromise, onError, log))
  }

  function listen (port) {
    return expressServer.listen(port)
  }

  return {
    _expressServer: expressServer, // published for testing purposes with supertest

    get,
    post,
    postBinary,
    put,
    patch,
    delete: del,

    listen
  }
}
