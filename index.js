const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDb = require('./connection/conntectDb.js');
const userRoutes = require('./routes/userRoute.js');
const eventRoutes = require('./routes/eventRoutes.js');
const bidRoutes = require('./routes/bidRoutes.js')

require('dotenv').config();
const Port = process.env.PORT || 5001;
connectDb();
const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/users", userRoutes);
app.use('/api/event',eventRoutes);
app.use('/api/bidder',bidRoutes);

app.listen(Port, () => {
    console.log(`Server running on port ${Port}`);
});