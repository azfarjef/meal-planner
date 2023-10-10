# Meal Planner

Welcome to the Meal Planner App repository! If you're like me, you've probably tried various meal planner apps, each with its own set of features and limitations.

Some apps excel at **calculating macros and micros** but lack meal planning capabilities, while others help you **plan your meals** but fall short when it comes to **tracking daily nutrient intake**. There are even apps that **generate grocery lists** but overlook the importance of **analyzing the cost of each recipe**.

That's why I decided to create this meal planner app, tailor-made for users who, like me, crave a comprehensive solution. This full-stack web application, developed using _React, Redux Toolkit, Material UI, TypeScript, Node.js, and PostgreSQL_, is designed to empower you to efficiently plan your meals, analyze recipe's cost, calculate nutrition information, and effortlessly generate grocery lists.

## Features

**1. Recipe Management and Nutrition Calculation**

- Users can input ingredients and their amounts to create and save recipes.
- Nutritional information for ingredients is sourced from [USDA FoodData Central](https://fdc.nal.usda.gov/).
- The app calculates full nutrition information, not only for macronutrients but also micronutrients for each recipe based on the ingredients.

**2. Recipe Browser**

- Users can browse a collection of saved recipes.
- Each recipe includes detailed instructions, cost per serving, nutrition per serving, preparation time, and an image for a comprehensive cooking experience.

**3. Meal Planner**

- Users can plan their meals ahead by adding recipes to the planner.
- The planner calculates the total nutrition for each day and displays the percentage of recommended intake for each macro and micronutrient.

**4. Grocery List Generation**

- Users can generate grocery lists based on a specified range of dates.
- The grocery lists display the cost and quantity of each item needed, as well as the total cost.
- This helps users estimate their weekly or monthly budget based on their meal plan and prevents food wastage.

**5. Cost Calculation**

- This app calculates the price of each recipe and generates a grocery list with item costs.

## Planned Future Development

**1. User Authentication and Authorization:** Enhance security and provide personalized experiences with user authentication and authorization features.

**2. Personalized Nutrition Calculator:** Tailor your nutrient intake recommendations based on your unique profile and health objectives.

**3. Informative Dashboard:** Gain deeper insights into your weekly meal plan with a user-friendly dashboard offering analytics and valuable recommendations for healthier eating habits.

## Screenshots

Here are some snapshots of the app to provide a better understanding:

- Recipe Creation and Nutrition Calculation:
  Recipe Creation

- Meal Planner:
  Meal Planner

- Grocery List Generation:
  Grocery List

Feel free to explore the code and the app to gain a deeper insight into its functionality.

## Getting Started

To run this project locally, follow these steps:

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Install the necessary dependencies for the frontend and backend.
4. Configure the PostgreSQL database with your own data or mock data.
5. Start the frontend and backend servers.
6. Access the app in your web browser.

## Database

The app relies on a PostgreSQL database for data storage. However, the database files are not provided with this repository. To test the app, you should use your own mock data or populate the database with your own information.
