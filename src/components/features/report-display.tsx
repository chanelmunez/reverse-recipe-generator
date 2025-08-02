import type { FoodIntelligenceReport } from "../../types"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

interface ReportDisplayProps {
  report: FoodIntelligenceReport
}

export function ReportDisplay({ report }: ReportDisplayProps) {
  return (
    <main className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold">Your Food Intelligence Report</h1>
        </header>

        <Card>
          <CardContent className="p-6">
            <img
              src={report.imageUrl || "/placeholder.svg"}
              alt={report.recipe.name}
              className="w-full h-auto max-h-96 object-cover rounded-md mb-6"
            />
            <h2 className="text-2xl font-semibold">{report.recipe.name}</h2>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recipe & Preparation</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">Ingredients</h3>
              <ul className="list-disc list-inside space-y-1 mb-4">
                {report.recipe.ingredients.map((ing, i) => (
                  <li key={i}>
                    {ing.amount} {ing.name}
                  </li>
                ))}
              </ul>
              <h3 className="font-semibold mb-2">Steps</h3>
              <ol className="list-decimal list-inside space-y-2">
                {report.recipe.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Nutritional Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  <li>
                    <strong>Calories:</strong> {report.nutritionalProfile.calories.toFixed(0)} kcal
                  </li>
                  <li>
                    <strong>Protein:</strong> {report.nutritionalProfile.protein.toFixed(1)} g
                  </li>
                  <li>
                    <strong>Carbohydrates:</strong> {report.nutritionalProfile.carbohydrates.toFixed(1)} g
                  </li>
                  <li>
                    <strong>Fat:</strong> {report.nutritionalProfile.fat.toFixed(1)} g
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estimated Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Total:</strong> ${report.costBreakdown.totalCost.toFixed(2)}
                </p>
                <p>
                  <strong>Per Serving:</strong> ${report.costBreakdown.perServing.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fitness Goal Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              Your estimated Total Daily Energy Expenditure (TDEE) is{" "}
              <strong>{report.fitnessGoalAnalysis.tdee.toFixed(0)} calories</strong>.
            </p>
            <p className="mb-4">
              For your goal, your target is around{" "}
              <strong>{report.fitnessGoalAnalysis.goalCalories.toFixed(0)} calories</strong> per day.
            </p>
            <p className="text-lg p-4 bg-secondary rounded-md">{report.fitnessGoalAnalysis.feedback}</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
