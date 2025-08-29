const mongoose = require('mongoose');
const config = require('config')

const dbgr = require("debug")("development:mongoose");

mongoose
.connect(`${config.get("MONGODB_URI")}/Veloura`)
.then(() => {
    dbgr('Connected to MongoDB'); //it wont get printed in console until we set the env (i.e.)$env:DEBUG = "development:*"

})
.catch(err => {
    console.log('Error connecting to MongoDB:', err);
});

module.exports = mongoose.connection;

//$env:NODE_ENV="development"; $env:DEBUG="development:*"; node app.js 
//this line i need to learn it later