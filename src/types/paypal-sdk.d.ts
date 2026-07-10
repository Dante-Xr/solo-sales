/**
 * Type declarations for @paypal/checkout-server-sdk
 * Since the package doesn't provide its own type definitions
 */

declare module "@paypal/checkout-server-sdk" {
  export namespace core {
    class PayPalHttpClient {
      constructor(environment: SandboxEnvironment | LiveEnvironment);
      execute<T = unknown>(request: unknown): Promise<{ result: T }>;
    }

    class SandboxEnvironment {
      constructor(clientId: string, clientSecret: string);
    }

    class LiveEnvironment {
      constructor(clientId: string, clientSecret: string);
    }
  }

  export namespace orders {
    class OrdersCreateRequest {
      prefer(prefer: string): void;
      requestBody(body: unknown): void;
    }

    class OrdersCaptureRequest {
      constructor(orderId: string);
      requestBody(body: unknown): void;
    }

    class OrdersGetRequest {
      constructor(orderId: string);
    }
  }
}
