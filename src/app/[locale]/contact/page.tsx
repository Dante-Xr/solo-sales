import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Mail, MapPin, Phone, Clock } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function ContactPage() {
  const t = await getTranslations("contact")

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
      <p className="text-muted-foreground leading-relaxed mb-8">
        {t("intro")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="flex items-start gap-4 p-6 border rounded-lg">
          <Mail className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">{t("email")}</h3>
            <p className="text-muted-foreground text-sm">support@solosales.com</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-6 border rounded-lg">
          <Phone className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">{t("phone")}</h3>
            <p className="text-muted-foreground text-sm">+1 (555) 123-4567</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-6 border rounded-lg">
          <MapPin className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">{t("address")}</h3>
            <p className="text-muted-foreground text-sm">123 Commerce St, Suite 100, New York, NY 10001</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-6 border rounded-lg">
          <Clock className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">{t("hours")}</h3>
            <p className="text-muted-foreground text-sm">Mon - Fri: 9:00 - 18:00</p>
          </div>
        </div>
      </div>
    </div>
  )
}
