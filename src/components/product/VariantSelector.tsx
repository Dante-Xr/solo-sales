"use client"

import { useTranslations } from "next-intl"

export interface VariantOption {
  label: string
  value: string
  color?: string
  inStock: boolean
}

export interface VariantGroup {
  name: string
  type: "color" | "size"
  options: VariantOption[]
}

export interface SelectedVariant {
  [groupName: string]: string
}

interface VariantSelectorProps {
  variants?: VariantGroup[]
  selectedVariant: SelectedVariant
  onSelect: (variant: SelectedVariant) => void
}

const DEMO_VARIANTS: VariantGroup[] = [
  {
    name: "color",
    type: "color",
    options: [
      { label: "Black", value: "black", color: "#1a1a1a", inStock: true },
      { label: "White", value: "white", color: "#f5f5f5", inStock: true },
      { label: "Navy", value: "navy", color: "#1e3a5f", inStock: true },
      { label: "Red", value: "red", color: "#dc2626", inStock: false },
    ],
  },
  {
    name: "size",
    type: "size",
    options: [
      { label: "S", value: "s", inStock: true },
      { label: "M", value: "m", inStock: true },
      { label: "L", value: "l", inStock: true },
      { label: "XL", value: "xl", inStock: false },
    ],
  },
]

export function VariantSelector({
  variants = DEMO_VARIANTS,
  selectedVariant,
  onSelect,
}: VariantSelectorProps) {
  const t = useTranslations("product")

  const handleSelect = (groupName: string, value: string) => {
    onSelect({ ...selectedVariant, [groupName]: value })
  }

  return (
    <div className="space-y-4">
      {variants.map((group) => (
        <div key={group.name}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-foreground">
              {group.type === "color" ? t("color") : t("size")}:
            </span>
            {selectedVariant[group.name] && (
              <span className="text-sm text-muted-foreground">
                {group.options.find((o) => o.value === selectedVariant[group.name])?.label}
              </span>
            )}
          </div>

          {group.type === "color" ? (
            <div className="flex gap-2">
              {group.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => option.inStock && handleSelect(group.name, option.value)}
                  disabled={!option.inStock}
                  title={option.label}
                  className={`relative w-9 h-9 rounded-full border-2 transition-all ${
                    selectedVariant[group.name] === option.value
                      ? "border-primary ring-2 ring-primary/30"
                      : option.inStock
                        ? "border-muted hover:border-muted-foreground/50"
                        : "border-muted opacity-40 cursor-not-allowed"
                  }`}
                >
                  <span
                    className="absolute inset-1 rounded-full"
                    style={{ backgroundColor: option.color }}
                  />
                  {!option.inStock && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-6 h-px bg-muted-foreground rotate-45" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-2">
              {group.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => option.inStock && handleSelect(group.name, option.value)}
                  disabled={!option.inStock}
                  className={`min-w-[44px] h-10 px-3 rounded-lg border text-sm font-medium transition-all ${
                    selectedVariant[group.name] === option.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : option.inStock
                        ? "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                        : "border-input bg-muted text-muted-foreground cursor-not-allowed line-through"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
