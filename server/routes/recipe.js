import express from "express";
import pool from "../db.js";

const router = express.Router();

const userdata1 = {
  id: 1,
  name: "AJ",
  dob: "1996-01-01",
  age: 27,
  gender: "male",
  height: 165,
  weight: 53,
  activity: "light",
  weightGoal: "mild gain",
  nutritions: {
    calories: 2218,
    carbs: 270,
    protein: 135,
    fat: 63,
    vitaminA: 900,
    vitaminC: 90,
    vitaminD: 20,
    vitaminE: 15,
    vitaminK: 120,
    thiamin: 1.2,
    riboflavin: 1.3,
    niacin: 16,
    vitaminB6: 1.3,
    folate: 400,
    vitaminB12: 2.4,
    calcium: 1000,
    magnesium: 350,
    phosphorus: 700,
    potassium: 4700,
    zinc: 11,
    iron: 18,
    pantothenicAcid: 5,
    cholesterol: 250,
    saturatedFat: 20,
    sugar: 50,
    water: 3000,
    sodium: 2300,
  },
};

const userdata = {
  id: 1,
  name: "AJ",
  dob: "1996-01-01",
  age: 27,
  gender: "male",
  height: 165,
  weight: 53,
  activity: "light",
  weightGoal: "mild gain",
  nutritions: {
    1008: 2218,
    2039: 270,
    1003: 135,
    1004: 63,
    1106: 900,
    1162: 90,
    1114: 20,
    1109: 15,
    1183: 120,
    1165: 1.2,
    1166: 1.3,
    1167: 16,
    1175: 1.3,
    1186: 400,
    1178: 2.4,
    1087: 1000,
    1090: 350,
    1091: 700,
    1092: 4700,
    1095: 11,
    1089: 18,
    1253: 250,
    1258: 20,
    1063: 50,
    1093: 2300,
    1079: 30,
    1051: 3000,
  },
};

const nutrientOrder = [
  1008, 2039, 1005, 1003, 1004, 1063, 1093, 1079, 1258, 1253, 1087, 1090, 1092,
  1089, 1095, 1091, 1106, 1165, 1166, 1167, 1175, 1186, 1178, 1162, 1114, 1109,
  1183, 1184, 1185, 1051,
];

// req.body = {
//   name: "recipe name",
//   preparation_time: 10,
//   servings: 2,
//   instructions: [
//     "In a large bowl, whisk together the flour, sugar, baking powder, and salt.",
//     "Flip the pancakes and cook for another minute or until golden brown.",
//     "Serve with your favorite toppings.",
//   ],
//   image:
//     "https://www.modernhoney.com/wp-content/uploads/2019/08/Classic-Pancakes-1.jpg",
//   author_id: 1,
//   author: "admin",
//   ingredients: [
//     {
//       fdc_id: 1,
//       name: "all-purpose flour",
//       amount: 1.5,
//     },
//     {
//       fdc_id: 2,
//       name: "granulated sugar",
//       amount: 3,
//     },
//   ],
//   nutrients: [
//     {
//       nutrient_id: 1,
//       name: "Energy",
//       unit_name: "KCAL",
//       amount: 100,
//     },
//     {
//       nutrient_id: 2,
//       name: "Protein",
//       unit_name: "G",
//       amount: 10,
//     },
//   ],
// };

