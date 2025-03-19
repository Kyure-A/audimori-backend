const MUREKA_BASE_URL = "https://api.useapi.net/v1/mureka";

// https://useapi.net/docs/api-mureka-v1/post-mureka-music-create-advanced
type MurekaApiResponse = {
    feed_id: number;
    state: number;
    songs: [MurekaSong, MurekaSong];
}

// https://useapi.net/docs/api-mureka-v1/post-mureka-music-create-advanced
type MurekaSong = {
    song_id: string;
    title: string;
    version: string;
    duration_milliseconds: number;
    generate_at: number;
    genres: string[];
    moods: string[];
    mp3_url: string;
    share_key: string;
    recall?: boolean;
    machine_audit_state: number;
    credit_type: number;
    cover: string;
    share_link: string;
}

type MurekaAIResponse = {
    name: string;
    musicUrl: string;
    coverImageUrl: string;
    lyrics: string,
    prompt: string
}

// https://github.com/kk2a/Audimori/blob/main/src/types/music.ts
export class MurekaAI {
    constructor(
        private token: string
    ) {}

    async generateMusic(lyrics: string, prompt: string): Promise<MurekaAIResponse[]> {
        try {
            const response = await fetch(`${MUREKA_BASE_URL}/music/create-advanced`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "lyrics": lyrics,
                    "desc": prompt
                }),
                redirect: "follow"
            })

            if (!response.ok) return Promise.reject(new Error(JSON.stringify(response)));

            const musics: MurekaAIResponse[] = (await response.json() as MurekaApiResponse).songs.map(song => {
                return {
                    name: song.title,
                    musicUrl: song.mp3_url,
                    coverImageUrl: song.cover,
                    lyrics: lyrics,
                    prompt: prompt
                } satisfies MurekaAIResponse
            })

            return musics            
        } catch (e) {
            console.error(e);
            return Promise.reject(new Error(JSON.stringify(e)));
        }
    }
}
