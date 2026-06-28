'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Upload, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QRCode {
  id: string
  type: string
  imageUrl: string
  accountName: string
  amount: number
  isTempSolution: boolean
  notice: string
}

interface Order {
  id: string
  totalAmount: number
  status: string
}

export default function QRCodePaymentPage({
  params
}: {
  params: { orderId: string; locale: string }
}) {
  const [qrcode, setQrcode] = useState<QRCode | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)

  useEffect(() => {
    loadOrderAndQRCode()
  }, [params.orderId])

  async function loadOrderAndQRCode() {
    try {
      // 1. 获取订单信息
      const orderRes = await fetch(`/api/orders/${params.orderId}`)
      if (!orderRes.ok) throw new Error('Order not found')
      const orderData = await orderRes.json()
      setOrder(orderData)

      // 2. 获取收款码
      const qrcodeRes = await fetch(
        `/api/payment/qrcode?amount=${orderData.totalAmount}`
      )
      if (!qrcodeRes.ok) throw new Error('QR code not available')
      const qrcodeData = await qrcodeRes.json()
      setQrcode(qrcodeData.qrcode)
    } catch (error) {
      console.error('Failed to load:', error)
      alert('加载失败，请刷新页面重试')
    }
  }

  async function handleUploadProof(file: File) {
    setUploading(true)

    const formData = new FormData()
    formData.append('orderId', params.orderId)
    formData.append('proofImage', file)
    formData.append('paymentMethod', qrcode!.type + '_qrcode')

    try {
      const response = await fetch('/api/payment/proof', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      setUploadResult(result)

      if (result.success && result.status === 'OCR_MATCHED') {
        // OCR自动通过，3秒后跳转
        setTimeout(() => {
          window.location.href = `/${params.locale}/orders/${params.orderId}`
        }, 3000)
      }
    } catch (error: any) {
      alert('上传失败：' + error.message)
    } finally {
      setUploading(false)
    }
  }

  if (!qrcode || !order) {
    return (
      <div className="container max-w-2xl py-8">
        <div className="text-center">加载中...</div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-8">
      {/* ⚠️ 临时方案提示 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold">当前使用人工审核方案</p>
            <p>{qrcode.notice}</p>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4">扫码支付</h1>

      {/* 收款码 */}
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            请使用{qrcode.type === 'merchant_alipay' ? '支付宝' : '微信'}扫描下方二维码
          </p>

          <div className="relative w-64 h-64 mx-auto my-4 bg-gray-100 rounded">
            <Image
              src={qrcode.imageUrl}
              alt="收款码"
              fill
              className="object-contain"
            />
          </div>

          <p className="text-3xl font-bold text-primary">¥{order.totalAmount}</p>
          <p className="text-sm text-gray-500 mt-2">收款人：{qrcode.accountName}</p>
        </div>
      </div>

      {/* 上传凭证 */}
      {!uploadResult ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="font-semibold mb-2">支付完成后，请上传支付凭证</h2>
          <p className="text-sm text-gray-600 mb-4">
            请截图支付成功页面，包含金额和交易单号
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleUploadProof(e.target.files[0])}
            className="hidden"
            id="proof-upload"
            disabled={uploading}
          />
          <label htmlFor="proof-upload">
            <Button
              as="span"
              size="lg"
              className="cursor-pointer"
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? '上传中...' : '上传支付凭证'}
            </Button>
          </label>
        </div>
      ) : uploadResult.status === 'OCR_MATCHED' ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-green-800 font-semibold text-lg">🎉 支付已自动确认！</p>
          <p className="text-sm text-gray-600 mt-2">
            系统已自动识别您的支付凭证，订单支付已确认
          </p>
          <p className="text-sm text-gray-500 mt-4">正在跳转到订单详情...</p>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-green-800 font-semibold">✅ 支付凭证已提交</p>
          <p className="text-sm text-gray-600 mt-2">{uploadResult.message}</p>
        </div>
      )}
    </div>
  )
}
