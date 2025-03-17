export type Bindings = {
    OPENAI_API_KEY: string
}

export type Status =
    | { success: true, value: string, error: null }
    | { success: false, value: null, error: string }
