import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState({});
  
  // const [pagination, setPagination] = useState({
  //       page: 1,
  //       limit: 10,
  //       total: 0,
        
  //   })

  // Fetch seller status

  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");
      if (data.success) {
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
    } catch (error) {
     if (error.response?.status !== 401) {
      console.error("Error fetching seller:", error);
    }
      setIsSeller(false); 
    }
  }


  // Fetch user Auth details,user data and cart items

  const fetchUser = async () => {
    try {
      const {data} = await axios.get("/api/user/is-auth");
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems);
      }
    } catch (error) {
      if (error.response?.status !== 401) {
              console.error("Error fetching User:", error);
    }
      setUser(null);
    }
  }


  // Fetch all products
  const fetchProducts = async () => {
    // setProducts(dummyProducts);
    try {
       const { data } = await axios.get("/api/product/list");
       if (data.success) {
         setProducts(data.products);
       } else {
         toast.error(data.message);
       }
    } catch (error) {
      toast.error("Something went wrong", error.message);
      
    }
  };

  //Add product to cart
  const addToCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success("Added to cart");
  };

  //update Cart Item Quantity
  const updateCartItem = (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData);
    toast.success("Updated cart");
  };

  //Remove Cart Item

  const removeFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }
    }
    toast.success("Removed from cart");
    setCartItems(cartData);
  }

  // Get total cart count

  const getCartCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      totalCount += cartItems[item];
    }
    return totalCount;
  }

  // Get total cart Amount

  const getCartAmount = () => {
        let totalAmount = 0

        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items)
            if (itemInfo && cartItems[items] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[items]
            }
        }
        return Math.floor(totalAmount * 100) / 100
    }

  useEffect(() => {
    fetchUser();
    fetchSeller();
    fetchProducts();
  }, []);

  // useEffect(() => {
  //   if(isSeller) {
  //      fetchSeller()
  //   }    
  //   }, [isSeller])

  // useEffect(() => {
  //   if (user) {
  //       fetchUser()
  //   }
  //   }, [])

  //   useEffect(() => {
  //       if (isSeller) {
  //           setProducts([]);
  //           setPagination(prev => ({ ...prev, page: 1 }));
  //       }
  //   }, [isSeller]);

  //   useEffect(() => {
  //       fetchProducts();
  //   }, [pagination.page, isSeller]);


  // Update cart items in local storage or server

  useEffect(() => {
    const updateCart = async () => {
      try {
        const { data } = await axios.post("/api/cart/update", {
           userId: user._id, cartItems
        });
        if (!data.success) {
          toast.error(data.message);
        } 
      } catch (error) {
        toast.error("Something went wrong while updating cart", error.message);
      }
    };

    if(user){
    updateCart();
    }
  },[cartItems,user]);


  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin,
    products,
    currency,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartItems,
    setCartItems, 
    searchQuery,
    setSearchQuery,
    getCartAmount,
    getCartCount,
    axios,
    fetchProducts,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
