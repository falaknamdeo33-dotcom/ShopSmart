require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const connectDB = require("./db");
const Product = require("./product");
const Order = require("./order");
const redis = require("./redis");
const User = require("./user");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./authMiddleware");


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use((req, res, next) => {
    console.log("REQUEST:", req.method, req.url);
    next();
});
console.log("REGISTER ROUTE LOADED");

app.post("/api/register", async (req, res) => {
    console.log("REGISTER API CALLED");

    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            message: "Registration successful"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                isAdmin: user.isAdmin
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.json({
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


connectDB();


// ================= HOME =================

app.get("/", (req, res) => {
    res.send("ShopSmart Backend is Running!");
});


// ================= GET PRODUCTS =================

app.get("/api/products", async (req, res) => {
    console.log("GET /api/products called");

    try {
        
        const cachedProducts = await redis.get("products");
        

        if (cachedProducts) {
            console.log("CACHE HIT");
            return res.json(JSON.parse(cachedProducts));
        }

        console.log("CACHE MISS");

        const products = await Product.find();

        await redis.set(
            "products",
            JSON.stringify(products),
            "EX",
            60
        );

        res.json(products);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// ================= ADD PRODUCT =================

app.post("/api/products", authMiddleware, async (req, res) => {
    if (!req.isAdmin) {
        return res.status(403).json({
            message: "Admin access required"
        });
    }
    try {
        const product = new Product(req.body);

        const savedProduct = await product.save();

        // Clear product cache
        await redis.del("products");

        res.status(201).json(savedProduct);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
// ================= UPDATE PRODUCT =================

app.put("/api/products/:id", authMiddleware, async (req, res) => {
    if (!req.isAdmin) {
        return res.status(403).json({
            message: "Admin access required"
        });
    }
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true
            }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Clear product cache
        await redis.del("products");

        res.json(updatedProduct);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// ================= DELETE PRODUCT =================

app.delete("/api/products/:id", authMiddleware, async (req, res) => {
    if (!req.isAdmin) {
        return res.status(403).json({
            message: "Admin access required"
        });
    }
    try {
        const deletedProduct = await Product.findByIdAndDelete(
            req.params.id
        );

        if (!deletedProduct) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Clear product cache
        await redis.del("products");

        res.json({
            message: "Product deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// ================= CREATE ORDER =================

app.post("/api/orders", authMiddleware, async (req, res) => {
    console.log("POST /api/orders called");

    try {
        const { items, totalAmount } = req.body;

        // Check if cart items exist
        if (!items || items.length === 0) {
            return res.status(400).json({
                message: "Order must contain at least one product"
            });
        }

        // Validate each item
        for (const item of items) {

            if (!item.productId) {
                return res.status(400).json({
                    message: "Product ID is required"
                });
            }

            if (!item.quantity || item.quantity < 1) {
                return res.status(400).json({
                    message: "Quantity must be at least 1"
                });
            }

            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    message: `Product not found: ${item.name}`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Not enough stock for ${product.name}`
                });
            }
        }

        // Decrease product stock
        for (const item of items) {

            await Product.findByIdAndUpdate(
                item.productId,
                {
                    $inc: {
                        stock: -item.quantity
                    }
                }
            );
        }

        // Create order
        const order = new Order({
            userId: req.userId,
            items,
            totalAmount
        });

        const savedOrder = await order.save();

        // Clear product cache
        await redis.del("products");

        res.status(201).json(savedOrder);

    } catch (error) {

        console.log("Order Error:", error.message);

        res.status(500).json({
            message: error.message
        });
    }
});

// ================= GET USER ORDERS =================

app.get("/api/orders", authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({
            userId: req.userId
        }).sort({ createdAt: -1 });

        res.json(orders);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// ================= START SERVER =================

app.listen(5000, () => {
    console.log("Server running on port 5000");
});