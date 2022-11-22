import { Search, SentimentDissatisfied } from "@mui/icons-material";
import { CardMedia } from "@mui/material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Card,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import Cart from "./Cart";
import "./Products.css";
import { generateCartItemsFrom, getTotalCartValue } from "./Cart";
// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */


const Products = () => {
  let logedin=localStorage.getItem('username')!=undefined;
  let token=localStorage.getItem('token');

  const { enqueueSnackbar }=useSnackbar();

  const [cart,setCart]=useState([]);
  const [products,setProducts]=useState([]);
  const[loading,setLoading]=useState(true);
  const[loadcart,setLoad]=useState(false);
  
  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  useEffect( ()=>{
     performAPICall();
     
  },[]);

  useEffect(()=>{
    fetchCart(token)
  },[loadcart])
  
  const performAPICall = async () => {
      
      let data=await axios.get(config.endpoint+'/products')
      .then(response=>{ 
        return response.data;
      })
      .catch(err=>{
        enqueueSnackbar(err.response.data.message,{variant:"error"});
        setLoading(false);    
      })

      setProducts(data);
      setLoading(false);
      setLoad(true);
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
      
      
       await axios.get(config.endpoint+"/products/search?value="+text)
      .then(response=>{
        setProducts(response.data);
      })
      .catch(error=>{
        setProducts([]);
      })
      ;
      
  };
var timeoutID;
  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch =  (event, debounceTimeout) => {
    
    if(timeoutID) {clearTimeout(timeoutID);timeoutID=undefined;}
    
    timeoutID= setTimeout(()=>{performSearch(event.target.value)},debounceTimeout);
  };



  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
   const fetchCart = async (token) => {
    
    if (!token) return;
    
    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      let cartItems=await axios.get(config.endpoint+"/cart",
      {
        headers: {
          Authorization: 'Bearer ' + token //the token is a variable which holds the token
        }
       }
      );

      setCart(generateCartItemsFrom(cartItems.data,products));
       
      
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };


  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
      
    let n=items.length;
    for(let i=0;i<n;i++){
      if(items[i].productId===productId) return true;
    }
    return false;
  };


  
  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
      if(!token){
        enqueueSnackbar("Login to add an item to the Cart",{persist:false,variant:"warning"});
        return;
      }
      if(options.preventDuplicate && isItemInCart(items,productId)){
        enqueueSnackbar("Item already in cart. Use the cart sidebar to update quantity or remove item.",{persist:false,variant:"warning"});
        return;
      }
      
      let response=await axios.post(config.endpoint+"/cart",
      {
            productId:productId,
            qty:qty
        },
      {
        headers:{
          Authorization: 'Bearer ' + token
          },
      },
      ).catch(err=>{console.log(err.response.data.message)});
      
    
       setCart(generateCartItemsFrom(response.data,products));
  };

   




  return (
    <div>
      <Header  hasHiddenAuthButtons={logedin}>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        
        <TextField
        className="search-desktop"
        size="small"
        onChange={event=>{debounceSearch(event,500)}}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
      />
      </Header>
      
      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
      />


          <Grid container >
        
         <Grid item className="product-grid" xs={12} md={logedin ? 9 : 12}>
          
           <Box className="hero">
             <p className="hero-heading">
               India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
               to your door step
             </p>
           </Box>
           {loading===true ? (
              <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
                mt={6}
                mb={6}
              >
                <Grid item>
                  <CircularProgress
                    size={40}
                    color="success"
                    className="loading"
                  />
                </Grid>
                <Grid item>
                  <div>Loading Products...</div>
                </Grid>
              </Grid>
            ) : (
              products.length>0 ? (
              <Grid 
              container spacing={3}
              justify-content='space-around'
              mt={1}
              mb={2}
              >
                    {products.map((product) => (
                      <Grid item xs={12} sm={6} md={3} key={product._id}>
                        <ProductCard
                          product={product}
                          handleAddToCart={(productId)=>addToCart(token,cart,products,productId,1,{preventDuplicate:true})}
                        />
                      </Grid>
                    ))}
              </Grid>
              ) : (
                <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
                mt={6}
                mb={6}
              >
                <Grid item>
                  <SentimentDissatisfied/>
                </Grid>
                <Grid item>
                  <div>No products found</div>
                </Grid>
              </Grid>
              )
            )}
          </Grid>
          { logedin &&
          
            <Grid item xs={12} md={3} >
                  <Cart 
                  items={cart} 
                  handleQuantity={(qty,id)=>addToCart(token,cart,products,id,qty)}
                  />
            </Grid>
          }
        </Grid>
        

        
            
      

      <Footer />
    </div>
  );
};

export default Products;
