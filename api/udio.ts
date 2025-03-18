interface SongStatus {
    songs: { song_path: string; title: string; finished: boolean }[];
}

export class UdioWrapper {
    public API_BASE_URL = 'https://www.udio.com/api';
    public authToken0: string;
    public authToken1: string;
    public allTrackIds: string[] = [];

    constructor(authToken0: string, authToken1: string) {
        this.authToken0 = authToken0;
        this.authToken1 = authToken1;
    }

    public async makeRequest(url: string, method: string, data?: any, headers?: any) {
        try {
            const response = await fetch(url, {
                method,
                headers,
                body: method === 'POST' ? JSON.stringify(data) : undefined,
            });
            // if (!response.ok) throw new Error(`HTTP error! status: ${JSON.stringify(response)}`);
            return await response.json();
        } catch (error) {
            console.error(`Error making ${method} request to ${url}:`, error);
            return null;
        }
    }

    public getHeaders(getRequest = false) {
        return {
            Accept: getRequest ? 'application/json, text/plain, */*' : 'application/json',
            'Content-Type': 'application/json',
            Cookie: `sb-ssr-production-auth-token.0=${this.authToken0}; sb-ssr-production-auth-token.1=${this.authToken1}`,
            Origin: 'https://www.udio.com',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
        };
    }

    public async checkSongStatus(trackIds: string[]) {
        const url = `${this.API_BASE_URL}/songs?songIds=${trackIds.join(',')}`;
        return await this.makeRequest(url, 'GET', undefined, this.getHeaders(true));
    }
    
    // public async processSongs(trackIds: string[], folder: string) {
    //     while (true) {
    //         const status = await this.checkSongStatus(trackIds);
    //         if (!status) return null;
    //         if (status.songs.every((song: any) => song.finished)) {
    //             for (const song of status.songs) {
    //                 await this.downloadSong(song.song_path, song.title, folder);
    //             }
    //             return status.songs;
    //         }
    //         await new Promise((resolve) => setTimeout(resolve, 5000));
    //     }
    // }

    // public async downloadSong(url: string, title: string, folder: string) {
    //     const response = await fetch(url);
    //     if (!response.ok) throw new Error(`Failed to download song: ${title}`);
    // 
    //     const arrayBuffer = await response.arrayBuffer();
    //     const buffer = Buffer.from(arrayBuffer);
    //     const filePath = path.join(folder, `${title}.mp3`);
    //     fs.mkdirSync(folder, { recursive: true });
    //     fs.writeFileSync(filePath, buffer);
    //     console.log(`Downloaded ${title} to ${filePath}`);
    // }

    public async generateSong(prompt: string, seed: number, customLyrics?: string) {
        const url = `${this.API_BASE_URL}/generate-proxy`;
        const data = { prompt, samplerOptions: { seed }, lyricInput: customLyrics };
        return this.makeRequest(url, 'POST', data, this.getHeaders());
    }

    public async generateExtendSong(
        prompt: string,
        seed: number,
        audioConditioningPath: string,
        audioConditioningSongId: string,
        customLyrics?: string
    ) {
        const url = `${this.API_BASE_URL}/generate-proxy`;
        const data = {
            prompt,
            samplerOptions: {
                seed,
                audio_conditioning_path: audioConditioningPath,
                audio_conditioning_song_id: audioConditioningSongId,
                audio_conditioning_type: 'continuation',
            },
            lyricInput: customLyrics,
        };
        return this.makeRequest(url, 'POST', data, this.getHeaders());
    }

    public async generateOutro(
        prompt: string,
        seed: number,
        audioConditioningPath: string,
        audioConditioningSongId: string,
        customLyrics?: string
    ) {
        const url = `${this.API_BASE_URL}/generate-proxy`;
        const data = {
            prompt,
            samplerOptions: {
                seed,
                audio_conditioning_path: audioConditioningPath,
                audio_conditioning_song_id: audioConditioningSongId,
                audio_conditioning_type: 'continuation',
                crop_start_time: 0.9,
            },
            lyricInput: customLyrics,
        };
        return this.makeRequest(url, 'POST', data, this.getHeaders());
    }
}
