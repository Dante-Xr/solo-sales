import { TriggerType, SequenceStatus, EnrollmentStatus, EmailSendStatus } from '@prisma/client'

export interface SequenceTrigger {
  type: TriggerType
  userId: string
  data?: Record<string, unknown>
}

export interface SequenceStepData {
  id: string
  name: string
  order: number
  templateId: string
  delayHours: number
  condition?: Record<string, unknown>
  isActive: boolean
}

export interface EnrollmentData {
  id: string
  sequenceId: string
  userId: string
  userEmail: string
  currentStep: number
  status: EnrollmentStatus
  enrolledAt: Date
  triggerData?: Record<string, unknown>
}

export interface EmailTemplateData {
  id: string
  subject: string
  body: string
  variables?: string[]
}

export interface SequenceExecutionResult {
  success: boolean
  enrollmentId: string
  stepId: string
  emailSent: boolean
  error?: string
}

export {
  TriggerType,
  SequenceStatus,
  EnrollmentStatus,
  EmailSendStatus
}

export const TRIGGER_LABELS: Record<TriggerType, string> = {
  ORDER_PLACED: '订单创建',
  ORDER_PAID: '订单支付',
  ORDER_SHIPPED: '订单发货',
  ORDER_DELIVERED: '订单送达',
  CART_ABANDONED: '购物车废弃',
  PRODUCT_VIEWED: '商品浏览',
  CUSTOMER_INACTIVE: '客户沉睡',
  BIRTHDAY: '生日',
  FIRST_PURCHASE: '首次购买',
  MEMBERSHIP_TIER: '会员等级变更'
}

export const STATUS_LABELS: Record<EnrollmentStatus, string> = {
  ACTIVE: '进行中',
  COMPLETED: '已完成',
  UNENROLLED: '已取消',
  FAILED: '失败',
  PAUSED: '已暂停'
}