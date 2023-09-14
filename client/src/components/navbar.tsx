import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  ListItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation, useNavigate } from "react-router-dom";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import KitchenIcon from "@mui/icons-material/Kitchen";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

// Format today to YYYY-MM-DD
const today = new Date().toISOString().split("T")[0];
console.log(today);

const items = [
  {
    href: "/",
    icon: <MenuBookIcon />,
    title: "Recipes",
  },
  {
    href: "/ingredients",
    icon: <KitchenIcon />,
    title: "Build Recipe",
  },
  {
    href: "/addIngredient",
    icon: <AddCircleIcon />,
    title: "Add Ingredient",
  },
  {
    href: `/day/${today}`,
    icon: <CalendarTodayIcon />,
    title: "Planner",
  },
  {
    href: "/grocery",
    icon: <ShoppingCartIcon />,
    title: "Grocery",
  },
];

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const active = useLocation().pathname;
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <AppBar sx={{ mb: "10px", backgroundColor: "#111827" }}>
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={toggleSidebar}
            sx={{
              mr: 2,
              display: { xs: "block", md: "none" },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: "none", md: "block" } }}
          >
            MealPlanner
          </Typography>

          <Box sx={{ display: { xs: "none", md: "block" } }}>
            {items.map((item) => (
              <Button
                key={item.title}
                sx={{
                  color: "#fff",
                  backgroundColor:
                    active === item.href ? "rgba(255,255,255, 0.2)" : "",
                }}
                onClick={() => navigate(item.href)}
              >
                {item.title}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer variant="temporary" open={isSidebarOpen} onClose={toggleSidebar}>
        <>
          <Box>
            <div>
              <Box onClick={() => navigate("/")} sx={{ p: 3 }}>
                <Typography variant="h6">Meal Planner</Typography>
              </Box>
            </div>
            <Divider
              sx={{
                my: 3,
              }}
            />
            <Box sx={{ flexGrow: 1 }}>
              {items.map((item) => (
                <ListItem
                  key={item.title}
                  onClick={() => {
                    navigate(item.href);
                    toggleSidebar();
                  }}
                >
                  <Button startIcon={item.icon}>
                    <Box>{item.title}</Box>
                  </Button>
                </ListItem>
              ))}
            </Box>
          </Box>
        </>
      </Drawer>
    </>
  );
};

export default Navbar;
