require("dotenv").config(); //.config sets all the env to process.env
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const path = require('path');
const ownersRouter = require('./routes/ownersRouter');
const userRouter = require('./routes/usersRouter');
const productRouter = require('./routes/productsRouter');
const expressSession = require("express-session");
const flash = require("connect-flash"); //for using flash message you need something that can create sessions so here we use express-session package
const indexRouter = require('./routes/index'); 
const emailRouter = require("./routes/emailRouter");




const db = require('./config/mongoose-connection'); // Assuming you have a db.js file for MongoDB connection

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    expressSession({
        resave: false,
        saveUninitialized: false,
        secret: process.env.EXPRESS_SESSION_SECRET,
    })
);
app.use(flash()); //flash messages are the messages to show the error also we can get redirect to some other route and access the flash message there
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter); 
app.set('view engine', 'ejs');

app.use('/owners', ownersRouter);
app.use('/users', userRouter);
app.use('/products', productRouter);
app.use("/email", emailRouter);


app.listen(3000);