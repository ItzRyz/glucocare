"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, X } from "lucide-react"
import { api } from "@/lib/api-client"

type Action = {
  id: string
  title: string
  description: string
  link: string
}

const staticActions: Action[] = [
  {
    id: "guidelines",
    title: "Review Dietary Guidelines",
    description: "Check the latest meal recommendations from your nutritionist.",
    link: "/guidelines",
  },
]

export default function RecommendedActions() {
  const [actions, setActions] = useState<Action[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const assessments = await api.assessments.list()
        if (!mounted) return

        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        const hasRecentAssessment = assessments.some(
          (a) => new Date(a.createdAt) >= oneWeekAgo
        )

        const next: Action[] = []
        if (!hasRecentAssessment) {
          next.push({
            id: "assessment",
            title: "Complete Weekly Assessment",
            description: "Keep your doctor updated with your latest health data.",
            link: "/assessment",
          })
        }
        next.push(...staticActions)
        setActions(next)
      } catch {
        setActions([
          {
            id: "assessment",
            title: "Complete Weekly Assessment",
            description: "Keep your doctor updated with your latest health data.",
            link: "/assessment",
          },
          ...staticActions,
        ])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  const dismissAction = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setActions((prev) => prev.filter((action) => action.id !== id))
  }

  if (loading) {
    return (
      <div className="pt-4">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    )
  }

  if (actions.length === 0) return null

  return (
    <div className="pt-4">
      <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {actions.map((action) => (
          <Card
            key={action.id}
            onClick={() => router.push(action.link)}
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
