'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'

interface PaymentProof {
  id: string
  orderId: string
  amount: number
  proofImageUrl: string
  paymentMethod: string
  status: string
  ocrAmount: number | null
  ocrConfidence: number | null
  ocrTimestamp: string | null
  isOcrMatched: boolean
  createdAt: string
  order: {
    id: string
    totalAmount: number
    user: {
      name: string
      email: string
    }
  }
}

export default function PaymentProofReviewPage() {
  const [proofs, setProofs] = useState<PaymentProof[]>([])
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingProofs()
  }, [])

  async function fetchPendingProofs() {
    try {
      const response = await fetch('/api/admin/payment/proof/pending')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setProofs(data.proofs)
    } catch (error) {
      console.error('Failed to fetch proofs:', error)
      alert('加载失败，请刷新页面')
    } finally {
      setLoading(false)
    }
  }

  async function handleReview(proofId: string, action: 'approve' | 'reject') {
    let rejectReason: string | null = null

    if (action === 'reject') {
      rejectReason = prompt('请输入拒绝原因：')
      if (!rejectReason) return // 用户取消
    }

    try {
      const response = await fetch(`/api/admin/payment/proof/${proofId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejectReason })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Review failed')
      }

      alert('审核完成')
      setSelectedProof(null)
      fetchPendingProofs() // Reload list
    } catch (error: any) {
      alert('审核失败：' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">加载中...</div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">支付凭证审核</h1>
        <p className="text-sm text-gray-600">
          ⚠️ 当前为人工审核模式，建议尽快升级为自动化支付
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 待审核列表 */}
        <div className="space-y-4">
          <h2 className="font-semibold">待审核 ({proofs.length})</h2>

          {proofs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无待审核凭证</div>
          ) : (
            proofs.map((proof) => (
              <div
                key={proof.id}
                className={`border rounded-lg p-4 cursor-pointer transition ${
                  selectedProof?.id === proof.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedProof(proof)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">
                      订单 #{proof.orderId.slice(0, 8)}
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      ¥{proof.amount}
                    </p>

                    {/* OCR识别结果 */}
                    {proof.ocrAmount !== null && (
                      <div className="mt-2 text-sm">
                        <p
                          className={
                            proof.isOcrMatched
                              ? 'text-green-600'
                              : 'text-orange-600'
                          }
                        >
                          OCR识别：¥{proof.ocrAmount}
                          {proof.isOcrMatched ? ' ✓ 匹配' : ' ⚠ 不匹配'}
                        </p>
                        {proof.ocrConfidence !== null && (
                          <p className="text-gray-500">
                            置信度：{(proof.ocrConfidence * 100).toFixed(0)}%
                          </p>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      用户：{proof.order.user.name || proof.order.user.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(proof.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 凭证详情 */}
        {selectedProof ? (
          <div className="border rounded-lg p-6 sticky top-4">
            <h2 className="font-semibold mb-4">凭证详情</h2>

            {/* 支付凭证图片 */}
            <div className="relative w-full h-96 mb-4 bg-gray-100 rounded border">
              <Image
                src={selectedProof.proofImageUrl}
                alt="支付凭证"
                fill
                className="object-contain"
              />
            </div>

            {/* 订单信息 */}
            <div className="mb-4 p-3 bg-gray-50 rounded text-sm space-y-1">
              <p>
                <strong>订单金额：</strong>¥{selectedProof.order.totalAmount}
              </p>
              <p>
                <strong>支付方式：</strong>
                {selectedProof.paymentMethod.includes('alipay')
                  ? '支付宝'
                  : '微信'}
              </p>
              {selectedProof.ocrAmount && (
                <>
                  <p>
                    <strong>OCR金额：</strong>¥{selectedProof.ocrAmount}
                  </p>
                  <p>
                    <strong>匹配状态：</strong>
                    <span
                      className={
                        selectedProof.isOcrMatched
                          ? 'text-green-600'
                          : 'text-orange-600'
                      }
                    >
                      {selectedProof.isOcrMatched ? '✓ 匹配' : '⚠ 不匹配'}
                    </span>
                  </p>
                </>
              )}
            </div>

            {/* 审核按钮 */}
            <div className="flex gap-4">
              <Button
                onClick={() => handleReview(selectedProof.id, 'approve')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                审核通过
              </Button>
              <Button
                onClick={() => handleReview(selectedProof.id, 'reject')}
                variant="outline"
                className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
              >
                <XCircle className="mr-2 h-4 w-4" />
                审核拒绝
              </Button>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-6 flex items-center justify-center text-gray-500">
            请选择一个凭证查看详情
          </div>
        )}
      </div>
    </div>
  )
}
