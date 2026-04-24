import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacy")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacy")

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-muted-foreground leading-relaxed mb-6">
          {t("lastUpdated")}
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-4">{t("collectTitle")}</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          {t("collectContent")}
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-4">{t("useTitle")}</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          {t("useContent")}
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-4">{t("cookiesTitle")}</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          {t("cookiesContent")}
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-4">{t("rightsTitle")}</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          {t("rightsContent")}
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-4">{t("contactTitle")}</h2>
        <p className="text-muted-foreground leading-relaxed">
          {t("contactContent")}
        </p>
      </div>
    </div>
  )
}
