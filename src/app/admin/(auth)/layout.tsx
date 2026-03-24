/**
 * 登录页面独立布局
 * 不使用 AdminLayout 的侧边栏
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
