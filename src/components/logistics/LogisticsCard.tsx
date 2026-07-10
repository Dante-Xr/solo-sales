"use client"

import { Truck, Package, CheckCircle2, Clock } from "lucide-react"

// 物流信息接口
interface LogisticsInfo {
  trackingNumber?: string    // 运单号
  carrier?: string          // 快递公司
  status?: string          // 物流状态
  estimatedDelivery?: string  // 预计送达时间
  events?: Array<{          // 物流事件列表
    time: string           // 事件时间
    description: string     // 事件描述
    location: string        // 事件地点
  }>
}

// 物流信息卡片组件 Props
interface LogisticsCardProps {
  logistics: LogisticsInfo  // 物流信息
}

// 物流信息展示卡片组件
// 用于订单详情页展示物流追踪信息
export function LogisticsCard({ logistics }: LogisticsCardProps) {
  // 无物流信息时显示空状态
  if (!logistics.trackingNumber) {
    return (
      <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
        <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground">暂无物流信息</p>
        <p className="text-sm text-muted-foreground mt-1">
          商家发货后将显示运单号
        </p>
      </div>
    )
  }

  // 有物流信息时显示完整卡片
  return (
    <div className="bg-info/10 border border-info/20 rounded-lg p-4 space-y-4">
      {/* 快递信息头部 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <Truck className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-medium">
            {logistics.carrier || "快递运输中"}
          </p>
          <p className="text-sm text-muted-foreground font-mono">
            {logistics.trackingNumber}
          </p>
        </div>
      </div>

      {/* 预计送达时间 */}
      {logistics.estimatedDelivery && (
        <div className="bg-card rounded-md p-3">
          <p className="text-sm text-muted-foreground">预计送达</p>
          <p className="font-medium">{logistics.estimatedDelivery}</p>
        </div>
      )}

      {/* 物流动态时间线 */}
      {logistics.events && logistics.events.length > 0 && (
        <div className="space-y-3">
          <p className="font-medium text-sm">物流动态</p>
          <div className="space-y-2">
            {logistics.events.map((event, index) => (
              <div key={index} className="flex gap-3 text-sm">
                {/* 时间线圆点 */}
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  {/* 连接线 */}
                  {index < logistics.events!.length - 1 && (
                    <div className="w-0.5 h-8 bg-blue-300" />
                  )}
                </div>
                {/* 事件信息 */}
                <div className="flex-1 pb-4">
                  <p className="font-medium">{event.description}</p>
                  <p className="text-muted-foreground text-xs">{event.location}</p>
                  <p className="text-muted-foreground text-xs">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 配送说明 */}
      <div className="flex items-center gap-2 text-sm text-brand">
        <Package className="w-4 h-4" />
        <span>由 {logistics.carrier || "快递公司"} 配送</span>
      </div>
    </div>
  )
}
