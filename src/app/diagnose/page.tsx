import DiagnosisForm from "@/components/diagnose/diagnosis-form"

export default function DiagnosePage() {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">New Diagnosis</h1>
        <p className="text-muted-foreground mt-1">Log your blood sugar levels to keep track of your health.</p>
      </div>
      <DiagnosisForm />
    </div>
  )
}
