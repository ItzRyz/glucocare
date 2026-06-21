"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { api, ApiClientError } from "@/lib/api-client"

const SYMPTOMS = [
  "Polyuria", "Polydipsia", "sudden weight loss", "weakness", "Polyphagia",
  "Genital thrush", "visual blurring", "Itching", "Irritability",
  "delayed healing", "partial paresis", "muscle stiffness", "Alopecia", "Obesity",
] as const

type SymptomKey = (typeof SYMPTOMS)[number]

export default function MlDiagnosisForm() {
  const [age, setAge] = useState("")
  const [gender, setGender] = useState<"Male" | "Female">("Male")
  const [model, setModel] = useState<"randomforest" | "logisticregression">("randomforest")
  const [symptoms, setSymptoms] = useState<Record<SymptomKey, boolean>>(
    () => Object.fromEntries(SYMPTOMS.map((s) => [s, false])) as Record<SymptomKey, boolean>
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ prediction: string; probability: string; model: string } | null>(null)

  const toggleSymptom = (key: SymptomKey, checked: boolean) => {
    setSymptoms((prev) => ({ ...prev, [key]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)

    const parsedAge = parseInt(age, 10)
    if (isNaN(parsedAge) || parsedAge < 1) {
      setError("Please enter a valid age")
      return
    }

    setLoading(true)
    try {
      const payload: Record<string, unknown> = {
        Age: parsedAge,
        Gender: gender,
        model,
        save: true,
      }
      for (const key of SYMPTOMS) {
        payload[key] = symptoms[key] ? "Yes" : "No"
      }

      const prediction = await api.diagnose.predict(payload)
      setResult(prediction)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Prediction failed. Ensure the ML service is running.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Symptom Diagnosis</CardTitle>
          <CardDescription>
            Answer the symptom questionnaire for a machine-learning diabetes risk assessment.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min={1}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={(v) => setGender(v as "Male" | "Female")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Model</Label>
              <Select value={model} onValueChange={(v) => setModel(v as typeof model)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="randomforest">Random Forest</SelectItem>
                  <SelectItem value="logisticregression">Logistic Regression</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Symptoms (check all that apply)</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {SYMPTOMS.map((symptom) => (
                  <label key={symptom} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={symptoms[symptom]}
                      onCheckedChange={(checked) => toggleSymptom(symptom, checked === true)}
                    />
                    <span className="capitalize">{symptom}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running prediction...</>
              ) : (
                "Run AI Diagnosis"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {result && (
        <Card className={`border-l-4 ${result.prediction === "Positive" ? "border-l-red-500" : "border-l-green-500"}`}>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            {result.prediction === "Positive" ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            <CardTitle className="text-lg">
              Prediction: {result.prediction}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Probability: <strong>{result.probability}</strong> ({result.model})
            </p>
            {result.prediction === "Positive" && (
              <p className="text-sm text-muted-foreground mt-2">
                Please consult a healthcare professional for further evaluation.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
