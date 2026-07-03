/**
 * Alipay SDK 类型定义
 * 对应 alipay-sdk npm 包
 * 版本：3.x
 * 文档：https://github.com/alipay/alipay-sdk-nodejs-all
 */

/**
 * SDK 配置接口
 */
export interface AlipaySdkConfig {
  /** 应用 ID */
  appId: string
  /** 应用私钥 */
  privateKey: string
  /** 支付宝公钥 */
  alipayPublicKey: string
  /** 网关地址 */
  gateway?: string
  /** 字符集，默认 utf-8 */
  charset?: string
  /** 签名类型，默认 RSA2 */
  signType?: string
}

/**
 * alipay.trade.page.pay 请求参数
 */
export interface AlipayExecParams {
  /** 业务参数 */
  bizContent: {
    /** 商户订单号 */
    out_trade_no: string
    /** 订单总金额（元），精确到小数点后两位 */
    total_amount: string
    /** 订单标题 */
    subject: string
    /** 产品码，固定值 FAST_INSTANT_TRADE_PAY */
    product_code: string
  }
  /** 同步回调地址 */
  returnUrl?: string
  /** 异步通知地址 */
  notifyUrl?: string
}

/**
 * 支付宝异步通知参数
 */
export interface AlipayNotifyParams {
  /** 交易状态：WAIT_BUYER_PAY, TRADE_CLOSED, TRADE_SUCCESS, TRADE_FINISHED */
  trade_status: string
  /** 商户订单号 */
  out_trade_no: string
  /** 支付宝交易号 */
  trade_no: string
  /** 交易金额 */
  total_amount: string
  /** 交易付款时间 */
  gmt_payment: string
  /** 其他可选字段 */
  [key: string]: string | undefined
}

/**
 * SDK 响应类型
 */
export interface AlipayResponse<T = any> {
  code: string
  msg: string
  data?: T
}

/**
 * Alipay SDK 类
 */
export class AlipaySdk {
  constructor(config: AlipaySdkConfig)

  /**
   * 执行 API 调用
   * @param method API 方法名，如 'alipay.trade.page.pay'
   * @param params 请求参数
   * @returns 支付 URL（针对 page.pay 方法）
   */
  exec(method: string, params: AlipayExecParams): Promise<string>

  /**
   * 验证异步通知签名
   * @param params 通知参数对象
   * @returns 签名是否有效
   */
  checkNotifySign(params: AlipayNotifyParams): boolean
}

export default AlipaySdk
