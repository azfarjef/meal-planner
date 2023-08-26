CREATE TABLE food (
  fdc_id INTEGER PRIMARY KEY,
  data_type VARCHAR(255),
  description VARCHAR(255),
	barcode VARCHAR(255),
	image VARCHAR(500),
);

CREATE TABLE nutrient (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255),
  unit_name VARCHAR(255),
  nutrient_nbr INTEGER,
  rank INTEGER
);

CREATE TABLE food_nutrient (
  id INTEGER PRIMARY KEY,
  fdc_id INTEGER,
  nutrient_id INTEGER,
  amount NUMERIC,
  FOREIGN KEY (fdc_id) REFERENCES food (fdc_id),
  FOREIGN KEY (nutrient_id) REFERENCES nutrient (id)
);

CREATE TABLE food_portion (
  id INTEGER PRIMARY KEY,
  fdc_id INTEGER,
  measure_unit_id INTEGER,
  amount NUMERIC,
  gram_weight NUMERIC,
  FOREIGN KEY (fdc_id) REFERENCES food (fdc_id),
  FOREIGN KEY (measure_unit_id) REFERENCES measure_unit(id)
);

CREATE TABLE measure_unit (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255)
);

CREATE TABLE recipe (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255),
	preparation_time INTEGER,
	servings INTEGER,
	instructions VARCHAR(255)[],
	image VARCHAR(255),
	author_id INTEGER,
	author VARCHAR(255),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP
	FOREIGN KEY (author_id) REFERENCES user (id)
);

CREATE TABLE recipe_ingredient (
	id SERIAL PRIMARY KEY,
	recipe_id INTEGER,
	fdc_id INTEGER,
	name VARCHAR(255),
	amount NUMERIC,
	amount_alt NUMERIC,
	unit_alt VARCHAR(255),
	FOREIGN KEY (recipe_id) REFERENCES recipe (id),
	FOREIGN KEY (fdc_id) REFERENCES food (id)
);

CREATE TABLE recipe_nutrient (
	id SERIAL PRIMARY KEY,
	recipe_id INTEGER,
	nutrient_id INTEGER,
	name VARCHAR(255),
	amount NUMERIC,
	unit_name VARCHAR(255),
	FOREIGN KEY (recipe_id) REFERENCES recipe (id),
	FOREIGN KEY (nutrient_id) REFERENCES nutrient (id)
);

CREATE TABLE user (
	id SERIAL PRIMARY KEY,
	username VARCHAR(255),
	password VARCHAR(255),
	email VARCHAR(255),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP
);

CREATE TABLE meal_plan (
	id SERIAL PRIMARY KEY,
	user_id INTEGER,
	recipe_id INTEGER,
	fdc_id INTEGER,
	date DATE,
	meal_type VARCHAR(255),
	amount NUMERIC,
	FOREIGN KEY (user_id) REFERENCES user (id)
	FOREIGN KEY (recipe_id) REFERENCES recipe (id)
);

CREATE TABLE price (
	id SERIAL PRIMARY KEY,
	fdc_id INTEGER,
	name VARCHAR(255),
	230728 NUMERIC,
	FOREIGN KEY (fdc_id) REFERENCES food (fdc_id)
);
