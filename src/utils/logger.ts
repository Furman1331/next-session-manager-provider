import { UnknownError } from "../core/errors";

export type WarningCode = "DEBUG_ENABLED";

function formatMetadata(o: unknown): unknown {
    if (o instanceof Error && !(o instanceof UnknownError)) {
        return { message: o.message, stack: o.stack, name: o.name };
    }
    if (hasErrorProperty(o)) {
        o.error = formatMetadata(o.error) as Error;
        o.message = o.message ?? o.error.message;
    }
    return o;
}

function hasErrorProperty(
    x: unknown
): x is { error: Error; [key: string]: unknown } {
    return !!(x as any)?.error;
}

export interface LoggerInstance extends Record<string, Function> {
    warn: (code: WarningCode) => void;
    error: (
        code: string,
        metadata: Error | { error: Error; [key: string]: unknown }
    ) => void;
    debug: (code: string, metadata: unknown) => void;
}

const _logger: LoggerInstance = {
    warn(code) {
        console.warn(`[next-session-provider][warn][${code}]`);
    },
    error(code, metadata) {
        metadata = formatMetadata(metadata) as Error;
        console.error(
            `[next-session-provider][error][${code}]`,
            metadata.message,
            metadata
        );
    },
    debug(code, metadata) {
        console.log(`[next-session-provider][debug][${code}]`, metadata);
    },
};

export default _logger;
