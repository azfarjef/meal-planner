import { useGetGroceryListQuery } from "@/state/api";
import {
  Avatar,
  Box,
  Checkbox,
  Container,
  FormControlLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import daysjs, { Dayjs } from "dayjs";

interface GroceryItem {
  fdc_id: number;
  name: string;
  amount: number;
  // unit: string;
  price: number;
  image: string;
  bought: boolean;
}

// const groceries = [
//   {
//     name: "Chicken",
//     amount: 1,
//     unit: "gallon",
//     price: 3.99,
//     image:
//       "https://sb-assets.sgp1.cdn.digitaloceanspaces.com/product/main_image/39361/e9761b88-6bef-40d0-90e6-c87eaeda8a70.jpg",
//     bought: false,
//   },
//   {
//     name: "Lemon",
//     amount: 12,
//     unit: "count",
//     price: 2.99,
//     image:
//       "https://cdn.shopify.com/s/files/1/0206/9470/products/4621-done_1024x1024.jpg?v=1595196844",
//     bought: false,
//   },
//   {
//     name: "Garlic",
//     amount: 1,
//     unit: "count",
//     price: 0.99,
//     image:
//       "https://allmart.my/wp-content/uploads/2022/02/Bawang-Putih-garlic-700g-1.jpeg",
//     bought: false,
//   },
// ];

const Grocery = () => {
  const [dateFrom, setDateFrom] = useState<Dayjs>(daysjs());
  const [dateTo, setDateTo] = useState<Dayjs>(daysjs().add(7, "day"));

  const { data, isLoading } = useGetGroceryListQuery({
    dateFrom: dateFrom.format("YYYY-MM-DD"),
    dateTo: dateTo.format("YYYY-MM-DD"),
  });

  const [items, setItems] = useState<GroceryItem[]>(data?.groceries || []);

  useEffect(() => {
    if (data?.groceries) {
      setItems(data.groceries);
    }
  }, [data]);

  if (isLoading || !data) {
    return <div>Loading...</div>; // Add a loading state or spinner while data is being fetched
  }

  const toggleItemBought = (index: number) => {
    const updatedItems = items.map((item, i) =>
      i === index ? { ...item, bought: !item.bought } : item
    );
    setItems(updatedItems);
  };

  return (
    <div>
      <Container>
        <Typography variant="h4" gutterBottom>
          Grocery Checklist
        </Typography>

        <Typography variant="h6" gutterBottom>
          Select a date range to generate a grocery list
        </Typography>
        <Box my={4}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start"
              maxDate={dateTo}
              sx={{ minWidth: "230px", mb: 2 }}
              format="dddd, DD/MM/YYYY"
              value={dateFrom}
              onChange={(newDateFrom) =>
                newDateFrom ? setDateFrom(newDateFrom) : null
              }
            />
          </LocalizationProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="End"
              minDate={dateFrom}
              sx={{ minWidth: "230px", mb: 2 }}
              format="dddd, DD/MM/YYYY"
              value={dateTo}
              onChange={(newDateTo) =>
                newDateTo ? setDateTo(newDateTo) : null
              }
            />
          </LocalizationProvider>
        </Box>

        <Typography variant="h5">
          Total Price: RM {data.total_price.toFixed(2)}
        </Typography>

        <List>
          {items.map((item, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                <Avatar alt={item.name} src={item.image} />
              </ListItemAvatar>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={item.bought || false}
                    onChange={() => toggleItemBought(index)}
                  />
                }
                label={
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        style={
                          item.bought ? { textDecoration: "line-through" } : {}
                        }
                      >
                        {item.name}
                      </Typography>
                    }
                    secondary={`Amount: ${
                      item.amount
                    } g | Price: RM${item.price.toFixed(2)}`}
                  />
                }
              />
            </ListItem>
          ))}
        </List>
      </Container>
    </div>
  );
};

export default Grocery;

