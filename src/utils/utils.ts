import { Session, SessionOptions } from "..";
import { randomBytes, randomUUID } from "crypto";

export function now(): number {
    return Math.floor(Date.now() / 1000);
}

export function fromDate(time: number, date = Date.now()) {
    return new Date(date + time * 1000);
}

export function createSession(
    sesionData: Session["user"],
    options: SessionOptions
) {
    const { maxAge: sessionMaxAge } = options;

    const newExpires = fromDate(sessionMaxAge);

    const updatedSession: Session = {
        user: {
            ...sesionData,
        },
        expires: newExpires.toISOString(),
    };

    return updatedSession;
}

export function generateSessionOptions(): SessionOptions {
    return {
        updateAge: 24 * 60 * 60,
        maxAge: 30 * 24 * 60 * 60,
        generateSessionToken: () => {
            return randomUUID?.() ?? randomBytes(32).toString("hex");
        },
    };
}
