import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  GetIngredientNameResponse,
  GetIngredientResponse,
  CreateRecipeRequest,
  GetRecipeResponse,
  GetNutrientNameResponse,
  GetMeasureUnitNameResponse,
  CreateIngredientRequest,
  GetRecipesResponse,
  CreatePlanRequest,
  GetDayPlanResponse,
} from "./types";

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BASE_URL }),
  reducerPath: "main",
  tagTypes: ["Ingredient"],
  endpoints: (build) => ({
    getIngredientName: build.query<Array<GetIngredientNameResponse>, string>({
      query: (query) => `ingredient/search/${query}`,
      providesTags: ["Ingredient"],
    }),
    getIngredient: build.query<GetIngredientResponse, number>({
      query: (fdc_id) => `ingredient/${fdc_id}`,
      providesTags: ["Ingredient"],
    }),
    createRecipe: build.mutation<string, CreateRecipeRequest>({
      query: (body) => ({
        url: "recipe",
        method: "POST",
        body,
      }),
    }),
    getRecipe: build.query<GetRecipeResponse, number>({
      query: (recipe_id) => `recipe/${recipe_id}`,
    }),
    getNutrientName: build.query<Array<GetNutrientNameResponse>, void>({
      query: () => `nutrient/name`,
    }),
    getMeasureUnitName: build.query<Array<GetMeasureUnitNameResponse>, void>({
      query: () => `measureunit/name`,
    }),
    createIngredient: build.mutation<string, CreateIngredientRequest>({
      query: (body) => ({
        url: "ingredient/add",
        method: "POST",
        body,
      }),
    }),
    getRecipes: build.query<Array<GetRecipesResponse>, void>({
      query: () => `recipe`,
    }),
    createPlan: build.mutation<string, CreatePlanRequest>({
      query: (body) => ({
        url: "plan/create",
        method: "POST",
        body,
      }),
    }),
    getPlan: build.query<GetDayPlanResponse, string>({
      query: (date) => `plan/${date}`,
    }),
  }),
});

export const { useGetIngredientNameQuery } = api;
export const { useGetIngredientQuery } = api;
export const { useCreateRecipeMutation } = api;
export const { useGetRecipeQuery } = api;
export const { useGetNutrientNameQuery } = api;
export const { useGetMeasureUnitNameQuery } = api;
export const { useCreateIngredientMutation } = api;
export const { useGetRecipesQuery, useCreatePlanMutation, useGetPlanQuery } =
  api;
