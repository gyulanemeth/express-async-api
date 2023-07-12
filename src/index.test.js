import { describe, test, expect, beforeAll, beforeEach } from 'vitest'

import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

import request from 'supertest'

import createApiServer from './index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const testPic = fs.readFileSync(path.join(__dirname, '..', 'testPics', 'test.png'))

describe('createApiServer', () => {
  let expressServer
  let apiServer
  let loggerCalledWithRoute = ''
  beforeAll(() => {
    apiServer = createApiServer((err) => ({ error: { message: err.message } }), (req) => { loggerCalledWithRoute = req.path })
    expressServer = apiServer._expressServer

    apiServer.get('/get', async () => ({ result: 'get' }))
    apiServer.post('/post', async () => ({ status: 201, result: 'post' }))
    apiServer.put('/put', async () => ({ status: 200, result: 'put' }))
    apiServer.patch('/patch', async () => ({ status: 200, result: 'patch' }))
    apiServer.delete('/delete', async () => ({ status: 200, result: 'delete' }))

    apiServer.get('/get-err', async () => { throw new Error('get error') })
    apiServer.post('/post-err', async () => { throw new Error('post error') })
    apiServer.put('/put-err', async () => { throw new Error('put error') })
    apiServer.patch('/patch-err', async () => { throw new Error('patch error') })
    apiServer.delete('/delete-err', async () => { throw new Error('delete error') })

    apiServer.get('/get-redirect', async () => ({ redirect: 'https://example.com' }))
    apiServer.post('/post-redirect', async () => ({ redirect: 'https://example.com' }))
    apiServer.put('/put-redirect', async () => ({ redirect: 'https://example.com' }))
    apiServer.patch('/patch-redirect', async () => ({ redirect: 'https://example.com' }))
    apiServer.delete('/delete-redirect', async () => ({ redirect: 'https://example.com' }))

    apiServer.get('/get-binary', async () => {
      const testImage = fs.readFileSync(path.join(__dirname, '..', 'testPics', 'test.png'))

      return {
        binary: testImage
      }
    })

    apiServer.get('/get-attachment', async () => ({
      attachment: {
        name: 'test.text',
        data: Buffer.from('test text for .text file')
      }
    }))
  })

  beforeEach(() => {
    loggerCalledWithRoute = ''
  })

  describe('Success', () => {
    test('GET', async () => {
      const res = await request(expressServer).get('/get').send()

      expect(res.statusCode).toBe(200)
      expect(res.body).toEqual({ result: 'get' })
      expect(loggerCalledWithRoute).toBe('/get')
    })

    test('POST', async () => {
      const res = await request(expressServer).post('/post').send()

      expect(res.statusCode).toBe(201)
      expect(res.body).toEqual({ status: 201, result: 'post' })
      expect(loggerCalledWithRoute).toBe('/post')
    })

    test('PUT', async () => {
      const res = await request(expressServer).put('/put').send()

      expect(res.statusCode).toBe(200)
      expect(res.body).toEqual({ status: 200, result: 'put' })
      expect(loggerCalledWithRoute).toBe('/put')
    })

    test('PATCH', async () => {
      const res = await request(expressServer).patch('/patch').send()

      expect(res.statusCode).toBe(200)
      expect(res.body).toEqual({ status: 200, result: 'patch' })
      expect(loggerCalledWithRoute).toBe('/patch')
    })

    test('DELETE', async () => {
      const res = await request(expressServer).delete('/delete').send()

      expect(res.statusCode).toBe(200)
      expect(res.body).toEqual({ status: 200, result: 'delete' })
      expect(loggerCalledWithRoute).toBe('/delete')
    })

    test('Binary result', async () => {
      const res = await request(expressServer).get('/get-binary')

      expect(res.statusCode).toBe(200)
      const expectedBinary = fs.readFileSync(path.join(__dirname, '..', 'testPics', 'test.png'))
      expect(Buffer.compare(res.body, expectedBinary)).toBe(0)
      expect(res.header['content-type']).toBe('image/png')
    })

    test('GET Attachment', async () => {
      const res = await request(expressServer).get('/get-attachment').send()

      expect(res.statusCode).toBe(200)
      expect(res.header['content-type']).toBe('text/plain; charset=utf-8')
      expect(res.header['content-disposition']).toBe('attachment; filename="test.text"')
      expect(res.text).toBe('test text for .text file')
      expect(loggerCalledWithRoute).toBe('/get-attachment')
    })
  })

  describe('Redirect', () => {
    test('GET', async () => {
      const res = await request(expressServer).get('/get-redirect').send()

      expect(res.statusCode).toBe(302)
      expect(res.header.location).toBe('https://example.com')
      expect(loggerCalledWithRoute).toBe('/get-redirect')
    })

    test('POST', async () => {
      const res = await request(expressServer).post('/post-redirect').send()

      expect(res.statusCode).toBe(302)
      expect(res.header.location).toBe('https://example.com')
      expect(loggerCalledWithRoute).toBe('/post-redirect')
    })

    test('PUT', async () => {
      const res = await request(expressServer).put('/put-redirect').send()

      expect(res.statusCode).toBe(302)
      expect(res.header.location).toBe('https://example.com')
      expect(loggerCalledWithRoute).toBe('/put-redirect')
    })

    test('PATCH', async () => {
      const res = await request(expressServer).patch('/patch-redirect').send()

      expect(res.statusCode).toBe(302)
      expect(res.header.location).toBe('https://example.com')
      expect(loggerCalledWithRoute).toBe('/patch-redirect')
    })

    test('DELETE', async () => {
      const res = await request(expressServer).delete('/delete-redirect').send()

      expect(res.statusCode).toBe(302)
      expect(res.header.location).toBe('https://example.com')
      expect(loggerCalledWithRoute).toBe('/delete-redirect')
    })
  })

  describe('Global error handler', () => {
    test('GET', async () => {
      const res = await request(expressServer).get('/get-err').send()

      expect(res.statusCode).toBe(500)
      expect(res.body).toEqual({ error: { message: 'get error' } })
      expect(loggerCalledWithRoute).toBe('/get-err')
    })

    test('POST', async () => {
      const res = await request(expressServer).post('/post-err').send()

      expect(res.statusCode).toBe(500)
      expect(res.body).toEqual({ error: { message: 'post error' } })
      expect(loggerCalledWithRoute).toBe('/post-err')
    })

    test('PUT', async () => {
      const res = await request(expressServer).put('/put-err').send()

      expect(res.statusCode).toBe(500)
      expect(res.body).toEqual({ error: { message: 'put error' } })
      expect(loggerCalledWithRoute).toBe('/put-err')
    })

    test('PATCH', async () => {
      const res = await request(expressServer).patch('/patch-err').send()

      expect(res.statusCode).toBe(500)
      expect(res.body).toEqual({ error: { message: 'patch error' } })
      expect(loggerCalledWithRoute).toBe('/patch-err')
    })

    test('DELETE', async () => {
      const res = await request(expressServer).delete('/delete-err').send()

      expect(res.statusCode).toBe(500)
      expect(res.body).toEqual({ error: { message: 'delete error' } })
      expect(loggerCalledWithRoute).toBe('/delete-err')
    })
  })

  test('Without error logger', async () => {
    const apiServer = createApiServer((err) => ({ error: { message: err.message } }))
    expressServer = apiServer._expressServer

    apiServer.get('/get', async () => ({ result: 'get' }))

    await request(expressServer).get('/get').send()
    expect(loggerCalledWithRoute).toBe('')
  })

  test('listen', async () => {
    const server = apiServer.listen(3000)
    expect(server.address()).toBeTruthy()
    server.close()
  })
})

