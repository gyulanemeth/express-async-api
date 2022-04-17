import request from 'supertest'

import createApiServer from './index.js'

describe('createApiServer', () => {
  let expressServer
  let apiServer
  beforeAll(() => {
    apiServer = createApiServer((err, res) => res.status(err.status || 500).json({ error: { message: err.message } }))
    expressServer = apiServer._expressServer

    apiServer.get('/get', async () => ({ result: 'get' }))
    apiServer.post('/post', async () => ({ status: 201, result: 'post' }))
    apiServer.put('/put', async () => ({ status: 200, result: 'put' }))
    apiServer.delete('/delete', async () => ({ status: 200, result: 'delete' }))

    apiServer.get('/get-err', async () => { throw new Error('get error') })
    apiServer.post('/post-err', async () => { throw new Error('post error') })
    apiServer.put('/put-err', async () => { throw new Error('put error') })
    apiServer.delete('/delete-err', async () => { throw new Error('delete error') })
  })
  test('get success', async () => {
    const res = await request(expressServer).get('/get').send()

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ result: 'get' })
  })

  test('get error', async () => {
    const res = await request(expressServer).get('/get-err').send()

    expect(res.statusCode).toBe(500)
    expect(res.body).toEqual({ error: { message: 'get error' } })
  })

  test('post success', async () => {
    const res = await request(expressServer).post('/post').send()

    expect(res.statusCode).toBe(201)
    expect(res.body).toEqual({ status: 201, result: 'post' })
  })

  test('post error', async () => {
    const res = await request(expressServer).post('/post-err').send()

    expect(res.statusCode).toBe(500)
    expect(res.body).toEqual({ error: { message: 'post error' } })
  })

  test('put success', async () => {
    const res = await request(expressServer).put('/put').send()

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ status: 200, result: 'put' })
  })

  test('put error', async () => {
    const res = await request(expressServer).put('/put-err').send()

    expect(res.statusCode).toBe(500)
    expect(res.body).toEqual({ error: { message: 'put error' } })
  })

  test('delete success', async () => {
    const res = await request(expressServer).delete('/delete').send()

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ status: 200, result: 'delete' })
  })

  test('delete error', async () => {
    const res = await request(expressServer).delete('/delete-err').send()

    expect(res.statusCode).toBe(500)
    expect(res.body).toEqual({ error: { message: 'delete error' } })
  })

  test('listen', async () => {
    const server = apiServer.listen(3000)
    expect(server.address()).toBeTruthy()
    server.close()
  })
})
