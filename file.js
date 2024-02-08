const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { log, Console } = require("console");
const dotenv = require("dotenv");
const path = require("path");

const app = express();
dotenv.config();

const port = process.env.PORT || 3000;

const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;

mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.grheahh.mongodb.net/registrationformDB`);

app.set("view engine", "ejs"); // Set the view engine to EJS
app.set("views", path.join(__dirname, "views")); // Set the views directory

const expenseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' },
    description: { type: String },
    amount: { type: Number },
    date: { type: Date, default: Date.now }
});

const Expense = mongoose.model("Expense", expenseSchema);

const registrationSchema = new mongoose.Schema({
    name: {type:String},
    email: {type:String},
    password: {type:String},
    expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }]
})

const Registration = mongoose.model("Registration", registrationSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "index.html"));
});

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "signup.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "login.html"));
});

app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await Registration.findOne({ email: email });

        if (!existingUser) {
            const registrationData = new Registration({
                name,
                email,
                password
            });

            const savedUser = await registrationData.save();

            // Create an expense for the user
            const expenseData = new Expense({
                user: savedUser._id,
                description: "Initial Balance",
                amount: 0  // You can set an initial balance if needed
            });

            res.redirect("/success");
        } else {
            console.log("Existing User");
            console.log(existingUser);
            res.redirect("/error");
        }
    } catch (error) {
        console.error("Error during registration:", error);
        res.redirect("/error");
    }
});



app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await Registration.findOne({ email: email, password: password });

        if (existingUser) {
            const expenses = await Expense.find({ user: existingUser._id });

            console.log("Login successful:", existingUser);

            // Pass user information as a parameter in the redirect URL
            res.redirect(`/success?userId=${existingUser._id}`);
        } else {
            console.log("Invalid credentials");
            res.redirect("/error");
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.redirect("/error");
    }
});

app.get("/success", async (req, res) => {
    try {
        const userId = req.query.userId; // Extract userId from the URL parameter

        const existingUser = await Registration.findById(userId);

        if (existingUser) {
            const expenses = await Expense.find({ user: userId });

            console.log("Rendering dashboard for:", existingUser);
            res.render("dashboard", { user: existingUser, expenses });
        } else {
            console.log("Invalid user ID");
            res.redirect("/error");
        }
    } catch (error) {
        console.error("Error rendering dashboard:", error);
        res.redirect("/error");
    }
});

app.get("/expenses", async (req, res) => {
    try {
        const userId = req.user._id;  // Assuming you have user information stored in req.user after login

        const expenses = await Expense.find({ user: userId });

        res.render("expenses", { expenses });
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.redirect("/error");
    }
});

app.post("/addExpense", async (req, res) => {
    try {
        const userId = req.user._id;  // Assuming you have user information stored in req.user after login
        const { description, amount } = req.body;

        const expenseData = new Expense({
            user: userId,
            description,
            amount
        });

        await expenseData.save();

        res.redirect("/expenses");
    } catch (error) {
        console.error("Error adding expense:", error);
        res.redirect("/error");
    }
});


app.get("/error", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "error.html"));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})