/**
 * PayPal Payment Button Component
 *
 * 创建时间：2026-06-30
 * 功能：在订单确认页面显示 PayPal 支付按钮
 *
 * 使用方式：
 * <PayPalButton orderId="xxx" amount={100} locale="en" />
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PayPalButtonProps {
  orderId: string;
  amount: number;
  locale?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PayPalButton({
  orderId,
  locale = "en",
  onError,
}: PayPalButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayPalCheckout = async () => {
    setLoading(true);

    try {
      // 调用后端创建 PayPal 订单
      const response = await fetch("/api/checkout/paypal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create PayPal payment");
      }

      if (data.redirectUrl) {
        // 跳转到 PayPal 支付页面
        window.location.href = data.redirectUrl;
      } else {
        throw new Error("No redirect URL returned");
      }
    } catch (error: unknown) {
      console.error("PayPal checkout error:", error);
      const message = error instanceof Error ? error.message : "PayPal 支付创建失败";
      toast.error(message);

      if (onError) {
        onError(message);
      }

      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayPalCheckout}
      disabled={loading}
      className="w-full bg-[#0070ba] hover:bg-[#003087] text-white font-semibold"
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          创建支付中...
        </>
      ) : (
        <>
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.032.17a.804.804 0 0 1-.794.679H7.72a.483.483 0 0 1-.477-.558L7.418 21l1.177-7.483a.956.956 0 0 1 .942-.806h2.85c3.678 0 6.543-1.508 7.38-5.864a4.131 4.131 0 0 0 .3-1.37z" />
            <path d="M6.124 6.124c.097-.547.483-.99 1.012-1.138C8.235 4.525 9.443 4.403 10.8 4.403h5.993c.7 0 1.36.062 1.962.19.187.04.368.083.542.132.174.05.341.105.5.165a5.446 5.446 0 0 1 .868.41c.5.806.673 1.75.485 2.79-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.032.17a.804.804 0 0 1-.794.679H7.72a.483.483 0 0 1-.477-.558l1.178-7.483.796-5.055a.956.956 0 0 1 .942-.806z" />
          </svg>
          PayPal 支付
        </>
      )}
    </Button>
  );
}
