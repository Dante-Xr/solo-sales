/**
 * ============================================
 * PayPal Payment Provider
 * ============================================
 * 创建时间：2026-06-30
 * 功能说明：
 *   - PayPal Checkout 集成（REST API v2）
 *   - 支持 PayPal 账户和信用卡支付
 *   - Webhook 验证和事件处理
 *
 * 注意：
 *   - 支持个人商业账户（Sole Proprietor）
 *   - 无需营业执照即可注册
 * ============================================
 */

import paypal from "@paypal/checkout-server-sdk";
import type { PayPalLink, PayPalOrderResponse } from "@/types/paypal";
import {
  PaymentProvider,
  PaymentAction,
  PaymentSessionParams,
  WebhookEvent,
  PaymentResult,
} from "../provider";

export class PayPalProvider implements PaymentProvider {
  readonly name = "paypal" as const;
  private client: paypal.core.PayPalHttpClient | null = null;

  /**
   * 获取 PayPal 客户端
   */
  private getClient(): paypal.core.PayPalHttpClient {
    if (!this.client) {
      const clientId = process.env.PAYPAL_CLIENT_ID;
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
      const mode = process.env.PAYPAL_MODE || "sandbox"; // sandbox | live

      if (!clientId || !clientSecret) {
        throw new Error(
          "PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be configured",
        );
      }

      // 创建环境配置
      const environment =
        mode === "live"
          ? new paypal.core.LiveEnvironment(clientId, clientSecret)
          : new paypal.core.SandboxEnvironment(clientId, clientSecret);

      this.client = new paypal.core.PayPalHttpClient(environment);
    }

    return this.client;
  }

  /**
   * 创建 PayPal 支付会话
   * 返回重定向 URL，用户将跳转到 PayPal 进行支付
   */
  async createPaymentSession(
    params: PaymentSessionParams,
  ): Promise<PaymentAction> {
    const client = this.getClient();

    // 创建订单请求
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.orderId,
          amount: {
            currency_code: params.currency.toUpperCase(),
            value: params.amount.toFixed(2),
          },
          description: `Order ${params.orderId}`,
          custom_id: params.orderId,
        },
      ],
      application_context: {
        brand_name: process.env.NEXT_PUBLIC_SITE_NAME || "SoloSales",
        locale: params.locale.replace("-", "_"), // en-US -> en_US
        landing_page: "BILLING",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/${params.locale}/payment/success?provider=paypal`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${params.locale}/payment/cancel?provider=paypal`,
      },
    });

    try {
      const response = await client.execute<PayPalOrderResponse>(request);
      const order = response.result;

      // 查找 approve 链接
      const approveLink = order.links?.find(
        (link: PayPalLink) => link.rel === "approve",
      );

      if (!approveLink?.href) {
        throw new Error("PayPal approve URL not found");
      }

      return {
        type: "redirect",
        url: approveLink.href,
      };
    } catch (error: any) {
      console.error("PayPal order creation error:", error);
      throw new Error(`PayPal payment creation failed: ${error.message}`);
    }
  }

  /**
   * 验证 PayPal Webhook 签名
   */
  async verifyWebhook(
    rawBody: string | Buffer,
    signature: string,
    headers?: Record<string, string>,
  ): Promise<WebhookEvent> {
    if (!process.env.PAYPAL_WEBHOOK_ID) {
      throw new Error("PAYPAL_WEBHOOK_ID is not configured");
    }

    const client = this.getClient();

    // PayPal webhook 验证请求
    const request = {
      method: "POST",
      path: "/v1/notifications/verify-webhook-signature",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transmission_id: headers?.["paypal-transmission-id"],
        transmission_time: headers?.["paypal-transmission-time"],
        cert_url: headers?.["paypal-cert-url"],
        auth_algo: headers?.["paypal-auth-algo"],
        transmission_sig: signature,
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event:
          typeof rawBody === "string"
            ? JSON.parse(rawBody)
            : JSON.parse(rawBody.toString()),
      }),
    };

    try {
      const response = await client.execute(request as any);
      const verificationStatus = response.result.verification_status;

      if (verificationStatus !== "SUCCESS") {
        throw new Error("PayPal webhook signature verification failed");
      }

      // 解析事件
      const event =
        typeof rawBody === "string"
          ? JSON.parse(rawBody)
          : JSON.parse(rawBody.toString());

      return this.parseWebhookEvent(event);
    } catch (error: any) {
      console.error("PayPal webhook verification error:", error);
      throw new Error(`PayPal webhook verification failed: ${error.message}`);
    }
  }

  /**
   * 解析 PayPal Webhook 事件
   */
  private parseWebhookEvent(event: any): WebhookEvent {
    const eventType = event.event_type;
    const resource = event.resource;

    // PAYMENT.CAPTURE.COMPLETED - 支付成功
    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const orderId =
        resource.custom_id || resource.purchase_units?.[0]?.reference_id || "";

      return {
        type: "payment.success",
        orderId,
        transactionId: resource.id,
        amount: parseFloat(resource.amount.value),
        currency: resource.amount.currency_code,
        timestamp: new Date(resource.create_time),
        rawData: event,
      };
    }

    // PAYMENT.CAPTURE.DENIED - 支付失败
    if (eventType === "PAYMENT.CAPTURE.DENIED") {
      const orderId =
        resource.custom_id || resource.purchase_units?.[0]?.reference_id || "";

      return {
        type: "payment.failed",
        orderId,
        transactionId: resource.id,
        amount: parseFloat(resource.amount.value),
        currency: resource.amount.currency_code,
        timestamp: new Date(resource.create_time),
        rawData: event,
      };
    }

    // CHECKOUT.ORDER.APPROVED - 订单已批准但未捕获
    if (eventType === "CHECKOUT.ORDER.APPROVED") {
      const orderId =
        resource.purchase_units?.[0]?.custom_id ||
        resource.purchase_units?.[0]?.reference_id ||
        "";
      const amount = parseFloat(
        resource.purchase_units?.[0]?.amount?.value || "0",
      );
      const currency =
        resource.purchase_units?.[0]?.amount?.currency_code || "USD";

      return {
        type: "payment.success",
        orderId,
        transactionId: resource.id,
        amount,
        currency,
        timestamp: new Date(resource.create_time),
        rawData: event,
      };
    }

    throw new Error(`Unsupported PayPal event type: ${eventType}`);
  }

  /**
   * 处理支付通知
   */
  async processPayment(event: WebhookEvent): Promise<PaymentResult> {
    if (!event.orderId || !event.transactionId) {
      throw new Error(
        "Missing orderId or transactionId in PayPal webhook event",
      );
    }

    return {
      success: event.type === "payment.success",
      orderId: event.orderId,
      transactionId: event.transactionId,
      message:
        event.type === "payment.success"
          ? "PayPal payment successful"
          : "PayPal payment failed",
    };
  }

  /**
   * 捕获已批准的订单（用于手动捕获场景）
   */
  async captureOrder(orderId: string): Promise<any> {
    const client = this.getClient();
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
      const response = await client.execute(request);
      return response.result;
    } catch (error: any) {
      console.error("PayPal order capture error:", error);
      throw new Error(`PayPal order capture failed: ${error.message}`);
    }
  }

  /**
   * 获取订单详情
   */
  async getOrderDetails(orderId: string): Promise<any> {
    const client = this.getClient();
    const request = new paypal.orders.OrdersGetRequest(orderId);

    try {
      const response = await client.execute(request);
      return response.result;
    } catch (error: any) {
      console.error("PayPal get order error:", error);
      throw new Error(`Failed to get PayPal order: ${error.message}`);
    }
  }
}
