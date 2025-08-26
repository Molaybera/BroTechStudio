const express = require('express');
const cors = require('cors');

const connectDB = require('./config/database.js');
const bookingRoutes = require('./routes/bookingRouters.js');

require('dotenv').config();
// connect the DataBase
connectDB();

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(express.static('public'));


app.use('/api/book',bookingRoutes);

app.get('/', (req,res) =>{
    res.render('index');
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log('server is running in ',PORT)
});