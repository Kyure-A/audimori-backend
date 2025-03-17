import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import OpenAI from 'openai'
import { Bindings } from './types'
import { prompt } from './prompt'

export const config = {
  runtime: 'edge'
}

const app = new Hono<{ Bindings: Bindings }>().basePath('/api')

app.get('/', (c) => {
    return c.json({ message: 'Hello Hono!' })
})

app.post('/', async (c) => {
    const text = c.req.query("text") as string;
    
    const openai = new OpenAI({
        apiKey: c.env.OPENAI_API_KEY
    })
    
    try {
        const lyrics = (await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: prompt },
                { role: "user", content: text }
            ]
        })).choices[0].message;

        return c.json({ success: true, value: lyrics, error: null }, 200)
    } catch (e) {
        console.log(e);
        return c.json({ success: false, value: null, error: e }, 500)
    }
})

export default handle(app)
