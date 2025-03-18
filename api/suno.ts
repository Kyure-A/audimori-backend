const DEFAULT_MODEL = 'chirp-v3-5';

export class SunoAI {
    constructor(
        private baseUrl: string
    ) {}

    async generate(prompt: string, tags: string[]) {
        const body = {
            prompt: prompt,
            mv: DEFAULT_MODEL,
            title: "title",
            tags: tags.join(","),
            negative_tags: "",
            continue_at: 120,
            continue_clip_id: "str"
        };

        const response = await fetch(`${this.baseUrl}/generate`, {
            method: "POST",
            body: JSON.stringify(body)
        })

        console.log(response);

        return response.json();
    }
}
