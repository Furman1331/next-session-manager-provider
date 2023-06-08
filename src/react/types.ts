export interface UseSessionOptions<R extends boolean> {
    required: R;
    onUnauthenticated?: () => void;
}

type ISODateString = string;

interface DefaultSession {
    user?: {
        email?: string | null;
    };
    expires: ISODateString;
}

export interface Session extends DefaultSession {}

type UpdateSession = (data?: any) => Promise<Session | null>;

export type SessionContextValue<R extends boolean = false> = R extends true
    ?
          | { update: UpdateSession; data: Session; status: "authenticated" }
          | { update: UpdateSession; data: null; status: "loading" }
    :
          | { update: UpdateSession; data: Session; status: "authenticated" }
          | {
                update: UpdateSession;
                data: null;
                status: "unauthenticated" | "loading";
            };

export interface SessionProviderProps {
    children: React.ReactNode;
    session?: Session | null;
    sessionGetter: (...args: any[]) => any;

    refetchOnWindowFocus?: boolean;
}

export interface AuthClientConfig {
    signInUrl: string;

    _session?: Session | null | undefined;
    _lastSync: number;
    _getSession: (...args: any[]) => any;
}
