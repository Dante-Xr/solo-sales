/**
 * PayPal Checkout API
 *
 * 创建时间：2026-06-30
 * 功能：创建 PayPal 订单并返回支付链接
 *
 * POST /api/checkout/paypal
 * Body: { orderId: string, locale?: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentProviderFactory } from "@/server/payments/factory";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, locale = "en" } = body;

    // 验证必填参数
    if (!orderId) {
      return NextResponse.json({ error: "缺少订单号" }, { status: 400 });
    }

    // 查询订单
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 检查订单状态
    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "订单状态不正确，无法支付" },
        { status: 400 },
      );
    }

    // 获取 PayPal Provider
    const paypalProvider = PaymentProviderFactory.getProvider("paypal");

    // 创建支付会话
    const paymentAction = await paypalProvider.createPaymentSession({
      orderId: order.id,
      amount: Number(order.totalAmount),
      currency: "USD", // 根据订单或用户地区配置
      locale,
      metadata: {
        userId: order.userId,
        userEmail: order.user.email,
      },
    });

    // 返回支付链接
    if (paymentAction.type === "redirect") {
      return NextResponse.json({
        success: true,
        redirectUrl: paymentAction.url,
        orderId: order.id,
      });
    }

    return NextResponse.json({ error: "PayPal 支付创建失败" }, { status: 500 });
  } catch (error: unknown) {
    console.error("PayPal checkout error:", error);
    const details = error instanceof Error ? error.message : "Unknown error";

    // 友好的错误提示
    let errorMessage = "创建支付失败，请稍后重试";

    if (details.includes("not enabled")) {
      errorMessage = "PayPal 支付未启用，请联系管理员";
    } else if (details.includes("not configured")) {
      errorMessage = "PayPal 配置不完整，请联系管理员";
    }

    return NextResponse.json(
      { error: errorMessage, details },
      { status: 500 },
    );
  }
}
