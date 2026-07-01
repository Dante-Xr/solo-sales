/**
 * 环境变量检查脚本
 */
require('dotenv').config({ path: '.env.local' })

const requiredVars = [
  'DATABASE_URL',
  'BETTER_AUTH_URL',
  'BETTER_AUTH_SECRET',
  'NEXT_PUBLIC_APP_URL'
]

const paypalVars = [
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
  'PAYPAL_MODE'
]

const optionalVars = [
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'STRIPE_PUBLIC_KEY',
  'STRIPE_SECRET_KEY',
  'PAYPAL_WEBHOOK_ID'
]

console.log('🔍 环境变量检查\n')
console.log('=' .repeat(60))

// 检查必需变量
console.log('\n📋 必需变量:')
let hasError = false
requiredVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: 已配置`)
  } else {
    console.log(`❌ ${varName}: 未配置`)
    hasError = true
  }
})

// 检查 PayPal 变量
console.log('\n💳 PayPal 配置:')
const enabledProviders = process.env.ENABLED_PAYMENT_PROVIDERS || ''
const paypalEnabled = enabledProviders.includes('paypal')

console.log(`PayPal 状态: ${paypalEnabled ? '✅ 已启用' : '⚠️  未启用'}`)

if (paypalEnabled) {
  paypalVars.forEach(varName => {
    const value = process.env[varName]
    if (value) {
      if (varName.includes('SECRET')) {
        console.log(`✅ ${varName}: 已配置 (隐藏)`)
      } else {
        console.log(`✅ ${varName}: ${value}`)
      }
    } else {
      console.log(`❌ ${varName}: 未配置`)
      hasError = true
    }
  })
}

// 检查可选变量
console.log('\n📦 可选配置:')
optionalVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: 已配置`)
  } else {
    console.log(`⚠️  ${varName}: 未配置`)
  }
})

console.log('\n' + '='.repeat(60))

if (hasError) {
  console.log('\n❌ 配置不完整，请检查 .env.local 文件')
  process.exit(1)
} else {
  console.log('\n✅ 环境变量配置完整')
}
