declare module "@paypal/checkout-server-sdk" {
  namespace core {
    class PayPalHttpClient {
      constructor(environment: SandboxEnvironment | LiveEnvironment);
      execute<T = any>(request: any): Promise<{ result: T }>;
    }

    class SandboxEnvironment {
      constructor(clientId: string, clientSecret: string);
    }

    class LiveEnvironment {
      constructor(clientId: string, clientSecret: string);
    }
  }

  namespace orders {
    class OrdersCreateRequest {
      prefer(prefer: string): void;
      requestBody(body: any): void;
    }

    class OrdersCaptureRequest {
      constructor(orderId: string);
      requestBody(body: any): void;
    }

    class OrdersGetRequest {
      constructor(orderId: string);
    }
  }

  export { core, orders };
}

/**
 * PayPal 金额对象
 */
export interface PayPalAmount {
  /** 货币代码（ISO 4217），如 USD, EUR, CNY */
  currency_code: string;
  /** 金额值，字符串格式，精确到小数点后两位 */
  value: string;
}

/**
 * PayPal 捕获详情
 */
export interface PayPalCapture {
  /** 捕获 ID */
  id: string;
  /** 捕获状态：COMPLETED, DECLINED, PARTIALLY_REFUNDED, PENDING, REFUNDED */
  status: string;
  /** 捕获金额 */
  amount?: PayPalAmount;
}

/**
 * PayPal 支付详情
 */
export interface PayPalPayments {
  /** 捕获列表 */
  captures?: PayPalCapture[];
}

/**
 * PayPal 购买单元（用于创建订单）
 */
export interface PayPalPurchaseUnit {
  /** 参考 ID（商户订单号） */
  reference_id: string;
  /** 订单金额 */
  amount: PayPalAmount;
  /** 订单描述 */
  description?: string;
  /** 自定义 ID */
  custom_id?: string;
}

/**
 * PayPal 购买单元响应（包含支付详情）
 */
export interface PayPalPurchaseUnitResponse extends PayPalPurchaseUnit {
  /** 支付详情（捕获后可用） */
  payments?: PayPalPayments;
}

/**
 * PayPal 应用上下文
 */
export interface PayPalApplicationContext {
  /** 品牌名称 */
  brand_name?: string;
  /** 区域设置，如 en_US */
  locale?: string;
  /** 落地页类型：LOGIN（登录页）或 BILLING（支付页） */
  landing_page?: 'LOGIN' | 'BILLING' | 'NO_PREFERENCE';
  /** 配送偏好：NO_SHIPPING（无配送）或 GET_FROM_FILE */
  shipping_preference?: 'NO_SHIPPING' | 'GET_FROM_FILE' | 'SET_PROVIDED_ADDRESS';
  /** 用户操作：PAY_NOW 或 CONTINUE */
  user_action?: 'PAY_NOW' | 'CONTINUE';
  /** 返回 URL（支付成功后跳转） */
  return_url?: string;
  /** 取消 URL（用户取消支付后跳转） */
  cancel_url?: string;
}

/**
 * PayPal 订单创建请求体
 */
export interface PayPalOrderRequest {
  /** 订单意图：CAPTURE（立即捕获）或 AUTHORIZE（授权后捕获） */
  intent: 'CAPTURE' | 'AUTHORIZE';
  /** 购买单元列表 */
  purchase_units: PayPalPurchaseUnit[];
  /** 应用上下文（控制支付体验） */
  application_context?: PayPalApplicationContext;
}

/**
 * PayPal 链接对象
 */
export interface PayPalLink {
  /** 链接关系：approve（批准链接）、self（自身）、update、capture */
  rel: string;
  /** 链接地址 */
  href: string;
  /** HTTP 方法 */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

/**
 * PayPal 订单响应
 */
export interface PayPalOrderResponse {
  /** 订单 ID */
  id: string;
  /** 订单状态：CREATED, APPROVED, VOIDED, COMPLETED, PAYER_ACTION_REQUIRED */
  status: string;
  /** 相关链接（包含 approve 链接等） */
  links?: PayPalLink[];
  /** 购买单元 */
  purchase_units?: PayPalPurchaseUnitResponse[];
  /** 创建时间 */
  create_time?: string;
}

/**
 * PayPal 捕获订单请求体
 */
export interface PayPalCaptureRequest {
  /** 可选的捕获参数 */
  [key: string]: any;
}

/**
 * PayPal HTTP 客户端类型导出
 */
export type PayPalHttpClient = import('@paypal/checkout-server-sdk').core.PayPalHttpClient;
