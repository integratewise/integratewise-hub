"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronRight,
  Scale,
  Rocket,
  Code,
  Users,
  Globe,
  TrendingUp,
  Heart,
  Building2,
  DollarSign,
  BarChart3,
  Megaphone,
  FlaskConical,
  Package,
  BookOpen,
  LucideIcon,
} from "lucide-react";
import { useState } from "react";

interface Notebook {
  id: string;
  name: string;
  icon: string;
  category: string;
  docs_count: number;
}

interface SidebarNavProps {
  notebooks: Notebook[];
}

const iconMap: Record<string, LucideIcon> = {
  Scale,
  Rocket,
  Code,
  Users,
  Globe,
  TrendingUp,
  Heart,
  Building2,
  DollarSign,
  BarChart3,
  Megaphone,
  FlaskConical,
  Package,
  BookOpen,
};

const categoryOrder = ["Business", "Operations", "Projects", "Products", "Tech", "General"];

export function SidebarNav({ notebooks }: SidebarNavProps) {
  const pathname = usePathname();
  const [openCategories, setOpenCategories] = useState<string[]>(categoryOrder);

  // Group notebooks by category
  const groupedNotebooks = notebooks.reduce((acc, notebook) => {
    const category = notebook.category || "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(notebook);
    return acc;
  }, {} as Record<string, Notebook[]>);

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <ScrollArea className="h-full py-6 pr-6 lg:py-8">
      <div className="space-y-4">
        {categoryOrder.map((category) => {
          const items = groupedNotebooks[category];
          if (!items || items.length === 0) return null;

          return (
            <Collapsible
              key={category}
              open={openCategories.includes(category)}
              onOpenChange={() => toggleCategory(category)}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between py-1 text-sm font-semibold text-foreground hover:text-foreground/80">
                {category}
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    openCategories.includes(category) && "rotate-90"
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-1">
                {items.map((notebook) => {
                  const Icon = iconMap[notebook.icon] || BookOpen;
                  const isActive = pathname === `/notebooks/${notebook.id}`;

                  return (
                    <Link
                      key={notebook.id}
                      href={`/notebooks/${notebook.id}`}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                        isActive
                          ? "bg-muted font-medium text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="truncate">{notebook.name}</span>
                      {notebook.docs_count > 0 && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {notebook.docs_count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </ScrollArea>
  );
}
