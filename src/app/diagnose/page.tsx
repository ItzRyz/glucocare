import DiagnosisForm from "@/components/diagnose/diagnosis-form"
import MlDiagnosisForm from "@/components/diagnose/ml-diagnosis-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DiagnosePage() {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Diagnosis</h1>
        <p className="text-muted-foreground mt-1">
          Log blood sugar readings or run an AI symptom assessment.
        </p>
      </div>

      <Tabs defaultValue="glucose">
        <TabsList className="mb-6">
          <TabsTrigger value="glucose">Blood Sugar</TabsTrigger>
          <TabsTrigger value="ml">AI Symptom Check</TabsTrigger>
        </TabsList>
        <TabsContent value="glucose">
          <DiagnosisForm />
        </TabsContent>
        <TabsContent value="ml">
          <MlDiagnosisForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
