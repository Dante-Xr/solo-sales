export function generateNonce(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 32)
}

export function getCspHeaders(nonce: string, isDev: boolean = false): string {
  return [
    "default-src 'self'",
    isDev
      ? `script-src 'self' 'nonce-${nonce}' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com`
      : `script-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://js.stripe.com`,
    `style-src 'self' 'unsafe-inline'`,
    "img-src 'self' data: https://images.unsplash.com https://picsum.photos",
    "font-src 'self' data:",
    "connect-src 'self' https://api.stripe.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  ].join("; ")
}
