import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { env } from 'hono/adapter'
import OpenAI from 'openai'
import { MurekaAI } from './mureka';

export const openaiPrompt = "The user creates lyrics based on the content of their diary and customizes the form and structure of the lyrics. They wish to include random sections (e.g., [Drop]) and prefer no numbering in the progression of the song. In the output format, no explanations other than the lyrics are required, and random sections specified may appear during the progression of the song. The lyrics are created based on the content of the diary or other information provided by the user."

export const config = {
  runtime: 'edge'
}

const app = new Hono().basePath('/api')

app.get('/', (c) => {
    return c.json({ message: 'Hello Hono!' })
})

app.post('/', async (c) => {
    const query = {
        text: c.req.query("text"),
        prompt: c.req.query("prompt")
    }

    if (!query.text || !query.prompt) return c.json({ success: false, value: null, error: "query is null" }, 500);
    
    const openai = new OpenAI({
        apiKey: env<{ OPENAI_API_KEY: string }>(c).OPENAI_API_KEY
    })

    const mureka = new MurekaAI(env<{ USEAPI_TOKEN: string }>(c).USEAPI_TOKEN)
        
    try {
        console.log("------------ generate lyrics ------------")
        
        const lyrics = env<{ PRODUCTION: string }>(c).PRODUCTION === "true" ? (await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: openaiPrompt },
                { role: "user", content: query.text }
            ]
        })).choices[0].message.content : "こんにちは";
        
        console.log(JSON.stringify(lyrics));

        if (lyrics === null) return c.json({ success: false, value: null, error: "lyrics is null" }, 500);

        console.log("------------ generate music ------------")
        
        const musics = await mureka.generateMusic(lyrics, query.prompt)
        
        console.log(JSON.stringify(musics));
        
        return c.json({ success: true, value: musics, error: null }, 200)
    } catch (e) {
        console.log(e);
        return c.json({ success: false, value: null, error: e }, 500)
    }
})

export default handle(app)
