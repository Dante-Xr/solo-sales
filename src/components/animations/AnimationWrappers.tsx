/**
 * ============================================
 * 动画包装组件
 * ============================================
 * 创建时间：2026-06-27 16:45:00 +08:00
 * 创建依据：UI设计师专家建议 - P3优先级
 * 功能说明：
 *   - 提供常用动画包装组件
 *   - 简化动画使用
 *   - 统一动画效果
 * ============================================
 */
'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { fadeIn, slideUp, scaleIn, pageTransition } from '@/lib/animations'

interface AnimationWrapperProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

/**
 * 淡入组件
 */
export function FadeIn({ children, delay = 0, className = '' }: AnimationWrapperProps) {
  return (
    <motion.div
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 向上滑入组件
 */
export function SlideUp({ children, delay = 0, className = '' }: AnimationWrapperProps) {
  return (
    <motion.div
      initial={slideUp.initial}
      animate={slideUp.animate}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 缩放进入组件
 */
export function ScaleIn({ children, delay = 0, className = '' }: AnimationWrapperProps) {
  return (
    <motion.div
      initial={scaleIn.initial}
      animate={scaleIn.animate}
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 页面过渡组件
 */
export function PageTransition({ children, className = '' }: Omit<AnimationWrapperProps, 'delay'>) {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 交错动画容器
 */
export function StaggerContainer({ children, className = '' }: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 交错动画项
 */
export function StaggerItem({ children, className = '' }: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
