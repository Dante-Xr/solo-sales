# SoloSales 框架迁移详细执行计划

> 基于 `framework-replacement-analysis-v0.8.2.md` 第十一项"推荐迁移顺序"

---

## Phase 1: 零成本修复

### 1.1 启用 next-themes（替代自建 ThemeProvider）

**当前文件**: `src/components/providers/ThemeProvider.tsx` (78行自建)
**目标**: 使用已安装的 `next-themes` 包

#### 步骤

1. **修改 `src/components/providers/ThemeProvider.tsx`**
   - 删除全部自建代码
   - 替换为 next-themes 的 ThemeProvider 导出
   ```tsx
   "use client"
   import { ThemeProvider as NextThemesProvider } from "next-themes"
   import { ReactNode } from "react"
   
   export function ThemeProvider({ children }: { children: ReactNode }) {
     return (
       <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
         {children}
       </NextThemesProvider>
     )
   }
   
   export { useTheme } from "next-themes"
   ```

2. **更新所有消费文件的 useTheme 调用**
   - 当前 API: `const { theme, resolvedTheme, setTheme } = useTheme()`
   - next-themes API: `const { theme, resolvedTheme, setTheme } = useTheme()` 
   - **API 完全兼容**，无需修改消费文件

3. **修改 `src/app/layout.tsx`**
   - 移除 `CombinedThemeAuthProvider`，直接使用新的 ThemeProvider
   - `<html>` 标签添加 `suppressHydrationWarning`（已有）

4. **删除 `src/app/page.tsx` 中的 mounted 状态检查**
   - next-themes 内置处理 hydration，不再需要手动 `mounted` 状态

5. **验证**
   - 主题切换正常
   - 无 hydration 错误
   - 暗色/亮色模式正确

#### 影响文件
- `src/components/providers/ThemeProvider.tsx` (重写)
- `src/app/layout.tsx` (简化)
- `src/app/page.tsx` (移除 mounted 检查)
- `src/app/cart/page.tsx` (移除 mounted 检查)
- `src/app/search/page.tsx` (移除 mounted 检查)
- `src/app/product/[id]/page.tsx` (移除 mounted 检查)

---

### 1.2 启用 TanStack Query（替代手动 fetch）

**当前状态**: `@tanstack/react-query` + `devtools` 已安装，QueryProvider 已配置，但 0 处使用

#### 步骤

1. **创建 API 客户端工具** `src/lib/api-client.ts`
   ```ts
   const API_BASE = ""
   
   export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
     const res = await fetch(`${API_BASE}${endpoint}`, {
       headers: { "Content-Type": "application/json", ...options?.headers },
       ...options,
     })
     if (!res.ok) throw new Error(`API Error: ${res.status}`)
     return res.json()
   }
   ```

2. **创建自定义 Hooks** 
   - `src/hooks/useProducts.ts` - 商品查询
   - `src/hooks/useOrders.ts` - 订单查询
   - `src/hooks/useTrending.ts` - 热搜查询

3. **迁移前台页面数据获取**
   - `src/app/orders/page.tsx`: `useEffect + fetch` → `useQuery`
   - `src/app/orders/[id]/page.tsx`: `useEffect + fetch` → `useQuery`
   - `src/app/search/page.tsx`: `useEffect + fetch` → `useQuery`
   - `src/app/admin/products/page.tsx`: `useEffect + fetch` → `useQuery`
   - `src/app/admin/orders/page.tsx`: `useEffect + fetch` → `useQuery`

4. **迁移购物车操作为 useMutation**
   - `src/app/cart/page.tsx`: 添加/删除/更新数量 → `useMutation` + 乐观更新

5. **验证**
   - 数据加载正常
   - 缓存生效（切换页面不重复请求）
   - DevTools 可用

#### 影响文件
- 新增: `src/lib/api-client.ts`, `src/hooks/useProducts.ts`, `src/hooks/useOrders.ts`
- 修改: 5-10个页面的数据获取逻辑

---

## Phase 2: 安全修复

### 2.1 Better Auth（替代双重认证体系）

**当前文件**: 
- `src/lib/adminAuth.ts` (218行, Base64 Token)
- `src/app/api/auth/[...nextauth]/route.ts` (NextAuth)
- `src/components/providers/AuthProvider.tsx` (SessionProvider)

#### 步骤

1. **安装 Better Auth**
   ```bash
   npm install better-auth
   ```

