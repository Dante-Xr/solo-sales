/**
 * A mailbox can receive at most three recovery messages in fifteen minutes.
 * Keep the client countdown and server limiter aligned on this lower bound.
 */
export const RECOVERY_EMAIL_RESEND_COOLDOWN_SECONDS = 5 * 60
