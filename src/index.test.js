import request from 'supertest'

import createApiServer from './index.js'

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
