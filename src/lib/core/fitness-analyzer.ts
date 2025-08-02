import type { UserProfile, NutritionalProfile, FitnessGoalAnalysis, ActivityLevel } from "../../types"

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

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation.
 */
function calculateBMR(profile: UserProfile): number {
  const { weight, height, age, sex } = profile
  if (!weight || !height || !age || !sex) return 0

  const sexModifier = sex === "male" ? 5 : -161
  return 10 * weight + 6.25 * height - 5 * age + sexModifier
}

/**
 * Analyzes a meal's nutritional profile against a user's fitness goals.
 */
export function analyzeFitnessGoals(userProfile: UserProfile, mealNutrition: NutritionalProfile): FitnessGoalAnalysis {
  const { activityLevel, fitnessGoal } = userProfile
  if (!activityLevel || !fitnessGoal) {
    return {
      tdee: 0,
      goalCalories: 0,
      feedback: "User profile is incomplete. Cannot provide analysis.",
    }
  }

  const bmr = calculateBMR(userProfile)
  const tdee = bmr * PAL_FACTORS[activityLevel]
  const goalCalories = tdee + GOAL_ADJUSTMENTS[fitnessGoal]
  const mealCalories = mealNutrition.calories

  let feedback = ""
  const percentageOfGoal = (mealCalories / goalCalories) * 100

  if (fitnessGoal === "weight_loss") {
    feedback = `This meal contains ${mealCalories} calories, which is about ${percentageOfGoal.toFixed(0)}% of your daily target for weight loss. It seems like a solid choice, providing substantial protein to keep you full.`
  } else if (fitnessGoal === "maintenance") {
    feedback = `With ${mealCalories} calories, this meal fits well within a maintenance diet, making up roughly ${percentageOfGoal.toFixed(0)}% of your daily needs. It's a balanced option to help you maintain your current weight.`
  } else {
    feedback = `This ${mealCalories} calorie meal is a great step towards your muscle gain goal, covering about ${percentageOfGoal.toFixed(0)}% of your daily calorie surplus. The high protein content is excellent for muscle repair and growth.`
  }

  return {
    tdee,
    goalCalories,
    feedback,
  }
}
