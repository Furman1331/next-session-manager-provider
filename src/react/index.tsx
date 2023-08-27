import * as React from "react";

import { createSession, generateSessionOptions, now } from "../utils/utils";
import { Session, SessionOptions } from "..";

import Logger from "../utils/logger";

import { AuthClientConfig, SessionContextValue, SessionProviderProps, SignInParams, SignOutParams, UseSessionOptions } from "./types";

const __AUTH: AuthClientConfig = {
    signInUrl: process.env.SESSION_PROVIDER_SIGN_IN_URL ?? "/auth/login",
    _lastSync: 0,
    _session: undefined,
    _getSession: () => { },
}

export * from "./types";

export const SessionContext = React.createContext?.<SessionContextValue | undefined>(undefined);

export function useSession<R extends boolean>(
    options?: UseSessionOptions<R>
): SessionContextValue<R> {
    if (!SessionContext) throw new Error("React Context is unavailable in Server Components");

    // @ts-expect-error
    const value: SessionContextValue<R> = React.useContext(SessionContext);
    if (!value && process.env.NODE_ENV !== "production") {
        throw new Error("[next-session-provider] `useSession must be wrapped in a <SessionProvider>`")
    }

    const { required, onUnauthenticated } = options ?? {};

    const requiredAndNotLoading = required && value.status === "unauthenticated";

    React.useEffect(() => {
        if (requiredAndNotLoading) {
            if (onUnauthenticated) onUnauthenticated();

            window.location.href = __AUTH.signInUrl;
        }
    }, [requiredAndNotLoading, onUnauthenticated])

    if (requiredAndNotLoading) {
        return {
            data: value.data,
            update: value.update,
            status: "loading",
        }
    }

    return value;
}

export async function onSignIn<R extends boolean = false>(
    options?: SignInParams<R>
): Promise<void> {
    const { callbackUrl = window.location.href } = options ?? {};

    if (options?.redirect ?? true) {
        window.location.href = callbackUrl;

        return;
    }

    await __AUTH._getSession();
}

export async function onSignOut<R extends boolean = true>(
    options?: SignOutParams<R>
): Promise<void> {
    if (!window) return await __AUTH._getSession();

    const { callbackUrl = window.location.href } = options ?? {};

    if (options?.redirect ?? true) {
        window.location.href = callbackUrl;

        return;
    }

    await __AUTH._getSession();
}

export function SessionProvider(props: SessionProviderProps) {
    if (!SessionContext) throw new Error("React Context is unavailable in Server Components");

    const { children } = props;

    const sessionOptions: SessionOptions = generateSessionOptions();

    const isSessionInitialized = props.session !== undefined;

    __AUTH._lastSync = isSessionInitialized ? now() : 0;

    const [session, setSession] = React.useState(() => {
        if (isSessionInitialized) __AUTH._session = props.session;
        return props.session;
    });

    const [loading, setLoading] = React.useState(!isSessionInitialized);

    async function getSession(): Promise<Session> {
        const user = await props.sessionGetter();

        return await createSession(user, sessionOptions);
    }

    React.useEffect(() => {
        __AUTH._getSession = async ({ event } = {}) => {
            try {
                const isStorageEvent = event === "storage";

                if (isStorageEvent || __AUTH._session === undefined) {
                    __AUTH._lastSync = now();
                    // Run your function that gets current session from your API.
                    __AUTH._session = await getSession();

                    setSession(__AUTH._session);
                    return
                }

                if (!event || __AUTH._session === null || now() < __AUTH._lastSync) return;

                __AUTH._lastSync = now();
                __AUTH._session = await getSession();
                setSession(__AUTH._session);
            } catch (error) {
                Logger.error("CLIENT_SESSION_ERROR", error as Error);
            } finally {
                setLoading(false);
            }
        }

        __AUTH._getSession();

        return () => {
            __AUTH._lastSync = 0;
            __AUTH._session = undefined;
            __AUTH._getSession = () => { }
        }
    }, []);

    React.useEffect(() => {
        const { refetchOnWindowFocus } = props;

        const visibilityHandler = () => {
            if (refetchOnWindowFocus && document.visibilityState === "visible") __AUTH._getSession({ event: "visibilitychange" });
        }

        document.addEventListener("visibilitychange", visibilityHandler, false);
        return () => document.removeEventListener("visibilitychange", visibilityHandler, false);
    }, [props.refetchOnWindowFocus])

    const value: any = React.useMemo(() => ({
        data: session,
        status: loading ? "loading" : session ? "authenticated" : "unauthenticated",
        async update(data: Session) {
            if (loading) return;

            setLoading(true);

            __AUTH._session = await getSession();
            setSession(__AUTH._session);

            setLoading(false);
        }
    }), [session, loading]);

    return (
        <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
    )
}