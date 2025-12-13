"use client"

import { useRouter } from "next/navigation"
import type { FoodIntelligenceReport } from "@/types"
import {
  Page,
  Block,
  BlockTitle,
  List,
  ListItem,
  Button,
  Chip,
} from "konsta/react"
import {
  CheckCircle,
  XCircle,
  Lightbulb,
  Building,
  ShoppingCart,
  Flame,
  Beef,
  Wheat,
  Droplet,
  DollarSign,
  ChefHat,
  Heart,
  Share2,
  ChevronLeft,
} from "lucide-react"
import { InteractiveIngredient } from "@/components/features/interactive-ingredient"

interface ReportDisplayProps {
  report: FoodIntelligenceReport
  onBack?: () => void
}

export function ReportDisplay({ report, onBack }: ReportDisplayProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.push("/")
    }
  }
  const isNutritionEnabled = report.nutritionalProfile.calories > 0
  const hasIngredients = report.recipe.ingredients && report.recipe.ingredients.length > 0
  const hasMainIngredients = report.recipe.mainIngredients && report.recipe.mainIngredients.length > 0
  const isAnalysisPossible = isNutritionEnabled && hasIngredients
  const analysis = report.fitnessGoalAnalysis
  const hasHealthierOptions = analysis.healthierOptions && analysis.healthierOptions.length > 0
  const hasPurchaseLocations =
    report.purchaseLocations &&
    (report.purchaseLocations.restaurants.length > 0 || report.purchaseLocations.stores.length > 0)

  const { dailyGoals } = analysis
  const { nutritionalProfile } = report

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500"
    if (score >= 50) return "text-amber-500"
    return "text-red-500"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-50"
    if (score >= 50) return "bg-amber-50"
    return "bg-red-50"
  }

  const MacroCard = ({
    icon: Icon,
    label,
    value,
    goal,
    unit,
    color
  }: {
    icon: any
    label: string
    value: number
    goal: number
    unit: string
    color: string
  }) => {
    const percent = goal > 0 ? Math.min((value / goal) * 100, 100) : 0
    return (
      <div className="bg-gray-50 rounded-2xl p-4 text-center">
        <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
        <p className="text-2xl font-bold text-gray-900">{value.toFixed(0)}<span className="text-sm text-gray-500">{unit}</span></p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
        <div className="h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
          <div className={`h-full rounded-full ${color.replace('text-', 'bg-')}`} style={{ width: `${percent}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">{percent.toFixed(0)}% daily</p>
      </div>
    )
  }

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: report.recipe.name,
          text: `Check out this ${report.recipe.name} recipe!`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    }
  }

  return (
    <Page className="bg-gray-50">
      {/* Custom header with safe area */}
      <div className="safe-area-top bg-white/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={handleBack} className="p-2 -ml-2">
            <ChevronLeft className="w-7 h-7 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 truncate flex-1 text-center mx-2">
            {report.recipe.name || "Report"}
          </h1>
          <button className="p-2 -mr-2" onClick={handleShare}>
            <Share2 className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        {report.imageUrl && (
          <img
            src={report.imageUrl}
            alt={report.recipe.name}
            className="w-full h-64 object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h1 className="text-2xl font-bold mb-1">{report.recipe.name}</h1>
          <p className="text-sm text-white/80 line-clamp-2">{report.recipe.description}</p>
        </div>
      </div>

      {/* Health Score Card */}
      {isAnalysisPossible && (
        <div className={`px-4 relative z-10 ${report.imageUrl ? '-mt-6' : 'mt-4'}`}>
          <div className={`${getScoreBg(analysis.healthScore)} rounded-2xl p-5 shadow-sm border border-gray-200`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Health Score</p>
                <p className={`text-4xl font-bold ${getScoreColor(analysis.healthScore)}`}>
                  {analysis.healthScore}<span className="text-lg text-gray-400">/100</span>
                </p>
              </div>
              <div className={`w-16 h-16 rounded-full ${getScoreBg(analysis.healthScore)} border-4 ${getScoreColor(analysis.healthScore).replace('text-', 'border-')} flex items-center justify-center`}>
                <Heart className={`w-8 h-8 ${getScoreColor(analysis.healthScore)}`} />
              </div>
            </div>
            <p className="text-sm text-gray-600">{analysis.mealSummary}</p>
          </div>
        </div>
      )}

      {/* Macros Grid */}
      {isNutritionEnabled && dailyGoals && (
        <div className="px-4 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Nutrition</h3>
          <div className="grid grid-cols-4 gap-2">
            <MacroCard icon={Flame} label="Calories" value={nutritionalProfile.calories} goal={dailyGoals.calories} unit="" color="text-orange-500" />
            <MacroCard icon={Beef} label="Protein" value={nutritionalProfile.protein} goal={dailyGoals.protein} unit="g" color="text-red-500" />
            <MacroCard icon={Wheat} label="Carbs" value={nutritionalProfile.carbohydrates} goal={dailyGoals.carbohydrates} unit="g" color="text-amber-500" />
            <MacroCard icon={Droplet} label="Fat" value={nutritionalProfile.fat} goal={dailyGoals.fat} unit="g" color="text-blue-500" />
          </div>
        </div>
      )}

      {/* Cost */}
      {report.costBreakdown.totalCost > 0 && (
        <div className="px-4 mt-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Estimated Cost</p>
                <p className="text-xl font-bold text-gray-900">${report.costBreakdown.totalCost.toFixed(2)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Per serving</p>
              <p className="text-lg font-semibold text-gray-700">${report.costBreakdown.perServing.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Ingredients */}
      {hasMainIngredients && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 px-4 mb-3">Key Ingredients</h3>
          <div className="px-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 pb-2">
              {report.recipe.mainIngredients.map((ingredient) => (
                <InteractiveIngredient key={ingredient.name} ingredient={ingredient} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recipe Section */}
      {hasIngredients && (
        <div className="mt-6 bg-white rounded-t-3xl pt-6">
          <div className="flex items-center gap-2 px-4 mb-4">
            <ChefHat className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Recipe</h3>
          </div>

          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 mt-2 mb-2">Ingredients</h4>
          <List strongIos insetIos className="!my-0 !mx-4">
            {report.recipe.ingredients.map((ing, i) => (
              <ListItem
                key={i}
                title={ing.name}
                after={<span className="text-gray-500 text-sm">{ing.amount}</span>}
              />
            ))}
          </List>

          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 mt-4 mb-2">Instructions</h4>
          <div className="px-4 pb-4">
            {report.recipe.steps.map((step, i) => (
              <div key={i} className="flex gap-3 mb-4">
                <div className="w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-gray-700 text-sm pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Analysis */}
      {isAnalysisPossible && (
        <div className="bg-white px-4 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Analysis</h3>

          {analysis.positivePoints.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="font-medium text-emerald-700">Positive Points</span>
              </div>
              <div className="space-y-2 pl-7">
                {analysis.positivePoints.map((point, i) => (
                  <p key={i} className="text-sm text-gray-600">{point}</p>
                ))}
              </div>
            </div>
          )}

          {analysis.areasForImprovement.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-amber-500" />
                <span className="font-medium text-amber-700">Areas to Improve</span>
              </div>
              <div className="space-y-2 pl-7">
                {analysis.areasForImprovement.map((point, i) => (
                  <p key={i} className="text-sm text-gray-600">{point}</p>
                ))}
              </div>
            </div>
          )}

          {analysis.generalTips.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-blue-700">Tips</span>
              </div>
              <div className="space-y-2 pl-7">
                {analysis.generalTips.map((tip, i) => (
                  <p key={i} className="text-sm text-gray-600">{tip}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Healthier Options */}
      {hasHealthierOptions && (
        <div className="bg-white px-4 pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Swap Suggestions</h3>
          <List strongIos insetIos className="!my-0">
            {analysis.healthierOptions.map((item, i) => (
              <ListItem
                key={i}
                title={item.originalIngredient}
                subtitle={item.suggestion}
                media={
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.isHealthy ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                    {item.isHealthy ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                }
              />
            ))}
          </List>
        </div>
      )}

      {/* Where to Buy */}
      {hasPurchaseLocations && (
        <div className="bg-white px-4 pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Where to Get It</h3>

          {report.purchaseLocations.restaurants.length > 0 && (
            <List strongIos insetIos className="!my-0">
              {report.purchaseLocations.restaurants.map((item, i) => (
                <ListItem
                  key={i}
                  title={item.name}
                  subtitle={item.description}
                  link
                  onClick={() => window.open(item.url, "_blank")}
                  media={
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Building className="w-4 h-4 text-orange-600" />
                    </div>
                  }
                />
              ))}
            </List>
          )}

          {report.purchaseLocations.stores.length > 0 && (
            <List strongIos insetIos className="!mt-2">
              {report.purchaseLocations.stores.map((item, i) => (
                <ListItem
                  key={i}
                  title={item.name}
                  subtitle={item.description}
                  link
                  onClick={() => window.open(item.url, "_blank")}
                  media={
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-green-600" />
                    </div>
                  }
                />
              ))}
            </List>
          )}
        </div>
      )}

      {/* New Report Button */}
      <Block className="pb-8 bg-white px-4">
        <Button large rounded onClick={handleBack}>
          Analyze Another Meal
        </Button>
      </Block>
    </Page>
  )
}