describe('Multer upload files', () => {
  let expressServer
  let apiServer

  beforeAll(() => {
    apiServer = createApiServer((err) => ({ error: { message: err.message } }), () => {})
    expressServer = apiServer._expressServer

    apiServer.postBinary('/file', { mimeTypes: ['image/png'], fieldName: 'test' }, async req => {
      return {
        status: 200,
        result: { file: req.file }
      }
    })

    apiServer.postBinary('/limited-file', { mimeTypes: ['image/png'], fieldName: 'test', limits: '0' }, async req => {
      return {
        status: 200,
        result: { file: req.file }
      }
    })
  })

  test('File type not allowed', async () => {
    const file = Buffer.from('whatever')
    file.name = 'test'
    file.mimetype = 'application/octet-stream'
    const res = await request(expressServer).post('/file').attach('test', file)
    expect(res.body.error.message).toBe(`Mime type '${file.mimetype}' not allowed! Allowed mime types are: ${['image/png'].join(',')}`)
  })

  test('File unexpected fieldName ', async () => {
    const file = Buffer.from('whatever')
    file.name = 'test'
    file.mimetype = 'application/octet-stream'
    const res = await request(expressServer).post('/file').attach('file', file)
    expect(res.body.error.message).toBe('Unexpected field')
  })

  test('Success upload file', async () => {
    const res = await request(expressServer).post('/file').attach('test', path.join(__dirname, '..', 'testPics', 'test.png'))
    expect(res.body.status).toBe(200)
    expect(Buffer.from(res.body.result.file.buffer.data)).toEqual(testPic)
  })

  test('upload file limit error', async () => {
    const res = await request(expressServer).post('/limited-file').attach('test', path.join(__dirname, '..', 'testPics', 'test.png'))
    expect(res.body.error.message).toBe('File too large')
  })
})
