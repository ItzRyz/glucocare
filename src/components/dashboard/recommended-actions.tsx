"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, X } from "lucide-react"

const initialActions = [
  {
    id: 1,
    title: "Complete Weekly Assessment",
    description: "Keep your doctor updated with your latest health data.",
    link: "/assessment"
  },
  {
    id: 2,
    title: "Review Dietary Guidelines",
    description: "Check the latest meal recommendations from your nutritionist.",
    link: "/guidelines"
  },
]

export default function RecommendedActions() {
  const [actions, setActions] = useState(initialActions)
  const router = useRouter()

  const dismissAction = (e: React.MouseEvent, id: number) => {
    e.stopPropagation() // Prevent clicking the card link
    setActions((prev) => prev.filter((action) => action.id !== id))
  }

  const navigateToAction = (link: string) => {
    router.push(link)
  }

  if (actions.length === 0) return null

  return (
    <div className="pt-4">
      <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {actions.map((action) => (
          <Card 
            key={action.id} 
            onClick={() => navigateToAction(action.link)}
            className="relative hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group"
          >
            <button
              onClick={(e) => dismissAction(e, action.id)}
              className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-muted"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between pr-6">
                {action.title} <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
