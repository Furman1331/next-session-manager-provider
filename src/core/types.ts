export type Awaitable<T> = T | PromiseLike<T>;

type ISODateString = string;

export interface AuthOptions {
    session?: Partial<SessionOptions>;
    callbacks?: Partial<CallbacksOptions>;
}

interface DefaultSession {
    user?: {
        email?: string;
    };
    expires: ISODateString;
}

export interface Session extends DefaultSession {}

export type SessionStrategy = "jwt" | "database";

export interface SessionOptions {
    maxAge: number;
    updateAge: number;
    generateSessionToken: () => Awaitable<string>;
}

export interface CallbacksOptions {
    session: (params: {
        session: Session;
    }) => Awaitable<Session | DefaultSession>;
}
