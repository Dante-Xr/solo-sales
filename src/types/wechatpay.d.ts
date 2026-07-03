/**
 * WeChat Pay SDK 类型定义
 * 对应 wechatpay-axios-plugin npm 包
 * 版本：0.7.x
 * 文档：https://github.com/wechatpay-apiv3/wechatpay-axios-plugin
 */

/**
 * SDK 配置接口
 */
export interface WechatpayConfig {
  /** 商户号 */
  mchid: string
  /** 商户证书序列号 */
  serial: string
  /** 商户私钥（PEM 格式） */
  privateKey: string
  /** APIv3 密钥 */
  apiv3Key: string
}

/**
 * Native 支付请求参数
 */
export interface NativePayRequest {
  /** 应用 ID */
  appid: string
  /** 商户号 */
  mchid: string
  /** 商户订单号 */
  out_trade_no: string
  /** 商品描述 */
  description: string
  /** 异步通知地址 */
  notify_url: string
  /** 订单金额 */
  amount: {
    /** 总金额（分） */
    total: number
    /** 货币类型，默认 CNY */
    currency: string
  }
}

/**
 * Native 支付响应
 */
export interface NativePayResponse {
  /** 二维码链接 */
  code_url: string
}

/**
 * 支付通知解密后的数据
 */
export interface WechatpayNotifyDecrypted {
  /** 商户订单号 */
  out_trade_no: string
  /** 微信支付订单号 */
  transaction_id: string
  /** 交易状态：SUCCESS, REFUND, NOTPAY, CLOSED, REVOKED, USERPAYING, PAYERROR */
  trade_state: string
  /** 支付完成时间 */
  success_time: string
  /** 订单金额 */
  amount: {
    /** 总金额（分） */
    total: number
    /** 货币类型 */
    currency: string
  }
}

/**
 * Webhook 通知加密资源
 */
export interface WechatpayNotifyResource {
  /** 加密算法类型，固定值 AEAD_AES_256_GCM */
  algorithm: string
  /** 密文 */
  ciphertext: string
  /** 随机串 */
  nonce: string
  /** 附加数据 */
  associated_data: string
}

/**
 * Webhook 通知原始数据
 */
export interface WechatpayNotifyBody {
  /** 通知 ID */
  id: string
  /** 通知创建时间 */
  create_time: string
  /** 通知类型 */
  event_type: string
  /** 通知数据类型 */
  resource_type: string
  /** 加密资源 */
  resource: WechatpayNotifyResource
}

/**
 * WeChat Pay SDK 类
 */
export interface Wechatpay {
  /** APIv3 接口 */
  v3: {
    pay: {
      transactions: {
        /**
         * Native 下单
         * @param params 请求参数
         * @returns 包含二维码链接的响应
         */
        native(params: NativePayRequest): Promise<{ data: NativePayResponse }>
      }
    }
  }
}

/**
 * Wechatpay 构造函数
 */
export interface WechatpayConstructor {
  new (config: WechatpayConfig): Wechatpay
}

export const Wechatpay: WechatpayConstructor

export default Wechatpay
