import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { env } from 'hono/adapter'
import OpenAI from 'openai'
import { SunoAI } from "./suno";
import { UdioWrapper } from './udio';

export const prompt = "The user creates lyrics based on the content of their diary and customizes the form and structure of the lyrics. They wish to include random sections (e.g., [Drop]) and prefer no numbering in the progression of the song. In the output format, no explanations other than the lyrics are required, and random sections specified may appear during the progression of the song. The lyrics are created based on the content of the diary or other information provided by the user."

export const config = {
  runtime: 'edge'
}

const app = new Hono().basePath('/api')

app.get('/', (c) => {
    return c.json({ message: 'Hello Hono!' })
})

app.post('/', async (c) => {
    const text = c.req.query("text") as string;
    
    const openai = new OpenAI({
        apiKey: env<{ OPENAI_API_KEY: string }>(c).OPENAI_API_KEY
    })

    // const sunoai = new SunoAI(env<{ SUNO_BASEURL: string }>(c).SUNO_BASEURL);

    const udio = new UdioWrapper(env<{ UDIO_TOKEN0: string}>(c).UDIO_TOKEN0, env<{ UDIO_TOKEN1: string}>(c).UDIO_TOKEN1);
    
    try {
        console.log("------------ generate lyrics ------------")
        
        // const lyrics = (await openai.chat.completions.create({
        //     model: "gpt-4o-mini",
        //     messages: [
        //         { role: "system", content: prompt },
        //         { role: "user", content: text }
        //     ]
        // })).choices[0].message.content;
        const lyrics = "こんにちは"; 
        
        console.log(JSON.stringify(lyrics));

        if (lyrics === null) return c.json({ success: false, value: null, error: "lyrics is null" }, 500);

        console.log("------------ generate music ------------")
        
        // const music = await sunoai.generate(lyrics, ["a capella"])
        const music = await udio.generateSong("a capella", -1, lyrics);
        
        console.log(JSON.stringify(music));
        
        return c.json({ success: true, value: lyrics, error: null }, 200)
    } catch (e) {
        console.log(e);
        return c.json({ success: false, value: null, error: e }, 500)
    }
})

export default handle(app)
