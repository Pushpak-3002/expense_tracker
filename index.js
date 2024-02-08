const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { log, Console } = require("console");
const dotenv = require("dotenv");
const path = require("path");
const e = require("express");

const app = express();
dotenv.config();

const port = process.env.PORT || 3000;

const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;

mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.grheahh.mongodb.net/registrationformDB`);



const registrationSchema = new mongoose.Schema({
    name: {type:String},
    email: {type:String},
    password: {type:String}
})

const Registration = mongoose.model("Registration", registrationSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'assets')));

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

            await registrationData.save();
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
            console.log("Login successful:", existingUser);
            const userId = existingUser._id;
            res.redirect("/success");
        } else {
            console.log("Invalid credentials");
            res.redirect("/error");
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.redirect("/error");
    }
});


app.get("/success", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "success.html"));
});

app.get("/error", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "error.html"));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