router.post("/", async (req, res) => {
  console.log(req.body);

  const {
    name,
    source,
    preparation_time,
    servings,
    instructions,
    image,
    author_id,
    author,
    ingredients,
  } = req.body;

  const created_at = new Date();

  try {
    const recipeQuery = `
  		INSERT INTO recipe (name, source, preparation_time, servings, instructions, image, author_id, author, created_at, updated_at)
  		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  		RETURNING id;
  	`;

    const recipeValues = [
      name,
      source,
      preparation_time,
      servings,
      instructions,
      image,
      author_id,
      author,
      created_at,
      created_at,
    ];
    const recipeResult = await pool.query(recipeQuery, recipeValues);
    const recipeId = recipeResult.rows[0].id;

    for (const ingredient of ingredients) {
      const ingredientQuery = `
  			INSERT INTO recipe_ingredient (recipe_id, fdc_id, name, amount, amount_alt, unit_alt, header)
  			VALUES ($1, $2, $3, $4, $5, $6, $7);
  		`;

      const ingredientValues = [
        recipeId,
        ingredient.fdc_id,
        ingredient.name,
        ingredient.amount,
        ingredient.amount_alt,
        ingredient.unit_alt,
        ingredient.header,
      ];
      await pool.query(ingredientQuery, ingredientValues);
    }

    const totalNutrients = {};
    for (const ingredient of ingredients) {
      const { fdc_id, amount } = ingredient;

      const query = `
  			SELECT
  				f.fdc_id,
  				f.description,
  				(
  					SELECT COALESCE(json_agg(json_build_object(
  						'measureUnit', mu.name,
  						'gramWeight', fp.gram_weight,
  						'amount', fp.amount
  					)), '[]')
  					FROM food_portion fp
  					JOIN measure_unit mu ON fp.measure_unit_id = mu.id
  					WHERE fp.fdc_id = f.fdc_id
  				) AS foodPortions,
  				(
  					SELECT json_agg(json_build_object(
  						'id', n.id,
  						'name', n.name,
  						'unitName', n.unit_name,
  						'amount', fn.amount
  					))
  					FROM nutrient n
  					JOIN food_nutrient fn ON n.id = fn.nutrient_id
  					WHERE fn.fdc_id = f.fdc_id
  				) AS foodNutrients
  			FROM food f
  			WHERE f.fdc_id = $1;
  		`;

      const result = await pool.query(query, [fdc_id]);
      const food = result.rows[0];

      if (food) {
        for (const nutrient of food.foodnutrients) {
          const { id, name, amount: nutrientAmount } = nutrient;

          if (!totalNutrients[id]) {
            totalNutrients[id] = {
              id,
              name,
              unitName: nutrient.unitName,
              amount: 0,
            };
          }

          totalNutrients[id].amount += (nutrientAmount / 100) * amount;

          if (name === "Sodium, Na") {
            console.log(
              `food: ${food.description} Sodium amount: ${totalNutrients[id].amount}`
            );
          }
        }
      } else {
        console.error(`Food with fdc_id ${fdc_id} not found`);
      }
    }

    const nutrients = Object.values(totalNutrients);
    for (const nutrient of nutrients) {
      const query = `
  			INSERT INTO recipe_nutrient (recipe_id, nutrient_id, name, unit_name, amount)
  			VALUES ($1, $2, $3, $4, $5);
  		`;

      const values = [
        recipeId,
        nutrient.id,
        nutrient.name,
        nutrient.unitName,
        nutrient.amount.toFixed(5),
      ];
      await pool.query(query, values);

      if (nutrient.name === "Sodium, Na") {
        console.log(`recipe: ${name} Sodium amount: ${nutrient.amount}`);
      }
    }

    res.status(201).json({ message: "Recipe created successfully", recipeId });
    console.log(`Recipe with id ${recipeId} created successfully`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  console.log(`Fetching recipe with id ${id}`);

  try {
    const recipeQuery = `
  		SELECT * FROM recipe WHERE id = $1;
  	`;

    const recipeResult = await pool.query(recipeQuery, [id]);
    const recipe = recipeResult.rows[0];

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const ingredientsQuery = `
  		SELECT * FROM recipe_ingredient WHERE recipe_id = $1;
  	`;

    const ingredientsResult = await pool.query(ingredientsQuery, [id]);
    const ingredients = ingredientsResult.rows;

    for (const ingredient of ingredients) {
      ingredient.amount = Number(ingredient.amount);
      ingredient.amount_alt = Number(ingredient.amount_alt);
    }

    const nutrientsQuery = `
    SELECT * FROM recipe_nutrient WHERE recipe_id = $1;
  	`;

    const nutrientsResult = await pool.query(nutrientsQuery, [id]);
    const nutri = nutrientsResult.rows;

    // Sort nutrients by nutrientOrder
    const sortedNutrients = nutri.sort((a, b) => {
      const aIndex = nutrientOrder.indexOf(a.nutrient_id);
      const bIndex = nutrientOrder.indexOf(b.nutrient_id);

      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });

    const combinedNutrients = {};

    sortedNutrients.forEach((nutrient) => {
      const { nutrient_id, name, amount } = nutrient;

      if (name.includes("Carbohydrate")) {
        if (!combinedNutrients["Carbohydrates"]) {
          combinedNutrients["Carbohydrates"] = {
            ...nutrient,
            nutrient_id: 2039,
            amount: 0,
            dv: userdata.nutritions[2039],
          };
        }
        combinedNutrients["Carbohydrates"].amount += Number(amount);
      } else if (name.includes("Vitamin K")) {
        if (!combinedNutrients["Vitamin K"]) {
          combinedNutrients["Vitamin K"] = {
            ...nutrient,
            nutrient_id: 1183,
            amount: 0,
            dv: userdata.nutritions[1183],
          };
        }
        combinedNutrients["Vitamin K"].amount += Number(amount);
      } else {
        combinedNutrients[name] = {
          ...nutrient,
          amount: Number(amount),
          dv: userdata.nutritions[nutrient_id] || 0,
        };
      }
    });

    const nutrients = Object.values(combinedNutrients);

    // for (const nutrient of nutrients) {
    //   nutrient.amount = Number(nutrient.amount);
    //   nutrient.dv = userdata.nutritions[nutrient.nutrient_id];
    // }

    console.log(nutrients.slice(0, 30));

    res.status(200).json({ ...recipe, ingredients, nutrients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get recipe" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  console.log(`Deleting recipe with id ${id}`);

  try {
    const query = `
  		DELETE FROM recipe WHERE id = $1;
      DELETE FROM recipe_ingredient WHERE recipe_id = $1;
      DELETE FROM recipe_nutrient WHERE recipe_id = $1;
  	`;

    await pool.query(query, [id]);

    res.status(200).json({ message: "Recipe deleted successfully" });
    console.log(`Recipe with id ${id} deleted successfully`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

router.get("/", async (req, res) => {
  console.log("Fetching all recipes");

  try {
    const query = `
  		SELECT id, name, preparation_time, image FROM recipe;
  	`;

    const result = await pool.query(query);
    const recipes = result.rows;

    res.status(200).json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get recipes" });
  }
});

const a = {
  name: "Harvest Cinnamon Rolls",
  preparation_time: 90,
  servings: 15,
  instructions: [
    "In a large bowl or in the bowl of a 5-quart stand mixer, add all the ingredients. Using a dough hook, mix all the ingredients together into a uniform dough.  It should form a nice elastic ball.  If you think the dough is too moist, add additional flour (a tablespoon at a time).  The same is true if the dough is looking dry and gnarly.  Add warm water (a tablespoon at a time).",
    "Turn the dough out onto a floured surface and knead until elastic, about 15 minutes.  In an electric mixer, it should take about 9 minutes.  Cover the bowl with plastic wrap and let rest for 10 to 15 minutes.",
    "After the first resting period, turn the dough out onto a lightly-oiled surface (I use a nonstick cooking spray), and knead until elastic, approximately 10 minutes.  Place the kneaded dough back into the bowl, then cover the bowl with plastic wrap and let rise until double in size.",
    "Butter a 9 x 13 x 2-inch baking pan; set aside. After dough has risen, using your rolling pin, roll and stretch the dough into approximately a 15 x 24-inch rectangle.",
    "Brush the 1/2 cup softened butter (listed below in the Cinnamon Filling) over the top of the dough with a rubber spatula or a pastry brush. Sprinkle Cinnamon Filling over the butter on the prepared dough.",
    "Starting with long edge, roll up dough; pinch seams to seal.  NOTE: Rolling the log too tightly will result in cinnamon rolls whose centers pop up above the rest of them as they bake.",
    "With a knife, lightly mark roll into 1 1/2-inch section.  Use a sharp knife (I like to use a serrated knife and saw very gently) or slide a 12-inch piece of dental floss or heavy thread underneath.  By bringing the ends of the floss up and crisscrossing them at the top of each mark, you can cut through the roll by pulling the strings in opposite directions. Place cut side up in a prepared baking pan, flattening them only slightly. The unbaked cinnamon rolls should not touch each other before rising and baking. Do not pack the unbaked cinnamon rolls together.",
    "Cover and let rise in a warm place for approximately 45 to 60 minutes or until doubled in size (after rising, rolls should be touching each other and the sides of the pan).",
    "Preheat oven to 180 degrees C.  Bake approximately 20 to 25 minutes in a regular oven until they are a light golden brown.  A good check is to use an instant digital thermometer to test your bread.  The temperature should be between 88 and 94 degrees C.",
    "Remove from oven and let cool slightly.  Spread prepared Cream Cheese Frosting over the cinnamon rolls while still warm.  Best served warm, but room temperature is also great!",
    "In a medium bowl, combine cream cheese and butter until creamy.  Add powdered sugar, vanilla extract, and lemon extract or oil until well mixed and creamy.  Refrigerate cream cheese frosting until ready to use and then bring to room temperature before spreading.",
  ],
  image:
    "https://whatscookingamerica.net/wp-content/uploads/2015/06/perfect-cinnamon-rolls_topped-with-frosting-vertical-4x6-opt.jpg",
  author_id: 1,
  author: "admin",
  created_at: "2023-06-06T11:55:08.236Z",
  updated_at: "2023-06-06T11:55:08.236Z",
  id: 8,
  source: "https://whatscookingamerica.net/bread/cinnamonrollsfantastic.htm",
  ingredients: [
    {
      id: 10,
      recipe_id: 8,
      fdc_id: 172217,
      name: "Milk, whole, 3.25% milkfat, without added vitamin A and vitamin D",
      amount: "244",
      amount_alt: "1",
      unit_alt: "cup",
      header: "Cinnamon Roll Dough",
    },
    {
      id: 11,
      recipe_id: 8,
      fdc_id: 173647,
      name: "Beverages, water, tap, drinking",
      amount: "60",
      amount_alt: "60",
      unit_alt: null,
      header: "Cinnamon Roll Dough",
    },
    {
      id: 12,
      recipe_id: 8,
      fdc_id: 173471,
      name: "Vanilla extract",
      amount: "4.2",
      amount_alt: "1",
      unit_alt: "tsp",
      header: "Cinnamon Roll Dough",
    },
    {
      id: 13,
      recipe_id: 8,
      fdc_id: 173410,
      name: "Butter, salted",
      amount: "113.5",
      amount_alt: "0.5",
      unit_alt: "cup",
      header: "Cinnamon Roll Dough",
    },
    {
      id: 14,
      recipe_id: 8,
      fdc_id: 171287,
      name: "Egg, whole, raw, fresh",
      amount: "88",
      amount_alt: "2",
      unit_alt: "medium",
      header: "Cinnamon Roll Dough",
    },
    {
      id: 15,
      recipe_id: 8,
      fdc_id: 173468,
      name: "Salt, table",
      amount: "3",
      amount_alt: "0.5",
      unit_alt: "tsp",
      header: "Cinnamon Roll Dough",
    },
    {
      id: 16,
      recipe_id: 8,
      fdc_id: 169655,
      name: "Sugars, granulated",
      amount: "100",
      amount_alt: "0.5",
      unit_alt: "cup",
      header: "Cinnamon Roll Dough",
    },
    {
      id: 17,
      recipe_id: 8,
      fdc_id: 790146,
      name: "Flour, bread, white, enriched, unbleached",
      amount: "600",
      amount_alt: "600",
      unit_alt: null,
      header: "Cinnamon Roll Dough",
    },
    {
      id: 18,
      recipe_id: 8,
      fdc_id: 2345532,
      name: "Yeast",
      amount: "9",
      amount_alt: "9",
      unit_alt: null,
      header: "Cinnamon Roll Dough",
    },
    {
      id: 19,
      recipe_id: 8,
      fdc_id: 173410,
      name: "Butter, salted",
      amount: "113.5",
      amount_alt: "0.5",
      unit_alt: "cup",
      header: "Cinnamon Filling",
    },
    {
      id: 20,
      recipe_id: 8,
      fdc_id: 168833,
      name: "Sugars, brown",
      amount: "220",
      amount_alt: "1",
      unit_alt: "cup packed",
      header: "Cinnamon Filling",
    },
    {
      id: 21,
      recipe_id: 8,
      fdc_id: 171320,
      name: "Spices, cinnamon, ground",
      amount: "31.2",
      amount_alt: "4",
      unit_alt: "tbsp",
      header: "Cinnamon Filling",
    },
    {
      id: 22,
      recipe_id: 8,
      fdc_id: 173418,
      name: "Cheese, cream",
      amount: "56.7",
      amount_alt: "2",
      unit_alt: "oz",
      header: "Cream Cheese Frosting",
    },
    {
      id: 23,
      recipe_id: 8,
      fdc_id: 173410,
      name: "Butter, salted",
      amount: "56.75",
      amount_alt: "0.25",
      unit_alt: "cup",
      header: "Cream Cheese Frosting",
    },
    {
      id: 24,
      recipe_id: 8,
      fdc_id: 169656,
      name: "Sugars, powdered",
      amount: "120",
      amount_alt: "1",
      unit_alt: "cup unsifted",
      header: "Cream Cheese Frosting",
    },
    {
      id: 25,
      recipe_id: 8,
      fdc_id: 173471,
      name: "Vanilla extract",
      amount: "2.1",
      amount_alt: "0.5",
      unit_alt: "tsp",
      header: "Cream Cheese Frosting",
    },
    {
      id: 26,
      recipe_id: 8,
      fdc_id: 171015,
      name: "Oil, palm",
      amount: "0.5625",
      amount_alt: "0.125",
      unit_alt: "tsp",
      header: "Cream Cheese Frosting",
    },
  ],
  nutrients: [
    {
      id: 337,
      recipe_id: 8,
      nutrient_id: 1003,
      name: "Protein",
      amount: "115.58998",
      unit_name: "G",
    },
    {
      id: 338,
      recipe_id: 8,
      nutrient_id: 1004,
      name: "Total lipid (fat)",
      amount: "277.56277",
      unit_name: "G",
    },
    {
      id: 339,
      recipe_id: 8,
      nutrient_id: 1005,
      name: "Carbohydrate, by difference",
      amount: "917.54972",
      unit_name: "G",
    },
    {
      id: 340,
      recipe_id: 8,
      nutrient_id: 1007,
      name: "Ash",
      amount: "17.48039",
      unit_name: "G",
    },
    {
      id: 341,
      recipe_id: 8,
      nutrient_id: 1008,
      name: "Energy",
      amount: "33605.53438",
      unit_name: "KCAL",
    },
    {
      id: 342,
      recipe_id: 8,
      nutrient_id: 1010,
      name: "Sucrose",
      amount: "307.83824",
      unit_name: "G",
    },
    {
      id: 343,
      recipe_id: 8,
      nutrient_id: 1011,
      name: "Glucose",
      amount: "3.62008",
      unit_name: "G",
    },
    {
      id: 344,
      recipe_id: 8,
      nutrient_id: 1012,
      name: "Fructose",
      amount: "2.78832",
      unit_name: "G",
    },
    {
      id: 345,
      recipe_id: 8,
      nutrient_id: 1013,
      name: "Lactose",
      amount: "14.45392",
      unit_name: "G",
    },
    {
      id: 346,
      recipe_id: 8,
      nutrient_id: 1014,
      name: "Maltose",
      amount: "0.00000",
      unit_name: "G",
    },
    {
      id: 347,
      recipe_id: 8,
      nutrient_id: 1018,
      name: "Alcohol, ethyl",
      amount: "2.16720",
      unit_name: "G",
    },
    {
      id: 348,
      recipe_id: 8,
      nutrient_id: 1051,
      name: "Water",
      amount: "492.22781",
      unit_name: "G",
    },
    {
      id: 349,
      recipe_id: 8,
      nutrient_id: 1057,
      name: "Caffeine",
      amount: "0.00000",
      unit_name: "MG",
    },
    {
      id: 350,
      recipe_id: 8,
      nutrient_id: 1058,
      name: "Theobromine",
      amount: "0.00000",
      unit_name: "MG",
    },
    {
      id: 351,
      recipe_id: 8,
      nutrient_id: 1075,
      name: "Galactose",
      amount: "0.00000",
      unit_name: "G",
    },
    {
      id: 352,
      recipe_id: 8,
      nutrient_id: 1079,
      name: "Fiber, total dietary",
      amount: "18.98820",
      unit_name: "G",
    },
    {
      id: 353,
      recipe_id: 8,
      nutrient_id: 1087,
      name: "Calcium, Ca",
      amount: "1065.43600",
      unit_name: "MG",
    },
    {
      id: 354,
      recipe_id: 8,
      nutrient_id: 1089,
      name: "Iron, Fe",
      amount: "39.52498",
      unit_name: "MG",
    },
    {
      id: 355,
      recipe_id: 8,
      nutrient_id: 1090,
      name: "Magnesium, Mg",
      amount: "305.90400",
      unit_name: "MG",
    },
    {
      id: 356,
      recipe_id: 8,
      nutrient_id: 1091,
      name: "Phosphorus, P",
      amount: "1338.44500",
      unit_name: "MG",
    },
    {
      id: 357,
      recipe_id: 8,
      nutrient_id: 1092,
      name: "Potassium, K",
      amount: "1875.45000",
      unit_name: "MG",
    },
    {
      id: 358,
      recipe_id: 8,
      nutrient_id: 1093,
      name: "Sodium, Na",
      amount: "3488.84750",
      unit_name: "MG",
    },
    {
      id: 359,
      recipe_id: 8,
      nutrient_id: 1095,
      name: "Zinc, Zn",
      amount: "10.32637",
      unit_name: "MG",
    },
    {
      id: 360,
      recipe_id: 8,
      nutrient_id: 1098,
      name: "Copper, Cu",
      amount: "1.57381",
      unit_name: "MG",
    },
    {
      id: 361,
      recipe_id: 8,
      nutrient_id: 1101,
      name: "Manganese, Mn",
      amount: "10.16312",
      unit_name: "MG",
    },
    {
      id: 362,
      recipe_id: 8,
      nutrient_id: 1103,
      name: "Selenium, Se",
      amount: "249.19890",
      unit_name: "UG",
    },
    {
      id: 363,
      recipe_id: 8,
      nutrient_id: 1104,
      name: "Vitamin A, IU",
      amount: "8683.36950",
      unit_name: "IU",
    },
    {
      id: 364,
      recipe_id: 8,
      nutrient_id: 1105,
      name: "Retinol",
      amount: "2326.36350",
      unit_name: "UG",
    },
    {
      id: 365,
      recipe_id: 8,
      nutrient_id: 1106,
      name: "Vitamin A, RAE",
      amount: "2373.20600",
      unit_name: "UG",
    },
    {
      id: 366,
      recipe_id: 8,
      nutrient_id: 1107,
      name: "Carotene, beta",
      amount: "533.80200",
      unit_name: "UG",
    },
    {
      id: 367,
      recipe_id: 8,
      nutrient_id: 1108,
      name: "Carotene, alpha",
      amount: "0.87900",
      unit_name: "UG",
    },
    {
      id: 368,
      recipe_id: 8,
      nutrient_id: 1109,
      name: "Vitamin E (alpha-tocopherol)",
      amount: "8.97892",
      unit_name: "MG",
    },
    {
      id: 369,
      recipe_id: 8,
      nutrient_id: 1110,
      name: "Vitamin D (D2 + D3), International Units",
      amount: "77.04000",
      unit_name: "IU",
    },
    {
      id: 370,
      recipe_id: 8,
      nutrient_id: 1112,
      name: "Vitamin D3 (cholecalciferol)",
      amount: "2.00400",
      unit_name: "UG",
    },
    {
      id: 371,
      recipe_id: 8,
      nutrient_id: 1114,
      name: "Vitamin D (D2 + D3)",
      amount: "2.00400",
      unit_name: "UG",
    },
    {
      id: 372,
      recipe_id: 8,
      nutrient_id: 1120,
      name: "Cryptoxanthin, beta",
      amount: "49.30200",
      unit_name: "UG",
    },
    {
      id: 373,
      recipe_id: 8,
      nutrient_id: 1122,
      name: "Lycopene",
      amount: "4.68000",
      unit_name: "UG",
    },
    {
      id: 374,
      recipe_id: 8,
      nutrient_id: 1123,
      name: "Lutein + zeaxanthin",
      amount: "515.87300",
      unit_name: "UG",
    },
    {
      id: 375,
      recipe_id: 8,
      nutrient_id: 1125,
      name: "Tocopherol, beta",
      amount: "0.00880",
      unit_name: "MG",
    },
    {
      id: 376,
      recipe_id: 8,
      nutrient_id: 1126,
      name: "Tocopherol, gamma",
      amount: "3.92975",
      unit_name: "MG",
    },
    {
      id: 377,
      recipe_id: 8,
      nutrient_id: 1127,
      name: "Tocopherol, delta",
      amount: "0.13392",
      unit_name: "MG",
    },
    {
      id: 378,
      recipe_id: 8,
      nutrient_id: 1128,
      name: "Tocotrienol, alpha",
      amount: "0.07548",
      unit_name: "MG",
    },
    {
      id: 379,
      recipe_id: 8,
      nutrient_id: 1129,
      name: "Tocotrienol, beta",
      amount: "0.00000",
      unit_name: "MG",
    },
    {
      id: 380,
      recipe_id: 8,
      nutrient_id: 1130,
      name: "Tocotrienol, gamma",
      amount: "0.00880",
      unit_name: "MG",
    },
    {
      id: 381,
      recipe_id: 8,
      nutrient_id: 1131,
      name: "Tocotrienol, delta",
      amount: "0.00000",
      unit_name: "MG",
    },
    {
      id: 382,
      recipe_id: 8,
      nutrient_id: 1162,
      name: "Vitamin C, total ascorbic acid",
      amount: "1.21260",
      unit_name: "MG",
    },
    {
      id: 383,
      recipe_id: 8,
      nutrient_id: 1165,
      name: "Thiamin",
      amount: "6.88933",
      unit_name: "MG",
    },
    {
      id: 384,
      recipe_id: 8,
      nutrient_id: 1166,
      name: "Riboflavin",
      amount: "4.07798",
      unit_name: "MG",
    },
    {
      id: 385,
      recipe_id: 8,
      nutrient_id: 1167,
      name: "Niacin",
      amount: "44.11629",
      unit_name: "MG",
    },
    {
      id: 386,
      recipe_id: 8,
      nutrient_id: 1170,
      name: "Pantothenic acid",
      amount: "3.26872",
      unit_name: "MG",
    },
    {
      id: 387,
      recipe_id: 8,
      nutrient_id: 1175,
      name: "Vitamin B-6",
      amount: "1.02784",
      unit_name: "MG",
    },
    {
      id: 388,
      recipe_id: 8,
      nutrient_id: 1177,
      name: "Folate, total",
      amount: "1151.84750",
      unit_name: "UG",
    },
    {
      id: 389,
      recipe_id: 8,
      nutrient_id: 1178,
      name: "Vitamin B-12",
      amount: "2.49462",
      unit_name: "UG",
    },
    {
      id: 390,
      recipe_id: 8,
      nutrient_id: 1180,
      name: "Choline, total",
      amount: "373.35029",
      unit_name: "MG",
    },
    {
      id: 391,
      recipe_id: 8,
      nutrient_id: 1183,
      name: "Vitamin K (Menaquinone-4)",
      amount: "7.37290",
      unit_name: "UG",
    },
    {
      id: 392,
      recipe_id: 8,
      nutrient_id: 1184,
      name: "Vitamin K (Dihydrophylloquinone)",
      amount: "0.08800",
      unit_name: "UG",
    },
    {
      id: 393,
      recipe_id: 8,
      nutrient_id: 1185,
      name: "Vitamin K (phylloquinone)",
      amount: "31.86460",
      unit_name: "UG",
    },
    {
      id: 394,
      recipe_id: 8,
      nutrient_id: 1186,
      name: "Folic acid",
      amount: "0.00000",
      unit_name: "UG",
    },
    {
      id: 395,
      recipe_id: 8,
      nutrient_id: 1187,
      name: "Folate, food",
      amount: "281.84750",
      unit_name: "UG",
    },
    {
      id: 396,
      recipe_id: 8,
      nutrient_id: 1190,
      name: "Folate, DFE",
      amount: "281.84750",
      unit_name: "UG",
    },
    {
      id: 397,
      recipe_id: 8,
      nutrient_id: 1198,
      name: "Betaine",
      amount: "4.29955",
      unit_name: "MG",
    },
    {
      id: 398,
      recipe_id: 8,
      nutrient_id: 1210,
      name: "Tryptophan",
      amount: "0.33302",
      unit_name: "G",
    },
    {
      id: 399,
      recipe_id: 8,
      nutrient_id: 1211,
      name: "Threonine",
      amount: "1.09861",
      unit_name: "G",
    },
    {
      id: 400,
      recipe_id: 8,
      nutrient_id: 1212,
      name: "Isoleucine",
      amount: "1.36217",
      unit_name: "G",
    },
    {
      id: 401,
      recipe_id: 8,
      nutrient_id: 1213,
      name: "Leucine",
      amount: "2.37221",
      unit_name: "G",
    },
    {
      id: 402,
      recipe_id: 8,
      nutrient_id: 1214,
      name: "Lysine",
      amount: "2.03414",
      unit_name: "G",
    },
    {
      id: 403,
      recipe_id: 8,
      nutrient_id: 1215,
      name: "Methionine",
      amount: "0.72914",
      unit_name: "G",
    },
    {
      id: 404,
      recipe_id: 8,
      nutrient_id: 1216,
      name: "Cystine",
      amount: "0.35033",
      unit_name: "G",
    },
    {
      id: 405,
      recipe_id: 8,
      nutrient_id: 1217,
      name: "Phenylalanine",
      amount: "1.32301",
      unit_name: "G",
    },
    {
      id: 406,
      recipe_id: 8,
      nutrient_id: 1218,
      name: "Tyrosine",
      amount: "1.15765",
      unit_name: "G",
    },
    {
      id: 407,
      recipe_id: 8,
      nutrient_id: 1219,
      name: "Valine",
      amount: "1.71327",
      unit_name: "G",
    },
    {
      id: 408,
      recipe_id: 8,
      nutrient_id: 1220,
      name: "Arginine",
      amount: "1.21420",
      unit_name: "G",
    },
    {
      id: 409,
      recipe_id: 8,
      nutrient_id: 1221,
      name: "Histidine",
      amount: "0.70471",
      unit_name: "G",
    },
    {
      id: 410,
      recipe_id: 8,
      nutrient_id: 1222,
      name: "Alanine",
      amount: "1.14629",
      unit_name: "G",
    },
    {
      id: 411,
      recipe_id: 8,
      nutrient_id: 1223,
      name: "Aspartic acid",
      amount: "2.43801",
      unit_name: "G",
    },
    {
      id: 412,
      recipe_id: 8,
      nutrient_id: 1224,
      name: "Glutamic acid",
      amount: "4.55964",
      unit_name: "G",
    },
    {
      id: 413,
      recipe_id: 8,
      nutrient_id: 1225,
      name: "Glycine",
      amount: "0.72387",
      unit_name: "G",
    },
    {
      id: 414,
      recipe_id: 8,
      nutrient_id: 1226,
      name: "Proline",
      amount: "1.94986",
      unit_name: "G",
    },
    {
      id: 415,
      recipe_id: 8,
      nutrient_id: 1227,
      name: "Serine",
      amount: "1.72150",
      unit_name: "G",
    },
    {
      id: 416,
      recipe_id: 8,
      nutrient_id: 1242,
      name: "Vitamin E, added",
      amount: "0.00000",
      unit_name: "MG",
    },
    {
      id: 417,
      recipe_id: 8,
      nutrient_id: 1246,
      name: "Vitamin B-12, added",
      amount: "0.00000",
      unit_name: "UG",
    },
    {
      id: 418,
      recipe_id: 8,
      nutrient_id: 1253,
      name: "Cholesterol",
      amount: "1019.08950",
      unit_name: "MG",
    },
    {
      id: 419,
      recipe_id: 8,
      nutrient_id: 1258,
      name: "Fatty acids, total saturated",
      amount: "164.99462",
      unit_name: "G",
    },
    {
      id: 420,
      recipe_id: 8,
      nutrient_id: 1259,
      name: "SFA 4:0",
      amount: "9.74740",
      unit_name: "G",
    },
    {
      id: 421,
      recipe_id: 8,
      nutrient_id: 1260,
      name: "SFA 6:0",
      amount: "6.21353",
      unit_name: "G",
    },
    {
      id: 422,
      recipe_id: 8,
      nutrient_id: 1261,
      name: "SFA 8:0",
      amount: "3.77067",
      unit_name: "G",
    },
    {
      id: 423,
      recipe_id: 8,
      nutrient_id: 1262,
      name: "SFA 10:0",
      amount: "7.85741",
      unit_name: "G",
    },
    {
      id: 424,
      recipe_id: 8,
      nutrient_id: 1263,
      name: "SFA 12:0",
      amount: "8.10460",
      unit_name: "G",
    },
    {
      id: 425,
      recipe_id: 8,
      nutrient_id: 1264,
      name: "SFA 14:0",
      amount: "23.71873",
      unit_name: "G",
    },
    {
      id: 426,
      recipe_id: 8,
      nutrient_id: 1265,
      name: "SFA 16:0",
      amount: "71.22490",
      unit_name: "G",
    },
    {
      id: 427,
      recipe_id: 8,
      nutrient_id: 1266,
      name: "SFA 18:0",
      amount: "31.95637",
      unit_name: "G",
    },
    {
      id: 428,
      recipe_id: 8,
      nutrient_id: 1267,
      name: "SFA 20:0",
      amount: "0.41973",
      unit_name: "G",
    },
    {
      id: 429,
      recipe_id: 8,
      nutrient_id: 1268,
      name: "MUFA 18:1",
      amount: "66.49622",
      unit_name: "G",
    },
    {
      id: 430,
      recipe_id: 8,
      nutrient_id: 1269,
      name: "PUFA 18:2",
      amount: "10.15574",
      unit_name: "G",
    },
    {
      id: 431,
      recipe_id: 8,
      nutrient_id: 1270,
      name: "PUFA 18:3",
      amount: "1.19795",
      unit_name: "G",
    },
    {
      id: 432,
      recipe_id: 8,
      nutrient_id: 1271,
      name: "PUFA 20:4",
      amount: "0.19549",
      unit_name: "G",
    },
    {
      id: 433,
      recipe_id: 8,
      nutrient_id: 1272,
      name: "PUFA 22:6 n-3 (DHA)",
      amount: "0.05104",
      unit_name: "G",
    },
    {
      id: 434,
      recipe_id: 8,
      nutrient_id: 1273,
      name: "SFA 22:0",
      amount: "0.01146",
      unit_name: "G",
    },
    {
      id: 435,
      recipe_id: 8,
      nutrient_id: 1274,
      name: "MUFA 14:1",
      amount: "0.20234",
      unit_name: "G",
    },
    {
      id: 436,
      recipe_id: 8,
      nutrient_id: 1275,
      name: "MUFA 16:1",
      amount: "3.48084",
      unit_name: "G",
    },
    {
      id: 437,
      recipe_id: 8,
      nutrient_id: 1276,
      name: "PUFA 18:4",
      amount: "0.00057",
      unit_name: "G",
    },
    {
      id: 438,
      recipe_id: 8,
      nutrient_id: 1277,
      name: "MUFA 20:1",
      amount: "0.34436",
      unit_name: "G",
    },
    {
      id: 439,
      recipe_id: 8,
      nutrient_id: 1278,
      name: "PUFA 20:5 n-3 (EPA)",
      amount: "0.00567",
      unit_name: "G",
    },
    {
      id: 440,
      recipe_id: 8,
      nutrient_id: 1279,
      name: "MUFA 22:1",
      amount: "0.00113",
      unit_name: "G",
    },
    {
      id: 441,
      recipe_id: 8,
      nutrient_id: 1280,
      name: "PUFA 22:5 n-3 (DPA)",
      amount: "0.01750",
      unit_name: "G",
    },
    {
      id: 442,
      recipe_id: 8,
      nutrient_id: 1292,
      name: "Fatty acids, total monounsaturated",
      amount: "70.57099",
      unit_name: "G",
    },
    {
      id: 443,
      recipe_id: 8,
      nutrient_id: 1293,
      name: "Fatty acids, total polyunsaturated",
      amount: "11.70816",
      unit_name: "G",
    },
    {
      id: 444,
      recipe_id: 8,
      nutrient_id: 1299,
      name: "SFA 15:0",
      amount: "0.20209",
      unit_name: "G",
    },
    {
      id: 445,
      recipe_id: 8,
      nutrient_id: 1300,
      name: "SFA 17:0",
      amount: "1.76816",
      unit_name: "G",
    },
    {
      id: 446,
      recipe_id: 8,
      nutrient_id: 1301,
      name: "SFA 24:0",
      amount: "0.00454",
      unit_name: "G",
    },
    {
      id: 447,
      recipe_id: 8,
      nutrient_id: 1332,
      name: "SFA 13:0",
      amount: "0.00000",
      unit_name: "G",
    },
    {
      id: 448,
      recipe_id: 8,
      nutrient_id: 2000,
      name: "Sugars, total including NLEA",
      amount: "447.03976",
      unit_name: "G",
    },
    {
      id: 449,
      recipe_id: 8,
      nutrient_id: 1099,
      name: "Fluoride, F",
      amount: "51.69300",
      unit_name: "UG",
    },
    {
      id: 450,
      recipe_id: 8,
      nutrient_id: 1257,
      name: "Fatty acids, total trans",
      amount: "9.99986",
      unit_name: "G",
    },
    {
      id: 451,
      recipe_id: 8,
      nutrient_id: 1111,
      name: "Vitamin D2 (ergocalciferol)",
      amount: "0.00000",
      unit_name: "UG",
    },
    {
      id: 452,
      recipe_id: 8,
      nutrient_id: 1285,
      name: "Stigmasterol",
      amount: "0.00000",
      unit_name: "MG",
    },
    {
      id: 453,
      recipe_id: 8,
      nutrient_id: 1286,
      name: "Campesterol",
      amount: "0.00000",
      unit_name: "MG",
    },
    {
      id: 454,
      recipe_id: 8,
      nutrient_id: 1288,
      name: "Beta-sitosterol",
      amount: "11.35000",
      unit_name: "MG",
    },
    {
      id: 455,
      recipe_id: 8,
      nutrient_id: 1304,
      name: "TFA 18:1 t",
      amount: "8.95568",
      unit_name: "G",
    },
    {
      id: 456,
      recipe_id: 8,
      nutrient_id: 1307,
      name: "PUFA 18:2 i",
      amount: "0.83990",
      unit_name: "G",
    },
    {
      id: 457,
      recipe_id: 8,
      nutrient_id: 1311,
      name: "PUFA 18:2 CLAs",
      amount: "0.87023",
      unit_name: "G",
    },
    {
      id: 458,
      recipe_id: 8,
      nutrient_id: 1314,
      name: "MUFA 16:1 c",
      amount: "3.20839",
      unit_name: "G",
    },
    {
      id: 459,
      recipe_id: 8,
      nutrient_id: 1315,
      name: "MUFA 18:1 c",
      amount: "55.16825",
      unit_name: "G",
    },
    {
      id: 460,
      recipe_id: 8,
      nutrient_id: 1316,
      name: "PUFA 18:2 n-6 c,c",
      amount: "7.95087",
      unit_name: "G",
    },
    {
      id: 461,
      recipe_id: 8,
      nutrient_id: 1329,
      name: "Fatty acids, total trans-monoenoic",
      amount: "9.01955",
      unit_name: "G",
    },
    {
      id: 462,
      recipe_id: 8,
      nutrient_id: 1331,
      name: "Fatty acids, total trans-polyenoic",
      amount: "0.98030",
      unit_name: "G",
    },
    {
      id: 463,
      recipe_id: 8,
      nutrient_id: 1404,
      name: "PUFA 18:3 n-3 c,c,c (ALA)",
      amount: "0.99980",
      unit_name: "G",
    },
    {
      id: 464,
      recipe_id: 8,
      nutrient_id: 1303,
      name: "TFA 16:1 t",
      amount: "0.06388",
      unit_name: "G",
    },
    {
      id: 465,
      recipe_id: 8,
      nutrient_id: 1305,
      name: "TFA 22:1 t",
      amount: "0.00000",
      unit_name: "G",
    },
    {
      id: 466,
      recipe_id: 8,
      nutrient_id: 1306,
      name: "TFA 18:2 t not further defined",
      amount: "0.13814",
      unit_name: "G",
    },
    {
      id: 467,
      recipe_id: 8,
      nutrient_id: 1312,
      name: "MUFA 24:1 c",
      amount: "0.00000",
      unit_name: "G",
    },
    {
      id: 468,
      recipe_id: 8,
      nutrient_id: 1313,
      name: "PUFA 20:2 n-6 c,c",
      amount: "0.01981",
      unit_name: "G",
    },
    {
      id: 469,
      recipe_id: 8,
      nutrient_id: 1317,
      name: "MUFA 22:1 c",
      amount: "0.00113",
      unit_name: "G",
    },
    {
      id: 470,
      recipe_id: 8,
      nutrient_id: 1321,
      name: "PUFA 18:3 n-6 c,c,c",
      amount: "0.01169",
      unit_name: "G",
    },
    {
      id: 471,
      recipe_id: 8,
      nutrient_id: 1323,
      name: "MUFA 17:1",
      amount: "0.04912",
      unit_name: "G",
    },
    {
      id: 472,
      recipe_id: 8,
      nutrient_id: 1325,
      name: "PUFA 20:3",
      amount: "0.04235",
      unit_name: "G",
    },
    {
      id: 473,
      recipe_id: 8,
      nutrient_id: 1333,
      name: "MUFA 15:1",
      amount: "0.00000",
      unit_name: "G",
    },
    {
      id: 474,
      recipe_id: 8,
      nutrient_id: 1405,
      name: "PUFA 20:3 n-3",
      amount: "0.00201",
      unit_name: "G",
    },
    {
      id: 475,
      recipe_id: 8,
      nutrient_id: 1406,
      name: "PUFA 20:4 n-6",
      amount: "0.03977",
      unit_name: "G",
    },
    {
      id: 476,
      recipe_id: 8,
      nutrient_id: 1411,
      name: "PUFA 22:4",
      amount: "0.01598",
      unit_name: "G",
    },
    {
      id: 477,
      recipe_id: 8,
      nutrient_id: 1283,
      name: "Phytosterols",
      amount: "8.11200",
      unit_name: "MG",
    },
    {
      id: 478,
      recipe_id: 8,
      nutrient_id: 2047,
      name: "Energy (Atwater General Factors)",
      amount: "2178.00000",
      unit_name: "KCAL",
    },
    {
      id: 479,
      recipe_id: 8,
      nutrient_id: 2048,
      name: "Energy (Atwater Specific Factors)",
      amount: "2232.00000",
      unit_name: "KCAL",
    },
    {
      id: 480,
      recipe_id: 8,
      nutrient_id: 1002,
      name: "Nitrogen",
      amount: "13.74000",
      unit_name: "G",
    },
    {
      id: 481,
      recipe_id: 8,
      nutrient_id: 1102,
      name: "Molybdenum, Mo",
      amount: "219.60000",
      unit_name: "UG",
    },
    {
      id: 482,
      recipe_id: 8,
      nutrient_id: 1228,
      name: "Hydroxyproline",
      amount: "0.00000",
      unit_name: "G",
    },
    {
      id: 483,
      recipe_id: 8,
      nutrient_id: 1009,
      name: "Starch",
      amount: "1.71045",
      unit_name: "G",
    },
    {
      id: 484,
      recipe_id: 8,
      nutrient_id: 1409,
      name: "PUFA 18:3i",
      amount: "0.00227",
      unit_name: "G",
    },
  ],
};

export default router;
