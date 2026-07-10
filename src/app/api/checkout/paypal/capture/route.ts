/**
 * PayPal Payment Success Callback
 *
 * 创建时间：2026-06-30
 * 功能：处理用户从 PayPal 返回后的支付确认
 *
 * GET /api/checkout/paypal/capture?token=xxx
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PayPalProvider } from "@/server/payments/providers/paypal-provider";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get("token"); // PayPal Order ID

    if (!token) {
      return NextResponse.json(
        { error: "缺少 PayPal 订单号" },
        { status: 400 },
      );
    }

    // 创建 PayPal Provider 实例
    const paypalProvider = new PayPalProvider();

    // 获取 PayPal 订单详情
    const paypalOrder = await paypalProvider.getOrderDetails(token);

    // 提取我们的订单 ID
    const orderId =
      paypalOrder.purchase_units?.[0]?.custom_id ||
      paypalOrder.purchase_units?.[0]?.reference_id;

    if (!orderId) {
      return NextResponse.json(
        { error: "无法找到关联的订单" },
        { status: 400 },
      );
    }

    // 查询我们的订单
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 如果订单已支付，直接返回
    if (order.status === "PAID") {
      return NextResponse.json({
        success: true,
        orderId,
        message: "订单已支付",
        alreadyProcessed: true,
      });
    }

    // 捕获支付（如果订单状态是 APPROVED）
    if (paypalOrder.status === "APPROVED") {
      const captureResult = await paypalProvider.captureOrder(token);

      // 检查捕获是否成功
      const captureStatus =
        captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.status;

      if (captureStatus === "COMPLETED") {
        // 提取事务ID（类型安全）
        const transactionId =
          captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.id;

        if (!transactionId) {
          return NextResponse.json(
            { error: "无法获取支付事务ID" },
            { status: 500 },
          );
        }

        // 更新订单状态为已支付
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "PAID",
            updatedAt: new Date(),
          },
        });

        // 创建支付记录
        await prisma.payment.create({
          data: {
            orderId,
            provider: "paypal",
            transactionId,
            amount: order.totalAmount,
            currency: "USD",
            status: "COMPLETED",
          },
        });

        return NextResponse.json({
          success: true,
          orderId,
          message: "支付成功",
          transactionId,
        });
      }
    }

    // 其他状态
    return NextResponse.json({
      success: false,
      orderId,
      message: `PayPal 订单状态：${paypalOrder.status}`,
      status: paypalOrder.status,
    });
  } catch (error: unknown) {
    console.error("PayPal capture error:", error);

    return NextResponse.json(
      {
        error: "支付确认失败",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
