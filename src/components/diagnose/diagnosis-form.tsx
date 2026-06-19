"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Activity, AlertTriangle, CheckCircle, Info } from "lucide-react"

type ResultStatus = "Normal" | "Prediabetes" | "Diabetes" | null

export default function DiagnosisForm() {
  const [sugarLevel, setSugarLevel] = useState("")
  const [testType, setTestType] = useState("fasting")
  const [result, setResult] = useState<{ status: ResultStatus; message: string } | null>(null)

  const handleDiagnose = (e: React.FormEvent) => {
    e.preventDefault()
    
    const level = parseFloat(sugarLevel)
    if (isNaN(level)) return

    let status: ResultStatus = "Normal"
    let message = ""

    // Simplified Mock Logic
    if (testType === "fasting") {
      if (level < 100) {
        status = "Normal"
        message = "Your fasting blood sugar is within the normal range."
      } else if (level >= 100 && level <= 125) {
        status = "Prediabetes"
        message = "Your fasting blood sugar indicates prediabetes. Consider lifestyle changes."
      } else {
        status = "Diabetes"
        message = "Your fasting blood sugar indicates diabetes. Please consult a doctor."
      }
    } else {
      // 2 hours after meal
      if (level < 140) {
        status = "Normal"
        message = "Your post-meal blood sugar is within the normal range."
      } else if (level >= 140 && level <= 199) {
        status = "Prediabetes"
        message = "Your post-meal blood sugar indicates prediabetes."
      } else {
        status = "Diabetes"
        message = "Your post-meal blood sugar indicates diabetes. Please consult a doctor immediately."
      }
    }

    setResult({ status, message })
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
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Analyze Result <Activity className="ml-2 h-4 w-4" />
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
