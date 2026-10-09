import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://127.0.0.1:5000";

function App() {
  // ================= LOGOUT =================

  const handleLogout = () => {
    localStorage.removeItem("token");

    setUser(null);
    setCart([]);
    setOrders([]);
    setOrder(null);
    setAuthMessage("");
  };

  // ================= STATES =================

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [productData, setProductData] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    image: ""
  });

  const [editingProduct, setEditingProduct] = useState(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [updatingProduct, setUpdatingProduct] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);

  // ================= AUTHENTICATION =================

  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);

  const [authData, setAuthData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [authMessage, setAuthMessage] = useState("");

  // ================= GET PRODUCTS =================

  // ================= GET PRODUCTS =================

  const fetchProducts = async () => {
    try {

      setProductError("");

      const response = await axios.get(
        `${API}/api/products`
      );

      setProducts(response.data);

    } catch (error) {

      console.log("Products Error:", error);

      setProductError(
        "Unable to load products. Please try again."
      );

    } finally {

      setLoadingProducts(false);

    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ================= GET ORDERS =================

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    const token = localStorage.getItem("token");
    setOrderError("");

    setLoadingOrders(true);

    axios
      .get(`${API}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((response) => {
        setOrders(response.data);
      })
      .catch((error) => {

        console.log("Orders Error:", error);

        setOrderError(
          "Unable to load previous orders. Please try again."
        );

      })
      .finally(() => {
        setLoadingOrders(false);
      });

  }, [user]);

  // ================= REGISTER / LOGIN =================

  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        // LOGIN

        const response = await axios.post(
          `${API}/api/login`,
          {
            email: authData.email,
            password: authData.password
          }
        );

        // Save JWT token
        localStorage.setItem("token", response.data.token);

        // Save logged-in user
        setUser(response.data.user);
        console.log("USER FROM LOGIN:", response.data.user);

        setAuthMessage("Login successful! 🎉");

      } else {
        // REGISTER

        const response = await axios.post(
          `${API}/api/register`,
          {
            name: authData.name,
            email: authData.email,
            password: authData.password
          }
        );

        setAuthMessage(response.data.message);

        // After registration go to login
        setIsLogin(true);
      }

      // Clear authentication form
      setAuthData({
        name: "",
        email: "",
        password: ""
      });

    } catch (error) {
      setAuthMessage(
        error.response?.data?.message ||
        "Something went wrong"
      );
    }
  };

  // =========================================================
  // ================= PRODUCT MANAGEMENT ===================
  // =========================================================

  // ================= ADD PRODUCT =================

  const addProduct = async () => {

    // Check product name
    if (productData.name.trim() === "") {
      alert("Please enter product name!");
      return;
    }

    // Check category
    if (productData.category.trim() === "") {
      alert("Please enter product category!");
      return;
    }

    // Convert values to numbers
    if (productData.price === "" || productData.stock === "") {
      alert("Please enter price and stock!");
      return;
    }
    const price = Number(productData.price);
    const stock = Number(productData.stock);

    // Check price
    if (price <= 0) {
      alert("Price must be greater than 0!");
      return;
    }

    // Check stock
    if (stock < 0) {
      alert("Stock cannot be negative!");
      return;
    }

    try {

      setAddingProduct(true);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API}/api/products`,
        {
          name: productData.name.trim(),
          price: price,
          category: productData.category.trim(),
          stock: stock,
          image: productData.image.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Add new product to screen
      setProducts((prevProducts) => [
        ...prevProducts,
        response.data
      ]);

      // Clear form
      setProductData({
        name: "",
        price: "",
        category: "",
        stock: "",
        image: ""
      });

      alert("Product added successfully!");

    } catch (error) {

      console.log("Add Product Error:", error);

      alert(
        "Failed to add product: " +
        (error.response?.data?.message || error.message)
      );

    } finally {

      setAddingProduct(false);

    }
  };
  // ================= UPDATE PRODUCT =================

  const updateProduct = async () => {

    // Check product name
    if (productData.name.trim() === "") {
      alert("Please enter product name!");
      return;
    }

    // Check category
    if (productData.category.trim() === "") {
      alert("Please enter product category!");
      return;
    }
    if (productData.price === "" || productData.stock === "") {
      alert("Please enter price and stock!");
      return;
    }
    const price = Number(productData.price);
    const stock = Number(productData.stock);

    // Check price
    if (price <= 0) {
      alert("Price must be greater than 0!");
      return;
    }

    // Check stock
    if (stock < 0) {
      alert("Stock cannot be negative!");
      return;
    }

    try {

      setUpdatingProduct(true);

      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API}/api/products/${editingProduct._id}`,
        {
          name: productData.name.trim(),
          price: price,
          category: productData.category.trim(),
          stock: stock,
          image: productData.image.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update product on screen
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === editingProduct._id
            ? response.data
            : product
        )
      );

      // Clear form
      setProductData({
        name: "",
        price: "",
        category: "",
        stock: "",
        image: ""
      });

      // Exit edit mode
      setEditingProduct(null);

      alert("Product updated successfully!");

    } catch (error) {

      console.log("Update Product Error:", error);

      alert(
        "Failed to update product: " +
        (error.response?.data?.message || error.message)
      );
    } finally {
      setUpdatingProduct(false);
    }
  };

  // ================= DELETE PRODUCT =================

  const deleteProduct = async (productId) => {

    const product = products.find(
      (item) => item._id === productId
    );

    if (!product) {
      alert("Product not found!");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmDelete) {
      return;
    }

    try {

      setDeletingProduct(true);
      setDeletingProductId(productId);
      const token = localStorage.getItem("token");

      await axios.delete(
        `${API}/api/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Remove product from screen
      setProducts((prevProducts) =>
        prevProducts.filter(
          (product) => product._id !== productId
        )
      );

      alert("Product deleted successfully!");

    } catch (error) {

      console.log("Delete Product Error:", error);

      alert(
        "Failed to delete product: " +
        (error.response?.data?.message || error.message)
      );

    } finally {

      setDeletingProduct(false);
      setDeletingProductId(null);

    }
  };

  // =========================================================
  // ====================== PLACE ORDER ======================
  // =========================================================

  const placeOrder = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    if (!user) {
      alert("Please login before placing an order.");
      return;
    }

    const totalAmount = cart.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API}/api/orders`,
        {
          items: cart.map((item) => ({
            productId: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          totalAmount: totalAmount
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setOrder(response.data);

      setOrders((prevOrders) => [
        response.data,
        ...prevOrders
      ]);

      alert("Order placed successfully!");

      setCart([]);
      await fetchProducts();
      

      } catch (error) {

        console.log("Order error:", error);

        alert(
          "Order failed: " +
          (error.response?.data?.message || error.message)
        );

      } finally {

        setPlacingOrder(false);

      }
  };

  // =========================================================
  // ========================= UI ============================
  // =========================================================
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });
  return (
    <div className="shop">

      {/* ================= TITLE ================= */}

      <h1 className="title">
        🛍️ ShopSmart
      </h1>

      {/* ================= AUTH ================= */}

      {!user ? (
        <div className="auth-form">

          <h2>
            {isLogin
              ? "🔐 Login"
              : "📝 Create Account"}
          </h2>

          <form onSubmit={handleAuth}>

            {!isLogin && (
              <input
                type="text"
                placeholder="Name"
                value={authData.name}
                onChange={(e) =>
                  setAuthData({
                    ...authData,
                    name: e.target.value
                  })
                }
                required
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={authData.email}
              onChange={(e) =>
                setAuthData({
                  ...authData,
                  email: e.target.value
                })
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={authData.password}
              onChange={(e) =>
                setAuthData({
                  ...authData,
                  password: e.target.value
                })
              }
              required
            />

            <button type="submit">
              {isLogin
                ? "Login"
                : "Register"}
            </button>

          </form>

          {authMessage && (
            <p>{authMessage}</p>
          )}

          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setAuthMessage("");
            }}
          >
            {isLogin
              ? "Create a new account"
              : "Already have an account? Login"}
          </button>

        </div>

      ) : (

        <div className="welcome">

          <h2>
            Welcome, {user.name}! 👋
          </h2>

          <p>{user.email}</p>

          <button onClick={handleLogout}>
            Logout
          </button>

        </div>
      )}

      {/* ================= PRODUCT MANAGEMENT ================= */}

      {user && user.isAdmin && (
        <div className="admin-form">

          <h2>
            {editingProduct
              ? "✏️ Edit Product"
              : "➕ Add New Product"}
          </h2>

          <input
            type="text"
            placeholder="Product Name"
            value={productData.name}
            onChange={(e) =>
              setProductData({
                ...productData,
                name: e.target.value
              })
            }
          />
          <input
            type="text"
            placeholder="Image URL or path"
            value={productData.image}
            onChange={(e) =>
              setProductData({
                ...productData,
                image: e.target.value
              })
            }
          />

          <input
            type="number"
            placeholder="Price"
            value={productData.price}
            onChange={(e) =>
              setProductData({
                ...productData,
                price: e.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="Category"
            value={productData.category}
            onChange={(e) =>
              setProductData({
                ...productData,
                category: e.target.value
              })
            }
          />

          <input
            type="number"
            placeholder="Stock"
            value={productData.stock}
            onChange={(e) =>
              setProductData({
                ...productData,
                stock: e.target.value
              })
            }
          />

          <button
            onClick={
              editingProduct
                ? updateProduct
                : addProduct
            }
            disabled={
              editingProduct
                ? updatingProduct
                : addingProduct
            }
          >
            {editingProduct
              ? updatingProduct
                ? "Updating Product... ⏳"
                : "Update Product"
              : addingProduct
              ? "Adding Product... ⏳"
              : "Add Product"}
          </button>

          {editingProduct && (
            <button
              onClick={() => {
                setEditingProduct(null);

                setProductData({
                  name: "",
                  price: "",
                  category: "",
                  stock: ""
                });
              }}
            >
              Cancel
            </button>
          )}

        </div>
      )}

      {/* ================= PRODUCTS ================= */}

      <h2>
        Products 🛒
      </h2>
      {loadingProducts ? (
        <p className="loading-message">
          Loading products... ⏳
        </p>
      ) : productError ? (
        <div className="error-container">

          <p className="error-message">
            {productError}
          </p>

          <button onClick={fetchProducts}>
            🔄 Retry
          </button>

        </div>
      ) : (
        <>
      <div className="product-filters">
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All Categories</option>

          {[...new Set(products.map((product) => product.category))].map(
            (category) => (
              <option key={category} value={category}>
                {category}
              </option>
            )
          )}
        </select>
      </div>
        </>
      )}
      {!loadingProducts && filteredProducts.length === 0 && (
        <p>No products found. 😔</p>
      )}
      <div className="products">
          
          {filteredProducts.map((product) => (

          <div
            className="card"
            key={product._id}
          >

            {product.image && (
              <img
                src={`${API}${product.image}`}
                alt={product.name}
                className="product-image"
              />
            )}

            <h3>
              {product.name}
            </h3>

            <p className="price">
              ₹{product.price}
            </p>

            <p>
              Category: {product.category}
            </p>

            <p>
              {product.stock > 0
                ? `Stock: ${product.stock}`
                : "❌ Out of Stock"}
            </p>

            {/* ADD TO CART */}

            <button
              disabled={product.stock <= 0}
              onClick={() => {

                const existingItem = cart.find(
                  (item) =>
                    item._id === product._id
                );

                if (existingItem) {
                  if (existingItem.quantity >= product.stock) {
                    alert("Not enough stock available!");
                    return;
                  }
                  if (product.stock <= 0) {
                    alert("Product is out of stock!");
                    return;
                  }

                  setCart(
                    cart.map((item) =>
                      item._id === product._id
                        ? {
                            ...item,
                            quantity:
                              item.quantity + 1
                          }
                        : item
                    )
                  );

                } else {

                  setCart([
                    ...cart,
                    {
                      ...product,
                      quantity: 1
                    }
                  ]);

                }
              }}
            >
              {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
            </button>

            {/* EDIT / DELETE - ADMIN ONLY */}

            {user && user.isAdmin && (
              <>
                <button
                  onClick={() => {

                    setEditingProduct(product);

                    setProductData({
                      name: product.name,
                      price: product.price,
                      category: product.category,
                      stock: product.stock,
                      image: product.image || ""
                    });

                  }}
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={() =>
                    deleteProduct(product._id)
                  }
                  disabled={deletingProductId === product._id}
                >
                  {deletingProductId === product._id
                    ? "Deleting... ⏳"
                    : "🗑️ Delete"}
                </button>
              </>
            )}

          </div>
        ))}
      
      </div>

      {/* ================= CART ================= */}

      <h2>
        🛒 My Cart
      </h2>

      {cart.length === 0 ? (

        <p>
          Your cart is empty.
        </p>

      ) : (

        cart.map((item, index) => (
          <div
            key={index}
            className="cart-item"
          >

        <p>

          {item.name} - ₹{item.price}
          {" | "}
          Quantity: {item.quantity}

          {/* DECREASE */}

          <button
            onClick={() =>
              setCart(
                cart.map(
                  (cartItem, i) =>
                    i === index &&
                    cartItem.quantity > 1
                      ? {
                          ...cartItem,
                          quantity:
                            cartItem.quantity - 1
                        }
                      : cartItem
                )
              )
            }
          >
            −
          </button>

          {/* INCREASE */}

          <button
            onClick={() => {

              if (item.quantity >= item.stock) {
                alert("Not enough stock available!");
                return;
              }

              setCart(
                cart.map((cartItem, i) =>
                  i === index
                    ? {
                        ...cartItem,
                        quantity:
                          cartItem.quantity + 1
                      }
                    : cartItem
                )
              );

            }}
          >
            +
          </button>

          {/* REMOVE */}

          <button
            onClick={() => {

              setCart(
                cart.filter(
                  (_, i) => i !== index
                )
              );

            }}
          >
            🗑️ Remove
          </button>

        </p>

      </div>

    ))
  )}

  {/* TOTAL */}

  <h3 className="cart-total">
    Total: ₹
    {cart.reduce(
      (total, item) =>
        total +
        item.price * item.quantity,
      0
    )}
  </h3>

  {/* PLACE ORDER */}

  <button
    onClick={placeOrder}
    disabled={cart.length === 0 || placingOrder}
  >
    {placingOrder
      ? "Placing Order... ⏳"
      : cart.length === 0
      ? "Cart is Empty"
      : "Place Order"}
  </button>

      {/* ================= ORDER CONFIRMATION ================= */}

      {order && (

        <div className="order-success">

          <h2>
            🎉 Order Placed Successfully!
          </h2>

          <p>
            Order ID: {order._id}
          </p>

          <p>
            Total Amount: ₹
            {order.totalAmount}
          </p>

          <p>
            Thank you for shopping with ShopSmart ❤️
          </p>

        </div>
      )}

      {/* ================= PREVIOUS ORDERS ================= */}

      {loadingOrders ? (
        <p className="loading-message">
          Loading orders... ⏳
        </p>
      ) : orderError ? (
        <div className="error-container">

          <p className="error-message">
            {orderError}
          </p>

          <button
            onClick={() => {
              setOrderError("");
              setLoadingOrders(true);

              const token = localStorage.getItem("token");

              axios
                .get(`${API}/api/orders`, {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                })
                .then((response) => {
                  setOrders(response.data);
                })
                .catch((error) => {
                  console.log("Orders Error:", error);

                  setOrderError(
                    "Unable to load previous orders. Please try again."
                  );
                })
                .finally(() => {
                  setLoadingOrders(false);
                });
              }}
          >
              🔄 Retry
          </button>

        </div>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (

          <div
            className="order-card"
            key={order._id}
          >

            <h3>
              Order ID: {order._id}
            </h3>

            {order.items?.map(
              (item, index) => (

                <p key={index}>

                  {item.name} × {item.quantity}
                  {" — "}
                  ₹{item.price * item.quantity}

                </p>
              )
            )}

            <strong>
              Total: ₹{order.totalAmount}
            </strong>

            <p>
              Date:{" "}
              {new Date(
                order.createdAt
              ).toLocaleString()}
            </p>

          </div>
        ))
      )}

    </div>
  );
}

export default App;