// const Grocery = () => {
//   const { data, isLoading } = useGetGroceryListQuery({
//     dateFrom: "2023-08-19",
//     dateTo: "2023-08-29",
//   });

//   // const [item, setItem] = useState("");
//   const [items, setItems] = useState<GroceryItem[]>(data?.groceries || []);

//   useEffect(() => {
//     if (data?.groceries) {
//       setItems(data.groceries);
//     }
//   }, [data]);

//   // useEffect(() => {
//   //   const storedItems = localStorage.getItem("groceryItems");
//   //   if (storedItems) {
//   //     setItems(JSON.parse(storedItems));
//   //   }
//   // }, []);

//   // // Load item.bought state from localStorage on component mount
//   // useEffect(() => {
//   //   const storedItems = JSON.parse(
//   //     localStorage.getItem("groceryItems") || "[]"
//   //   );
//   //   setItems(storedItems);
//   // }, []);

//   // // Save item.bought state to localStorage whenever items change
//   // useEffect(() => {
//   //   localStorage.setItem("groceryItems", JSON.stringify(items));
//   // }, [items]);

//   if (isLoading || !data) {
//     return <div>Loading...</div>; // Add a loading state or spinner while data is being fetched
//   }

//   // const { groceries, total_price } = data;

//   // const addItem = () => {
//   //   if (item.trim() !== "") {
//   //     setItems([
//   //       ...items,
//   //       {
//   //         fdc_id: 0,
//   //         name: item,
//   //         amount: 1,
//   //         // unit: "count",
//   //         price: 0,
//   //         image: "",
//   //         bought: false,
//   //       },
//   //     ]);
//   //     setItem("");
//   //   }
//   // };

//   const toggleItemBought = (index: number) => {
//     const updatedItems = items.map((item, i) =>
//       i === index ? { ...item, bought: !item.bought } : item
//     );
//     setItems(updatedItems);

//     // // Store the updated items in localStorage
//     // localStorage.setItem("groceryItems", JSON.stringify(updatedItems));
//   };

//   return (
//     <div>
//       <Container>
//         <h2>Grocery Checklist</h2>

//         <Box>
//           <LocalizationProvider dateAdapter={AdapterDayjs}>
//             <DatePicker
//               sx={{ minWidth: "230px", mb: 2 }}
//               format="dddd, DD/MM/YYYY"
//               value={date}
//               onChange={handleSelectDate}
//             />
//           </LocalizationProvider>
//         </Box>

//         <h2>Total Price: RM {data.total_price}</h2>

//         {/* <Grid container spacing={2} alignItems="center">
//           <Grid item xs={12} sm={6} md={4}>
//             <TextField
//               fullWidth
//               label="Item"
//               variant="outlined"
//               value={item}
//               onChange={(e) => setItem(e.target.value)}
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={4}>
//             <Button
//               fullWidth
//               variant="contained"
//               color="primary"
//               onClick={addItem}
//             >
//               Add Item
//             </Button>
//           </Grid>
//         </Grid> */}
//         <List>
//           {items.map((item, index) => (
//             <ListItem key={index}>
//               <ListItemAvatar>
//                 <Avatar alt={item.name} src={item.image} />
//               </ListItemAvatar>
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={item.bought || false}
//                     onChange={() => toggleItemBought(index)}
//                   />
//                 }
//                 label={
//                   <ListItemText
//                     primary={
//                       <Typography
//                         variant="body1"
//                         style={
//                           item.bought ? { textDecoration: "line-through" } : {}
//                         }
//                       >
//                         {item.name}
//                       </Typography>
//                     }
//                     secondary={`Amount: ${
//                       item.amount
//                     } g | Price: RM${item.price.toFixed(2)}`}
//                   />
//                 }
//               />
//             </ListItem>
//           ))}
//         </List>
//       </Container>
//     </div>
//   );
// };

// How to save the state of item.bought in localStorage?
