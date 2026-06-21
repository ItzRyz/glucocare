"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { api, ApiClientError } from "@/lib/api-client"

export default function WeeklyAssessmentForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [exercise, setExercise] = useState("yes")
  const [diet, setDiet] = useState("yes")
  const [symptoms, setSymptoms] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await api.assessments.create({
        exercise: exercise === "yes",
        diet: diet === "yes",
        symptoms: symptoms.trim() || undefined,
      })
      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to submit assessment")
    } finally {
      setLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="text-center py-12 border-green-500 border-2 max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <h2 className="text-2xl font-bold">Assessment Complete!</h2>
          <p className="text-muted-foreground max-w-md">
            Thank you for keeping your health records updated. Your data is securely logged.
          </p>
          <Link href="/dashboard">
            <Button variant="default" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Weekly Health Assessment</CardTitle>
        <CardDescription>Please answer a few questions to help us track your progress this week.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-8">

          <div className="space-y-4">
            <Label className="text-base font-semibold">1. Did you exercise for at least 150 minutes this week?</Label>
            <RadioGroup value={exercise} onValueChange={setExercise} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="ex-yes" />
                <Label htmlFor="ex-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="ex-no" />
                <Label htmlFor="ex-no">No</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">2. Have you consistently followed your dietary guidelines?</Label>
            <RadioGroup value={diet} onValueChange={setDiet} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="diet-yes" />
                <Label htmlFor="diet-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="diet-no" />
                <Label htmlFor="diet-no">No</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">3. Have you experienced any unusual symptoms? (Optional)</Label>
            <Textarea
              placeholder="e.g. Dizziness, unusual fatigue, blurry vision..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" type="button">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
            ) : (
              "Submit Assessment"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
