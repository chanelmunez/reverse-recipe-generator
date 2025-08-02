import type { FoodIntelligenceReport } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle, XCircle, Star } from "lucide-react"

interface ReportDisplayProps {
  report: FoodIntelligenceReport
}

export function ReportDisplay({ report }: ReportDisplayProps) {
  const isNutritionEnabled = report.nutritionalProfile.calories > 0
  const isCostEnabled = report.costBreakdown.totalCost > 0
  const analysis = report.fitnessGoalAnalysis

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 50) return "text-yellow-500"
    return "text-red-500"
  }

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
                  <li key={i}>{ing.name}</li>
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
                {isNutritionEnabled ? (
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
                ) : (
                  <p className="text-muted-foreground">Could not calculate nutritional profile.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Estimated Cost</CardTitle>
              </CardHeader>
              <CardContent>
                {isCostEnabled ? (
                  <>
                    <p>
                      <strong>Total:</strong> ${report.costBreakdown.totalCost.toFixed(2)}
                    </p>
                    <p>
                      <strong>Per Serving:</strong> ${report.costBreakdown.perServing.toFixed(2)}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">Cost analysis is not available for this recipe.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>AI Health & Fitness Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-6 bg-secondary rounded-lg">
              <div className="text-sm text-muted-foreground">Meal Health Score</div>
              <div className={`text-6xl font-bold ${getScoreColor(analysis.healthScore)}`}>
                {analysis.healthScore}
                <span className="text-3xl">/100</span>
              </div>
              <p className="text-lg mt-2">{analysis.mealSummary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  Positive Points
                </h3>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  {analysis.positivePoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <XCircle className="w-5 h-5 mr-2 text-red-500" />
                  Areas for Improvement
                </h3>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  {analysis.areasForImprovement.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Personalized Tips
              </h3>
              <ul className="list-disc list-inside space-y-1 pl-4">
                {analysis.generalTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {report.debugInfo && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>API Debug Output</AccordionTrigger>
              <AccordionContent>
                <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto">
                  {report.debugInfo.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </main>
  )
}
