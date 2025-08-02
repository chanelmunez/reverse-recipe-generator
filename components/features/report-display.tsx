import Link from "next/link"
import type { FoodIntelligenceReport } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle, XCircle, Star, ArrowLeft, Lightbulb, Building, ShoppingCart, ExternalLink } from "lucide-react"

interface ReportDisplayProps {
  report: FoodIntelligenceReport
}

export function ReportDisplay({ report }: ReportDisplayProps) {
  const isNutritionEnabled = report.nutritionalProfile.calories > 0
  const hasIngredients = report.recipe.ingredients && report.recipe.ingredients.length > 0
  const hasMainIngredients = report.recipe.mainIngredients && report.recipe.mainIngredients.length > 0
  const isAnalysisPossible = isNutritionEnabled && hasIngredients
  const analysis = report.fitnessGoalAnalysis
  const hasHealthierOptions = analysis.healthierOptions && analysis.healthierOptions.length > 0
  const hasPurchaseLocations =
    report.purchaseLocations &&
    (report.purchaseLocations.restaurants.length > 0 || report.purchaseLocations.stores.length > 0)

  // UPDATED: Destructure daily goals and detailed nutrients
  const { dailyGoals } = analysis
  const { nutritionalProfile } = report
  const hasDetailedNutrients = nutritionalProfile.detailedNutrients && nutritionalProfile.detailedNutrients.length > 0

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 50) return "text-yellow-500"
    return "text-red-500"
  }

  const BackButton = () => (
    <Link href="/" passHref>
      <Button variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Generate New Report
      </Button>
    </Link>
  )

  // Helper to calculate and format macro percentages
  const MacroItem = ({
    label,
    mealAmount,
    goalAmount,
    unit,
  }: {
    label: string
    mealAmount: number
    goalAmount: number
    unit: string
  }) => {
    const percentage = goalAmount > 0 ? (mealAmount / goalAmount) * 100 : 0
    return (
      <li className="flex justify-between items-baseline">
        <span>
          <strong>{label}:</strong> {mealAmount.toFixed(1)} {unit}
        </span>
        <span className="text-sm font-medium text-muted-foreground">{percentage.toFixed(0)}% of goal</span>
      </li>
    )
  }

  return (
    <main className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center mb-4">
          <h1 className="text-3xl font-bold">Your Food Intelligence Report</h1>
        </header>

        <div className="mb-8">
          <BackButton />
        </div>

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

        {/* Top Grid for summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* UPDATED: Nutritional Profile card with percentages and accordion */}
          <Card>
            <CardHeader>
              <CardTitle>Nutritional Profile</CardTitle>
            </CardHeader>
            <CardContent>
              {isNutritionEnabled && dailyGoals ? (
                <div className="space-y-3">
                  <ul className="space-y-1">
                    <li className="flex justify-between items-baseline">
                      <span>
                        <strong>Calories:</strong> {nutritionalProfile.calories.toFixed(0)}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        {((nutritionalProfile.calories / dailyGoals.calories) * 100).toFixed(0)}% of goal
                      </span>
                    </li>
                    <MacroItem
                      label="Protein"
                      mealAmount={nutritionalProfile.protein}
                      goalAmount={dailyGoals.protein}
                      unit="g"
                    />
                    <MacroItem
                      label="Carbs"
                      mealAmount={nutritionalProfile.carbohydrates}
                      goalAmount={dailyGoals.carbohydrates}
                      unit="g"
                    />
                    <MacroItem label="Fat" mealAmount={nutritionalProfile.fat} goalAmount={dailyGoals.fat} unit="g" />
                  </ul>
                  {hasDetailedNutrients && (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1" className="border-b-0">
                        <AccordionTrigger className="text-sm p-0 hover:no-underline">
                          View all nutrients
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-0 text-xs">
                          <ul className="space-y-1">
                            {nutritionalProfile.detailedNutrients.map((nutrient) => (
                              <li key={nutrient.name} className="flex justify-between">
                                <span>{nutrient.name}</span>
                                <span className="font-mono">
                                  {nutrient.amount.toFixed(1)} {nutrient.unit} ({nutrient.percentOfDailyNeeds}
                                  %DV)
                                </span>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Nutritional data could not be calculated.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estimated Cost</CardTitle>
            </CardHeader>
            <CardContent>
              {report.costBreakdown.totalCost > 0 ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                    <p className="text-2xl font-bold">${report.costBreakdown.totalCost.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Per Serving</p>
                    <p className="font-semibold">${report.costBreakdown.perServing.toFixed(2)}</p>
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-0">
                      <AccordionTrigger className="text-sm p-0 hover:no-underline">
                        View Ingredient Costs
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-0">
                        <ul className="space-y-1 text-xs">
                          {report.costBreakdown.ingredientCosts.map((item, i) => (
                            <li key={i} className="flex justify-between">
                              <span>{item.name}</span>
                              <span className="font-mono">${item.cost.toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ) : (
                <p className="text-muted-foreground">Cost analysis is not available.</p>
              )}
            </CardContent>
          </Card>

          {hasPurchaseLocations && (
            <Card className="sm:col-span-2">
              <CardHeader>
                <CardTitle>Where to Buy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.purchaseLocations.restaurants.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-md mb-2 flex items-center">
                      <Building className="w-4 h-4 mr-2 text-primary" />
                      Restaurants
                    </h3>
                    <div className="space-y-2">
                      {report.purchaseLocations.restaurants.map((item, i) => (
                        <div key={i}>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-sm text-primary hover:underline inline-flex items-center gap-1"
                          >
                            {item.name}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {report.purchaseLocations.stores.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-md mb-2 flex items-center">
                      <ShoppingCart className="w-4 h-4 mr-2 text-primary" />
                      Grocery Stores
                    </h3>
                    <div className="space-y-2">
                      {report.purchaseLocations.stores.map((item, i) => (
                        <div key={i}>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-sm text-primary hover:underline inline-flex items-center gap-1"
                          >
                            {item.name}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Full-width sections below */}
        <Card>
          <CardHeader>
            <CardTitle>Recipe & Preparation</CardTitle>
          </CardHeader>
          <CardContent>
            {hasIngredients ? (
              <>
                {hasMainIngredients && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Key Ingredients</h3>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 text-center">
                      {report.recipe.mainIngredients.map((ingredient) => (
                        <div key={ingredient.name}>
                          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                            <img
                              src={ingredient.imageUrl || "/placeholder.svg"}
                              alt={ingredient.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-xs mt-1.5 font-medium">{ingredient.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h3 className="font-semibold mb-2">Full Ingredient List</h3>
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
              </>
            ) : (
              <p className="text-muted-foreground">A recipe could not be determined from the image.</p>
            )}
          </CardContent>
        </Card>

        {hasHealthierOptions && (
          <Card>
            <CardHeader>
              <CardTitle>Healthier Ingredients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.healthierOptions.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div>
                    {item.isHealthy ? (
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    ) : (
                      <Lightbulb className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{item.originalIngredient}</p>
                    <p className="text-muted-foreground">{item.suggestion}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {isAnalysisPossible ? (
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
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>AI Health & Fitness Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Health analysis could not be performed because the recipe ingredients or nutritional information could
                not be determined from the image.
              </p>
            </CardContent>
          </Card>
        )}

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

        <div className="mt-8 text-center">
          <BackButton />
        </div>
      </div>
    </main>
  )
}
