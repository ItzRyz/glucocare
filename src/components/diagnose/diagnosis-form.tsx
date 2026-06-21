"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Activity, AlertTriangle, CheckCircle, Info, Loader2 } from "lucide-react"
import { api, ApiClientError } from "@/lib/api-client"
import type { GlucoseStatus } from "@/types/api"

type ResultStatus = GlucoseStatus | null

export default function DiagnosisForm() {
  const [sugarLevel, setSugarLevel] = useState("")
  const [testType, setTestType] = useState<"fasting" | "post-meal">("fasting")
  const [result, setResult] = useState<{ status: ResultStatus; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [typeId, setTypeId] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function loadRefs() {
      try {
        const [types, categories] = await Promise.all([
          api.types.list("GLUCOSE"),
          api.categories.list(),
        ])
        const matchedType = types.find((t) =>
          testType === "fasting" ? t.name === "Fasting" : t.name === "Post-Prandial"
        )
        const metabolic = categories.find((c) => c.slug === "metabolic-panel") ?? categories[0]
        if (matchedType) setTypeId(matchedType.id)
        if (metabolic) setCategoryId(metabolic.id)
      } catch {
        // save will be skipped if refs unavailable
      }
    }
    loadRefs()
  }, [testType])

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaved(false)

    const level = parseFloat(sugarLevel)
    if (isNaN(level)) return

    setLoading(true)
    try {
      const evaluation = await api.glucose.evaluate({ level, testType })
      setResult({ status: evaluation.status, message: evaluation.message })

      if (typeId && categoryId) {
        await api.glucose.create({ level, typeId, categoryId })
        setSaved(true)
      }
    } catch (err) {
      setResult(null)
      setError(err instanceof ApiClientError ? err.message : "Failed to evaluate blood sugar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Blood Sugar Assessment</CardTitle>
          <CardDescription>Enter your latest blood sugar readings to get an instant evaluation.</CardDescription>
        </CardHeader>
        <form onSubmit={handleDiagnose}>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Test Type</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setTestType("fasting")}
                  className={`cursor-pointer rounded-xl border p-4 text-center transition-all flex flex-col items-center justify-center gap-2
                    ${testType === "fasting"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-input hover:border-primary/50 hover:bg-muted/30"}`}
                >
                  <p className="font-semibold text-sm">Fasting</p>
                  <p className="text-xs text-muted-foreground">Before Meal</p>
                </div>
                <div
                  onClick={() => setTestType("post-meal")}
                  className={`cursor-pointer rounded-xl border p-4 text-center transition-all flex flex-col items-center justify-center gap-2
                    ${testType === "post-meal"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-input hover:border-primary/50 hover:bg-muted/30"}`}
                >
                  <p className="font-semibold text-sm">Post-Meal</p>
                  <p className="text-xs text-muted-foreground">2 Hours After</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sugar-level">Blood Sugar Level (mg/dL)</Label>
              <Input
                id="sugar-level"
                type="number"
                placeholder="e.g. 110"
                value={sugarLevel}
                onChange={(e) => setSugarLevel(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
              ) : (
                <>Analyze Result <Activity className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {result && (
        <Card className={`border-l-4 ${
          result.status === "Normal" ? "border-l-green-500" :
          result.status === "Prediabetes" ? "border-l-yellow-500" : "border-l-red-500"
        }`}>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            {result.status === "Normal" && <CheckCircle className="h-5 w-5 text-green-500" />}
            {result.status === "Prediabetes" && <Info className="h-5 w-5 text-yellow-500" />}
            {result.status === "Diabetes" && <AlertTriangle className="h-5 w-5 text-red-500" />}
            <CardTitle className="text-lg">Result: {result.status}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{result.message}</p>
            {saved && (
              <p className="text-xs text-muted-foreground mt-2">Reading saved to your health records.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
