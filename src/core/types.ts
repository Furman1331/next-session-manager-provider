export type Awaitable<T> = T | PromiseLike<T>;

export interface AuthOptions {
    session?: Partial<SessionOptions>;
}

export type SessionStrategy = "jwt" | "database";

export interface SessionOptions {
    strategy: SessionStrategy;
    maxAge: number;
    updateAge: number;
    generateSessionToken: () => Awaitable<string>;
}
