import { Link } from "@/i18n/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PasswordResetForm } from "@/components/auth/PasswordResetForm"

export default function PasswordResetPage() {
  return <main className="min-h-screen bg-gradient-to-br from-zinc-100 to-zinc-200 p-4 dark:from-zinc-900 dark:to-zinc-800"><div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-md flex-col justify-center space-y-8"><div className="text-center"><h1 className="text-3xl font-bold text-foreground">SoloSales</h1><p className="mt-2 text-muted-foreground">用户密码重置</p></div><Card className="shadow-lg"><CardHeader><CardTitle className="text-center text-xl">重置密码</CardTitle></CardHeader><CardContent><PasswordResetForm /></CardContent></Card><Link href="/" className="block text-center text-sm text-brand hover:underline">返回登录</Link></div></main>
}
