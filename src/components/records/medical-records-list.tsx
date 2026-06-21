"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { api, ApiClientError } from "@/lib/api-client"
import type { MedicalRecord } from "@/types/api"

export default function MedicalRecordsList() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await api.medicalRecords.list()
        if (mounted) setRecords(data)
      } catch (err) {
        if (mounted) setError(err instanceof ApiClientError ? err.message : "Failed to load records")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => <Skeleton key={i} className="h-32" />)}
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground text-sm">
          No medical records found.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <Card key={record.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Visit with {record.doctor.name}
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {format(new Date(record.createdAt), "MMM d, yyyy")}
              </span>
            </div>
            <CardDescription>Status: {record.status.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {record.subjective && (
              <div>
                <p className="font-medium text-xs uppercase text-muted-foreground mb-1">Subjective</p>
                <p>{record.subjective}</p>
              </div>
            )}
            {record.assessment && (
              <div>
                <p className="font-medium text-xs uppercase text-muted-foreground mb-1">Assessment</p>
                <p>{record.assessment}</p>
              </div>
            )}
            {record.plan && (
              <div>
                <p className="font-medium text-xs uppercase text-muted-foreground mb-1">Plan</p>
                <p>{record.plan}</p>
              </div>
            )}
            {record.diagnoses.length > 0 && (
              <div>
                <p className="font-medium text-xs uppercase text-muted-foreground mb-1">Diagnoses</p>
                <ul className="list-disc list-inside">
                  {record.diagnoses.map((d) => (
                    <li key={d.id}>{d.code} — {d.name}</li>
                  ))}
                </ul>
              </div>
            )}
            {record.vitalSign && (
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t">
                {record.vitalSign.bloodPressure && <span>BP: {record.vitalSign.bloodPressure}</span>}
                {record.vitalSign.heartRate && <span>HR: {record.vitalSign.heartRate} bpm</span>}
                {record.vitalSign.weight && <span>Weight: {record.vitalSign.weight} kg</span>}
                {record.vitalSign.bmi && <span>BMI: {record.vitalSign.bmi}</span>}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
