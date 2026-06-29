'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Upload, Info, CheckCircle, Clock, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog'

interface QRCode {
  id: string
  type: string
  name: string
  imageUrl: string
  accountName: string
  isTempSolution: boolean
}

interface Order {
  id: string
  totalAmount: number
  status: string
  user: {
    name: string | null
    email: string
  }
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
      images: string[]
      price: number
    }
  }>
}

interface Props {
  order: Order
  qrCodes: QRCode[]
}

export function PaymentPageLayout({ order, qrCodes }: Props) {
  const [selectedQRCode, setSelectedQRCode] = useState(qrCodes[0])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStage, setUploadStage] = useState<string>('') // 上传阶段描述
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleUploadProof(file: File) {
    if (!selectedQRCode || !order) return

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('图片格式不支持，仅支持 JPG、PNG、WEBP 格式')
      return
    }

    // 验证文件大小（5MB）
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadError(`图片文件过大，不能超过 5MB。当前文件大小：${(file.size / 1024 / 1024).toFixed(2)}MB`)
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setUploadStage('准备上传...')
    setUploadError(null) // 清除之前的错误

    const formData = new FormData()
    formData.append('orderId', order.id)
    formData.append('proofImage', file)
    formData.append('paymentMethod', selectedQRCode.type)

    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    try {
      // 阶段 1: 上传图片 (0-30%)
      setUploadStage('正在上传图片...')
      setUploadProgress(10)

      await new Promise(resolve => setTimeout(resolve, 300))
      setUploadProgress(20)

      await new Promise(resolve => setTimeout(resolve, 300))
      setUploadProgress(30)

      console.log('开始上传到:', `/api/payment/proof`)

      // 阶段 2: 服务器接收 (30-40%)
      setUploadStage('服务器接收中...')
      const response = await fetch('/api/payment/proof', {
        method: 'POST',
        body: formData
      })

      setUploadProgress(40)
      console.log('上传响应状态:', response.status)

      // 阶段 3: 验证订单 (40-50%)
      setUploadStage('验证订单信息...')
      await new Promise(resolve => setTimeout(resolve, 300))
      setUploadProgress(50)

      // 阶段 4: 检查重复 (50-65%)
      setUploadStage('检查图片重复性...')
      await new Promise(resolve => setTimeout(resolve, 400))
      setUploadProgress(65)

      // 阶段 5: OCR 识别 (65-90%)
      setUploadStage('OCR 识别金额中...')
      await new Promise(resolve => setTimeout(resolve, 500))
      setUploadProgress(75)

      await new Promise(resolve => setTimeout(resolve, 400))
      setUploadProgress(85)

      // 阶段 6: 保存数据 (90-95%)
      setUploadStage('保存凭证信息...')
      setUploadProgress(90)

      const result = await response.json()
      console.log('上传结果:', result)

      if (!response.ok) {
        // 使用后端返回的详细错误信息
        const errorMessage = result.message || result.error || '上传失败，请重试'
        throw new Error(errorMessage)
      }

      // 阶段 7: 完成 (95-100%)
      setUploadStage('验证完成！')
      setUploadProgress(100)

      // 上传成功，延迟一下显示完成状态
      setTimeout(() => {
        setUploadResult(result)
        setUploading(false)
        setUploadStage('')

        if (result.success && result.status === 'OCR_MATCHED') {
          // OCR 匹配成功，3秒后跳转
          setTimeout(() => {
            window.location.href = `/orders/${order.id}`
          }, 3000)
        }
      }, 500)

    } catch (error: any) {
      console.error('上传错误:', error)
      const errorMessage = error.message || '上传失败，请重试'
      setUploadError(errorMessage)
      setUploadStage('')
      setUploadedImage(null)
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // 临时方案提示组件
  const TempNotice = () => selectedQRCode.isTempSolution ? (
    <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-yellow-800 dark:text-yellow-200">
          <p className="font-semibold mb-1">⚠️ 当前使用临时支付方案（人工审核）</p>
          <p>支付后请上传支付凭证截图，我们将在1-2小时内完成审核。待商户资质申请完成后，将升级为自动确认支付。</p>
        </div>
      </div>
    </div>
  ) : null

  // 订单信息卡片组件
  const OrderInfoCard = ({ compact = false }: { compact?: boolean }) => (
    <div className="bg-card border rounded-lg p-6">
      <h2 className={`font-semibold mb-4 ${compact ? 'text-base' : 'text-lg'}`}>订单信息</h2>
      <div className="space-y-4">
        {/* 用户信息 */}
        <div className="flex items-start gap-4 pb-4 border-b">
          <div className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0`}>
            <span className="text-brand font-semibold text-lg">
              {order.user.name?.[0] || order.user.email[0].toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">收货人</p>
            <p className="font-semibold">{order.user.name || '未填写'}</p>
            <p className="text-sm text-muted-foreground">{order.user.email}</p>
          </div>
        </div>

        {/* 订单号 */}
        <div className="pb-4 border-b">
          <p className="text-sm text-muted-foreground mb-1">订单号</p>
          <p className="font-mono text-sm break-all">{order.id}</p>
        </div>

        {/* 商品清单 */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">商品清单</p>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.product.images && item.product.images.length > 0 && (
                  <div className={`relative ${compact ? 'w-12 h-12' : 'w-16 h-16'} flex-shrink-0 rounded-lg overflow-hidden bg-muted border`}>
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${compact ? 'text-sm' : ''}`}>{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ${item.price} × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${compact ? 'text-base' : 'text-lg'}`}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 订单金额 */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <p className={`font-semibold ${compact ? 'text-base' : 'text-lg'}`}>订单总额</p>
            <p className={`font-bold text-brand ${compact ? 'text-2xl' : 'text-4xl'}`}>
              ${order.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  // 收款码卡片组件
  const QRCodeCard = ({ compact = false }: { compact?: boolean }) => (
    <div className="bg-card border rounded-lg p-6">
      <h2 className={`font-semibold mb-4 text-center ${compact ? 'text-base' : 'text-lg'}`}>
        扫码支付
      </h2>

      {/* 收款码选择 */}
      {qrCodes.length > 1 && (
        <div className={`flex ${compact ? 'flex-row gap-2' : 'flex-col gap-3'} mb-4`}>
          {qrCodes.map((qr) => (
            <button
              key={qr.id}
              onClick={() => setSelectedQRCode(qr)}
              className={`p-3 border-2 rounded-lg transition-colors ${compact ? 'flex-1' : ''} ${
                selectedQRCode.id === qr.id
                  ? 'border-brand bg-brand/5'
                  : 'border-border hover:border-brand/50'
              }`}
            >
              <p className="font-semibold text-sm">{qr.name}</p>
              <p className="text-xs text-muted-foreground">{qr.accountName}</p>
            </button>
          ))}
        </div>
      )}

      {/* 收款码 */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">
          {selectedQRCode.name.includes('支付宝') ? '支付宝' : '微信'}扫码支付
        </p>

        <div className={`relative ${compact ? 'w-64 h-64' : 'w-full aspect-square'} mx-auto mb-4 bg-muted/30 rounded-lg overflow-hidden`}>
          <Image
            src={selectedQRCode.imageUrl}
            alt={selectedQRCode.name}
            fill
            className="object-contain p-4"
            priority
          />
        </div>

        <div className="space-y-1">
          <p className="text-3xl font-bold text-brand">${order.totalAmount.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">收款人：{selectedQRCode.accountName}</p>
        </div>
      </div>
    </div>
  )

  // 上传区域组件
  const UploadSection = ({ inputId }: { inputId: string }) => {
    if (uploadResult) {
      if (uploadResult.status === 'OCR_MATCHED') {
        return (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-green-900 dark:text-green-100 font-semibold text-lg mb-2">
                  🎉 支付已自动确认！
                </p>
                <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                  系统已自动识别您的支付凭证，订单支付已确认。感谢您的购买！
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  正在跳转到订单详情...
                </p>
              </div>
            </div>

            {/* 预览已上传的图片 */}
            {uploadedImage && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-green-800 dark:text-green-200">已上传的凭证</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                  >
                    查看大图
                  </Button>
                </div>
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-green-200">
                  <Image
                    src={uploadedImage}
                    alt="支付凭证"
                    fill
                    className="object-cover cursor-pointer"
                    onClick={() => setShowPreview(true)}
                  />
                </div>
              </div>
            )}
          </div>
        )
      }

      return (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <Clock className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-green-900 dark:text-green-100 font-semibold text-lg mb-2">
                ✅ 支付凭证已提交
              </p>
              <p className="text-sm text-green-800 dark:text-green-200">
                {uploadResult.message}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                我们将在1-2小时内完成审核，请耐心等待。审核完成后会通过邮件通知您。
              </p>
            </div>
          </div>

          {/* 预览已上传的图片 */}
          {uploadedImage && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-green-800 dark:text-green-200">已上传的凭证</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                >
                  查看大图
                </Button>
              </div>
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-green-200">
                <Image
                  src={uploadedImage}
                  alt="支付凭证"
                  fill
                  className="object-cover cursor-pointer"
                  onClick={() => setShowPreview(true)}
                />
              </div>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start gap-3 mb-4">
          <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h2 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              支付完成后，请上传支付凭证
            </h2>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• 截图支付成功页面，包含金额和交易单号</li>
              <li>• 支持格式：JPG、PNG、WEBP</li>
              <li>• 文件大小：最大 5MB</li>
              <li>• 系统将自动识别金额，匹配后立即确认订单</li>
            </ul>
          </div>
        </div>

        {/* 上传进度 */}
        {uploading && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-900 dark:text-blue-100 font-medium">
                {uploadStage}
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {uploadProgress}%
              </span>
            </div>
            <Progress value={uploadProgress} max={100} />

            {/* 详细阶段说明 */}
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1 pl-1">
              {uploadProgress < 40 && (
                <p>📤 正在传输图片到服务器...</p>
              )}
              {uploadProgress >= 40 && uploadProgress < 50 && (
                <p>✅ 服务器已接收，正在验证订单信息...</p>
              )}
              {uploadProgress >= 50 && uploadProgress < 65 && (
                <p>🔍 检查图片是否重复使用...</p>
              )}
              {uploadProgress >= 65 && uploadProgress < 90 && (
                <p>🤖 使用 OCR 技术识别支付金额...</p>
              )}
              {uploadProgress >= 90 && uploadProgress < 100 && (
                <p>💾 保存凭证信息到数据库...</p>
              )}
              {uploadProgress >= 100 && (
                <p>🎉 所有验证通过，处理完成！</p>
              )}
            </div>
          </div>
        )}

        {/* 已上传图片预览（上传中或上传后） */}
        {uploadedImage && !uploadResult && !uploadError && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-blue-800 dark:text-blue-200">预览</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPreview(true)}
              >
                查看大图
              </Button>
            </div>
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-blue-200">
              <Image
                src={uploadedImage}
                alt="支付凭证预览"
                fill
                className="object-cover cursor-pointer"
                onClick={() => setShowPreview(true)}
              />
            </div>
          </div>
        )}

        {/* 上传错误提示 */}
        {uploadError && (
          <div className="mb-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-300 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                  <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">❌ 上传失败</h3>
                <p className="text-sm text-red-800 dark:text-red-200 mb-2">{uploadError}</p>

                {/* 根据错误类型显示帮助提示 */}
                {uploadError.includes('格式') && (
                  <p className="text-xs text-red-700 dark:text-red-300 mb-3 bg-red-100 dark:bg-red-900/30 rounded px-2 py-1">
                    💡 提示：请使用手机截图或相册中的支付凭证图片
                  </p>
                )}
                {uploadError.includes('过大') && (
                  <p className="text-xs text-red-700 dark:text-red-300 mb-3 bg-red-100 dark:bg-red-900/30 rounded px-2 py-1">
                    💡 提示：可以使用微信"图片编辑"功能压缩图片后再上传
                  </p>
                )}
                {uploadError.includes('已上传') && (
                  <p className="text-xs text-red-700 dark:text-red-300 mb-3 bg-red-100 dark:bg-red-900/30 rounded px-2 py-1">
                    💡 提示：如需修改凭证，请联系客服处理
                  </p>
                )}
                {uploadError.includes('重复') && (
                  <p className="text-xs text-red-700 dark:text-red-300 mb-3 bg-red-100 dark:bg-red-900/30 rounded px-2 py-1">
                    💡 提示：每张支付凭证只能使用一次，请上传本次订单的支付截图
                  </p>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/50"
                  onClick={() => {
                    setUploadError(null)
                    setUploadedImage(null)
                  }}
                >
                  重新上传
                </Button>
              </div>
            </div>
          </div>
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => e.target.files?.[0] && handleUploadProof(e.target.files[0])}
          className="hidden"
          id={inputId}
          disabled={uploading}
        />
        <label htmlFor={inputId}>
          <Button
            type="button"
            size="lg"
            className="cursor-pointer w-full sm:w-auto"
            disabled={uploading}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(inputId)?.click()
            }}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                上传中...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                选择并上传支付凭证
              </>
            )}
          </Button>
        </label>
      </div>
    )
  }

  return (
    <>
      {/* 图片预览对话框 */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">支付凭证预览</h2>
              <DialogClose asChild>
                <button
                  type="button"
                  className="rounded-md p-2 hover:bg-accent transition-colors"
                  aria-label="关闭"
                >
                  <X className="h-4 w-4" />
                </button>
              </DialogClose>
            </div>
            {uploadedImage && (
              <div className="relative w-full aspect-[3/4] max-h-[70vh] rounded-lg overflow-hidden bg-muted">
                <Image
                  src={uploadedImage}
                  alt="支付凭证"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-background">
      {/* PC端布局：左右分栏 */}
      <div className="hidden lg:block">
        <div className="container max-w-7xl py-8 px-4">
          <h1 className="text-3xl font-bold mb-8">扫码支付</h1>

          <div className="grid grid-cols-3 gap-6">
            {/* 左侧：订单信息（占2列） */}
            <div className="col-span-2 space-y-6">
              <TempNotice />
              <OrderInfoCard />
              <UploadSection inputId="proof-upload-pc" />
            </div>

            {/* 右侧：收款码（占1列，固定在视口） */}
            <div className="col-span-1">
              <div className="sticky top-8">
                <QRCodeCard />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 移动端布局：垂直排列 */}
      <div className="lg:hidden">
        <div className="container max-w-2xl py-6 px-4 space-y-6">
          <h1 className="text-2xl font-bold">扫码支付</h1>
          <TempNotice />
          <OrderInfoCard compact />
          <QRCodeCard compact />
          <UploadSection inputId="proof-upload-mobile" />
        </div>
      </div>
    </div>
    </>
  )
}
