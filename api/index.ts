import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import OpenAI from 'openai'
import { Bindings } from './types'

export const config = {
  runtime: 'edge'
}

const app = new Hono<{ Bindings: Bindings }>().basePath('/api')

app.get('/', (c) => {
    return c.json({ message: 'Hello Hono!' })
})

app.post('/', async (c) => {
    const { text } = await c.req.parseBody();
    const ai = new OpenAI({
        apiKey: c.env.OPENAI_API_KEY
    })
})

export default handle(app)
