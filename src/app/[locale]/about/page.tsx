import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function AboutPage() {
  const t = await getTranslations("about")

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          {t("intro")}
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-4">{t("missionTitle")}</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          {t("missionContent")}
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-4">{t("valuesTitle")}</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>{t("value1")}</li>
          <li>{t("value2")}</li>
          <li>{t("value3")}</li>
        </ul>
      </div>
    </div>
  )
}
