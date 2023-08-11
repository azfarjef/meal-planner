import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <>
      <div onClick={() => navigate("/")}>Recipe</div>
      <div onClick={() => navigate("/ingredients")}>Build Recipe</div>
      <div onClick={() => navigate("/addIngredient")}>Add Ingredient</div>
      <div onClick={() => navigate("/calendar")}>Calendar</div>
      <div onClick={() => navigate("/day")}>Day</div>
      <div onClick={() => navigate("/grocery")}>Grocery</div>
    </>
  );
};

export default Navbar;
