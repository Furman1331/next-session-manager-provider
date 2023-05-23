export class UnknownError extends Error {
    code: string;
    constructor(error: Error | string) {
        // Support passing error or string
        super((error as Error)?.message ?? error);
        this.name = "UnknownError";
        this.code = (error as any).code;
        if (error instanceof Error) {
            this.stack = error.stack;
        }
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            stack: this.stack,
        };
    }
}
