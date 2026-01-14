import { BookOpen, ShoppingCart } from "lucide-react"

// Map retailer name (lowercase) to icon
const icons: Record<string, any> = {
  amazon: ShoppingCart,
  "apple books": BookOpen,
  "barnes & noble": ShoppingCart,
  kobo: BookOpen,
  "google play": BookOpen,
  barnesandnoble: ShoppingCart,
  // Add more as needed
}

export function RetailerIcon({ name }: { name: string }) {
  const Icon = icons[name.toLowerCase()] || BookOpen // fallback
  return <Icon className="w-5 h-5 inline mr-2 text-gray-600" />
}
