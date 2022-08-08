import express from 'express'
import cors from 'cors'
import multer from 'multer'

let fileAllowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif']

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (fileAllowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      req.file_error = 'file not allowed Only .png, .jpg and .jpeg format allowed!'
      return cb(null, false)
    }
  }
})

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

  function get (route, handlerPromise) { // meg kéne tudni adni custom onError handlereket is, ha valaki explicit akarja mutatni, hogy milyen errorok lehetnek. Ebben az esetben is, ha nincs kezelve az error azon a helyen, akkor tovább kéne küldeni a default error handlernek. Simán tovább throwolhatják az errort abban az esetben...
    expressServer.get(route, createRequestHandler(handlerPromise, onError, log))
  }

  function setAllowedFiles (fileTypes) {
    fileAllowedTypes = fileTypes
  }

  function post (route, handlerPromise) {
    expressServer.post(route, upload.any(), createRequestHandler(handlerPromise, onError, log))
  }

  function put (route, handlerPromise) {
    expressServer.put(route, upload.any(), createRequestHandler(handlerPromise, onError, log))
  }

  function patch (route, handlerPromise) {
    expressServer.patch(route, upload.any(), createRequestHandler(handlerPromise, onError, log))
  }

  function del (route, handlerPromise) {
    expressServer.delete(route, createRequestHandler(handlerPromise, onError, log))
  }

  function listen (port) {
    return expressServer.listen(port)
  }

  return {
    _expressServer: expressServer, // published for testing purposes with supertest
    setAllowedFiles,
    get,
    post,
    put,
    patch,
    delete: del,

    listen
  }
}
