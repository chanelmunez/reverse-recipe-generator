import type { UserProfile, NutritionalProfile, FitnessGoalAnalysis, ActivityLevel } from "@/types"

const PAL_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

const GOAL_ADJUSTMENTS: Record<UserProfile["fitnessGoal"], number> = {
  weight_loss: -500,
  maintenance: 0,
  muscle_gain: 300,
}

function calculateBMR(profile: UserProfile): number {
  const { weight, height, age, sex } = profile
  if (!weight || !height || !age || !sex) return 0
  const sexModifier = sex === "male" ? 5 : -161
  return 10 * weight + 6.25 * height - 5 * age + sexModifier
}

export function analyzeFitnessGoals(userProfile: UserProfile, mealNutrition: NutritionalProfile): FitnessGoalAnalysis {
  const { activityLevel, fitnessGoal } = userProfile
  if (!activityLevel || !fitnessGoal) {
    return { tdee: 0, goalCalories: 0, feedback: "User profile is incomplete." }
  }

  const bmr = calculateBMR(userProfile)
  const tdee = bmr * PAL_FACTORS[activityLevel]
  const goalCalories = tdee + GOAL_ADJUSTMENTS[fitnessGoal]
  const mealCalories = mealNutrition.calories
  const percentageOfGoal = (mealCalories / goalCalories) * 100
  let feedback = ""

  if (fitnessGoal === "weight_loss") {
    feedback = `This meal is ~${percentageOfGoal.toFixed(0)}% of your daily target for weight loss. A solid choice with substantial protein.`
  } else if (fitnessGoal === "maintenance") {
    feedback = `This meal is ~${percentageOfGoal.toFixed(0)}% of your daily needs. A balanced option to help maintain your current weight.`
  } else {
    feedback = `This meal is ~${percentageOfGoal.toFixed(0)}% of your daily calorie surplus. The high protein is excellent for muscle growth.`
  }

  return { tdee, goalCalories, feedback }
}