2. **创建 Better Auth 配置** `src/lib/auth.ts`
   ```ts
   import { betterAuth } from "better-auth"
   import { prismaAdapter } from "better-auth/adapters/prisma"
   import { admin, twoFactor } from "better-auth/plugins"
   import { prisma } from "./prisma"
   
   export const auth = betterAuth({
     database: prismaAdapter(prisma),
     emailAndPassword: { enabled: true },
     plugins: [admin(), twoFactor()],
     session: { expiresIn: 60 * 60 * 24 * 7 },
   })
   
   export type Auth = typeof auth
   ```

3. **创建 Better Auth API 路由** `src/app/api/auth/[...all]/route.ts`
   ```ts
   import { auth } from "@/lib/auth"
   import { toNextJsHandler } from "better-auth/next-js"
   
   export const { GET, POST } = toNextJsHandler(auth)
   ```

4. **更新 Prisma Schema**
   - 添加 Better Auth 所需的模型（User, Session, Account, Verification）
   - 运行 `npx prisma db push` 同步数据库

5. **迁移前台认证**
   - 替换 `next-auth/react` 的 `useSession` → `better-auth/react` 的 `useSession`
   - 替换 `getServerSession` → `auth.api.getSession()`
   - 更新 `AuthProvider.tsx`

6. **迁移后台认证**
   - 删除 `src/lib/adminAuth.ts` 中的 `generateToken`/`parseToken`
   - 使用 Better Auth 的 admin 插件替代
   - 更新所有 admin API 路由的认证检查

7. **迁移登录页面**
   - `src/app/admin/(auth)/login/page.tsx`: 使用 Better Auth 的 signIn
   - `src/components/auth/LoginForm.tsx`: 更新登录逻辑
   - `src/components/auth/RegisterForm.tsx`: 更新注册逻辑

8. **验证**
   - 前台用户登录/注册正常
   - 后台管理员登录正常
   - 权限检查正常
   - Token 不可伪造

#### 影响文件
- 新增: `src/lib/auth.ts`, `src/app/api/auth/[...all]/route.ts`
- 重写: `src/lib/adminAuth.ts`
- 修改: 7个认证相关文件
- 修改: Prisma Schema

---

## Phase 3: 状态管理升级

### 3.1 Zustand（替代 React Context）

**当前文件**:
- `src/context/CartContext.tsx` (118行)
- `src/context/WishlistContext.tsx` (88行)
- `src/context/LanguageContext.tsx` (70行) — Phase 4 中用 next-intl 替换，此处暂不处理

#### 步骤

1. **安装 Zustand**
   ```bash
   npm install zustand
   ```

2. **创建 Cart Store** `src/stores/useCartStore.ts`
   ```ts
   import { create } from "zustand"
   import { persist } from "zustand/middleware"
   
   export interface CartItem {
     id: string; name: string; price: number; quantity: number; image: string
   }
   
   interface CartState {
     cart: CartItem[]
     addToCart: (item: Omit<CartItem, "quantity">) => void
     removeFromCart: (id: string) => void
     updateQuantity: (id: string, quantity: number) => void
     clearCart: () => void
     cartTotal: () => number
     cartCount: () => number
   }
   
   export const useCartStore = create<CartState>()(
     persist(
       (set, get) => ({
         cart: [],
         addToCart: (item) => set((s) => {
           const existing = s.cart.find(i => i.id === item.id)
           return existing
             ? { cart: s.cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) }
             : { cart: [...s.cart, { ...item, quantity: 1 }] }
         }),
         removeFromCart: (id) => set((s) => ({ cart: s.cart.filter(i => i.id !== id) })),
         updateQuantity: (id, quantity) => set((s) => ({
           cart: quantity < 1 ? s.cart : s.cart.map(i => i.id === id ? { ...i, quantity } : i),
         })),
         clearCart: () => set({ cart: [] }),
         cartTotal: () => get().cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
         cartCount: () => get().cart.reduce((sum, i) => sum + i.quantity, 0),
       }),
       { name: "solo:cart" }
     )
   )
   ```

3. **创建 Wishlist Store** `src/stores/useWishlistStore.ts`
   - 类似结构，使用 persist middleware
   - 存储 key: `solo_wishlist`

4. **更新消费文件**
   - `import { useCart } from "@/context/CartContext"` → `import { useCartStore } from "@/stores/useCartStore"`
   - `const { cart, addToCart, cartTotal, cartCount } = useCart()` → `const { cart, addToCart } = useCartStore(); const cartTotal = useCartStore(s => s.cartTotal()); const cartCount = useCartStore(s => s.cartCount())`
   - 使用 selector 优化重渲染

