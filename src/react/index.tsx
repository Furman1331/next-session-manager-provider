import * as React from "react";

import { now } from "../utils/utils";
import Logger from "../utils/logger";
import { AuthClientConfig, Session, SessionContextValue, SessionProviderProps } from "./types";

const __AUTH: AuthClientConfig = {
    _lastSync: 0,
    _session: undefined,
    _getSession: () => { },
}

const SessionContext = React.createContext?.<SessionContextValue | undefined>(undefined);

export function SessionProvider(props: SessionProviderProps) {
    if (!SessionContext) throw new Error("React Context is unavailable in Server Components");

    const { children } = props;

    const isSessionInitialized = props.session !== undefined;

    __AUTH._lastSync = isSessionInitialized ? now() : 0;

    const [session, setSession] = React.useState(() => {
        if (isSessionInitialized) __AUTH._session = props.session;
        return props.session;
    });
    const [loading, setLoading] = React.useState(!isSessionInitialized);

    React.useEffect(() => {
        __AUTH._getSession = async ({ event } = {}) => {
            try {
                const isStorageEvent = event === "storage";

                if (isStorageEvent || __AUTH._session === undefined) {
                    __AUTH._lastSync = now();
                    // Run your function that gets current session from your API.
                    __AUTH._session = await props.sessionGetter();

                    setSession(__AUTH._session);
                    return
                }

                if (!event || __AUTH._session === null || now() < __AUTH._lastSync) return;

                __AUTH._lastSync = now();
                __AUTH._session = await props.sessionGetter();
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
            if (loading || !session) return;

            setLoading(true);

            __AUTH._session = await props.sessionGetter();
            setSession(__AUTH._session);

            setLoading(false);
        }
    }), [session, loading]);

    return (
        <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
    )
}