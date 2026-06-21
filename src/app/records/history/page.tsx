import MedicalRecordsList from "@/components/records/medical-records-list"

export default function RecordsHistoryPage() {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Medical History</h1>
        <p className="text-muted-foreground mt-1">Your past consultations and clinical records.</p>
      </div>
      <MedicalRecordsList />
    </div>
  )
}
