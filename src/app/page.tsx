import WelcomeBanner from "@/components/dashboard/welcome-banner"
import StatCards from "@/components/dashboard/stat-cards"
import RecommendedActions from "@/components/dashboard/recommended-actions"
import BloodSugarChart from "@/components/dashboard/blood-sugar-chart"

export default function Home() {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-8 space-y-8">
      <WelcomeBanner />
      <StatCards />
      <BloodSugarChart />
      <RecommendedActions />
    </div>
  )
}
