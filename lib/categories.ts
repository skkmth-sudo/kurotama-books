// lib/categories.ts
export const CATEGORY_LABELS: Record<string, string> = {
    programming: "プログラミング",
    business: "ビジネス",
    culture: "教養",
  };
  
  export function labelOf(slug: string) {
    return CATEGORY_LABELS[slug] ?? slug;
  }
  
  // カテゴリごとの色（Tailwind用）
  export function badgeClasses(slug?: string) {
    switch (slug) {
      case "programming":
        return "bg-blue-50 text-blue-700 ring-blue-200";
      case "business":
        return "bg-amber-50 text-amber-700 ring-amber-200";
      case "culture":
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";
      default:
        return "bg-gray-50 text-gray-700 ring-gray-200";
    }
  }
  