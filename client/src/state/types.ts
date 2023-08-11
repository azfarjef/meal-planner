export interface GetIngredientNameResponse {
  fdc_id: number;
  description: string;
}

interface FoodPortion {
  id: number;
  measureUnit: string;
  gramWeight: number;
  amount: number;
  portion_description: string;
  modifier: string | null;
}

interface FoodNutrient {
  id: number;
  name: string;
  unitName: string;
  amount: number;
}

export interface GetIngredientResponse {
  fdc_id: number;
  description: string;
  foodportions: Array<FoodPortion>;
  foodnutrients: Array<FoodNutrient>;
}

// export interface CreateRecipeRequest {
//   name: string;
//   preparation_time: number;
//   servings: number;
//   instructions: Array<string>;
//   image: string;
//   author_id: number;
//   author: string;
//   ingredients: Array<{
//     fdc_id: number | null;
//     name: string;
//     amount: number;
//     amount_alt: number;
//     unit_alt: string;
//   }>;
// }

export interface CreateRecipeRequest {
  name: string;
  source: string;
  preparation_time: number;
  servings: number;
  instructions: Array<string>;
  image: string;
  author_id: number;
  author: string;
  ingredients: Array<{
    fdc_id: number | null;
    name: string;
    amount: number;
    amount_alt: number;
    unit_alt: string | null;
    header: string;
  }>;
}

// export interface CreateRecipeRequest {
//   name: string;
//   preparation_time: number;
//   servings: number;
//   instructions: Array<string>;
//   image: string;
//   author_id: number;
//   author: string;
//   ingredients: Array<{
//     header: string;
//     ingredients: Array<{
//       fdc_id: number | null;
//       name: string;
//       amount: number;
//       amount_alt: number;
//       unit_alt: string;
//     }>;
//   }>;
// }

export interface GetRecipeResponse {
  name: string;
  preparation_time: number;
  servings: number;
  instructions: Array<string>;
  image: string;
  author_id: number;
  author: string;
  created_at: string;
  updated_at: string;
  id: number;
  source: string;
  ingredients: Array<{
    id: number;
    recipe_id: number;
    fdc_id: number;
    name: string;
    amount: number;
    amount_alt: number;
    unit_alt: string;
    header: string;
  }>;
  nutrients: Array<{
    id: number;
    recipe_id: number;
    nutrient_id: number;
    name: string;
    amount: number;
    unit_name: string;
    dv: number;
  }>;
}

export interface GetNutrientNameResponse {
  id: number;
  name: string;
  unit_name: string;
}

export interface GetMeasureUnitNameResponse {
  id: number;
  name: string;
}

export interface CreateIngredientRequest {
  description: string;
  barcode: string;
  nutrients: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
  }>;
  portions: Array<{
    id: number;
    name: string;
    gram_weight: number;
  }>;
}

export interface GetRecipesResponse {
  id: number;
  name: string;
  preparation_time: number;
  image: string;
}