5. **简化 layout.tsx**
   - 移除 `<CartProvider>` 和 `<WishlistProvider>`
   - Provider 嵌套从 5 层减少到 3 层

6. **删除旧文件**
   - `src/context/CartContext.tsx`
   - `src/context/WishlistContext.tsx`

7. **验证**
   - 购物车添加/删除/更新正常
   - 收藏功能正常
   - localStorage 持久化正常
   - 无 hydration 错误

#### 影响文件
- 新增: `src/stores/useCartStore.ts`, `src/stores/useWishlistStore.ts`
- 删除: `src/context/CartContext.tsx`, `src/context/WishlistContext.tsx`
- 修改: `src/app/layout.tsx`, 约 20 个消费文件更新 import

---

## Phase 4: 国际化升级

### 4.1 next-intl（替代自建 LanguageContext）

**当前文件**:
- `src/context/LanguageContext.tsx` (70行)
- `src/i18n/translations.ts` (263行)

#### 步骤

1. **安装 next-intl**
   ```bash
   npm install next-intl
   ```

2. **创建翻译文件**
   - `src/i18n/messages/zh.json` — 从 translations.ts 提取中文翻译
   - `src/i18n/messages/en.json` — 从 translations.ts 提取英文翻译

3. **创建 next-intl 配置** `src/i18n/request.ts`
   ```ts
   import { getRequestConfig } from "next-intl/server"
   
   export default getRequestConfig(async () => {
     const locale = "zh" // 默认语言，后续从 cookie/header 读取
     return { locale, messages: (await import(`./messages/${locale}.json`)).default }
   })
   ```

4. **更新 `next.config.ts`** 添加 next-intl 插件

5. **创建客户端 Hook** `src/hooks/useLocale.ts`
   - 封装 next-intl 的 useTranslations + useLocale
   - 提供 toggleLanguage 功能

6. **迁移消费文件**
   - `const { t, language, toggleLanguage } = useLanguage()` → `const t = useTranslations(); const { locale, setLocale } = useLocale()`
   - `t("product.featured")` → `t("product.featured")` (键名不变)

7. **删除旧文件**
   - `src/context/LanguageContext.tsx`
   - `src/i18n/translations.ts`

8. **简化 layout.tsx**
   - 移除 `<LanguageProvider>`

9. **验证**
   - 中英文切换正常
   - 无 hydration 错误
   - SSR 渲染正确

#### 影响文件
- 新增: `src/i18n/messages/zh.json`, `src/i18n/messages/en.json`, `src/i18n/request.ts`
- 删除: `src/context/LanguageContext.tsx`, `src/i18n/translations.ts`
- 修改: 约 39 个消费文件更新 import
- 修改: `next.config.ts`

---

## Phase 5: 管理后台重构

### 5.1 Refine（替代自建管理后台）

**当前文件**: 12 个 admin 页面

#### 步骤

1. **安装 Refine**
   ```bash
   npm install @refinedev/core @refinedev/nextjs-router
   ```

2. **创建 Refine 配置** `src/app/admin/refine-config.tsx`
   - 定义资源（products, orders, users, roles, etc.）
   - 配置数据提供者（REST API）
   - 配置认证提供者（Better Auth）

3. **创建数据提供者** `src/lib/refine-data-provider.ts`
   - 封装现有 API 路由为 Refine DataProvider 接口

4. **迁移管理页面**
   - 逐个迁移 12 个 admin 页面
   - 优先级: products → orders → users → 其他

5. **验证**
   - CRUD 操作正常
   - 权限控制正常

### 5.2 Tremor（管理后台图表组件）

#### 步骤

1. **安装 Tremor**
   ```bash
   npm install @tremor/react
   ```

2. **替换 SalesChart 组件**
   - `src/components/admin/SalesChart.tsx`: Recharts → Tremor AreaChart

3. **创建 KPI 卡片**
   - 替换 admin dashboard 的手动统计卡片

4. **验证**
   - 图表渲染正常
   - 暗色模式兼容

#### 影响文件
- 新增: Refine 配置、数据提供者
- 修改: 12 个 admin 页面
- 修改: `src/components/admin/SalesChart.tsx`

---

## 版本规划

| Phase | 版本号 | 预计工作量 |
|-------|--------|-----------|
| Phase 1 | v0.9.0 | 2天 |
| Phase 2 | v0.10.0 | 3天 |
| Phase 3 | v0.11.0 | 2天 |
| Phase 4 | v0.12.0 | 3天 |
| Phase 5 | v1.0.0 | 5天 |

**总计**: 约 15 个工作日
