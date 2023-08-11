import { Typography } from "@mui/material";

const groceries = [
  {
    name: "Chicken",
    amount: 1,
    unit: "gallon",
    price: 3.99,
    image:
      "https://sb-assets.sgp1.cdn.digitaloceanspaces.com/product/main_image/39361/e9761b88-6bef-40d0-90e6-c87eaeda8a70.jpg",
  },
  {
    name: "Lemon",
    amount: 12,
    unit: "count",
    price: 2.99,
    image:
      "https://cdn.shopify.com/s/files/1/0206/9470/products/4621-done_1024x1024.jpg?v=1595196844",
  },
  {
    name: "Garlic",
    amount: 1,
    unit: "count",
    price: 0.99,
    image:
      "https://allmart.my/wp-content/uploads/2022/02/Bawang-Putih-garlic-700g-1.jpeg",
  },
];

const Grocery = () => {
  return (
    <div>
      <h1>Grocery</h1>
      <Typography variant="h4">
        Total : RM{" "}
        {groceries.reduce((acc, curr) => acc + curr.price, 0).toFixed(2)}
      </Typography>
      <Typography>
        {groceries.map((grocery) => (
          <div>
            <img
              style={{ width: "100px" }}
              src={grocery.image}
              alt={grocery.name}
            />
            <h3>{grocery.name}</h3>
            <p>{grocery.amount}</p>
            <p>{grocery.unit}</p>
            <p>{grocery.price}</p>
          </div>
        ))}
      </Typography>
    </div>
  );
};

export default Grocery;
