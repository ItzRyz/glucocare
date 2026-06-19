import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, XCircle } from "lucide-react"

export default function DietaryContent() {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Dietary Guidelines</CardTitle>
        <CardDescription>A complete reference for managing your blood sugar through a healthy diet.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recommended" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recommended">Recommended Foods</TabsTrigger>
            <TabsTrigger value="avoid">Foods to Avoid</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommended" className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="text-green-500 h-5 w-5" /> Foods You Should Eat
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <li className="p-4 border rounded-xl bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                <strong>Non-starchy Vegetables:</strong> Broccoli, spinach, peppers, tomatoes.
              </li>
              <li className="p-4 border rounded-xl bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                <strong>Lean Proteins:</strong> Chicken breast, fish, tofu, beans, and lentils.
              </li>
              <li className="p-4 border rounded-xl bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                <strong>Whole Grains:</strong> Brown rice, quinoa, oats, whole wheat bread.
              </li>
              <li className="p-4 border rounded-xl bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                <strong>Healthy Fats:</strong> Avocados, nuts, seeds, olive oil.
              </li>
            </ul>
          </TabsContent>
          
          <TabsContent value="avoid" className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <XCircle className="text-red-500 h-5 w-5" /> Foods to Limit or Avoid
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <li className="p-4 border rounded-xl bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                <strong>Refined Carbohydrates:</strong> White bread, white rice, pasta, pastries.
              </li>
              <li className="p-4 border rounded-xl bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                <strong>Sugary Drinks:</strong> Regular soda, fruit punch, sweetened tea.
              </li>
              <li className="p-4 border rounded-xl bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                <strong>Processed Meats:</strong> Hot dogs, bacon, deli meats.
              </li>
              <li className="p-4 border rounded-xl bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                <strong>Trans Fats:</strong> Fried foods, commercial baked goods, some margarines.
              </li>
            </ul>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
