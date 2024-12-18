const express = require('express');
const http = require('http');
const { setupSocketIO, redis } = require("../sockets/redissocketConnection");
require('dotenv').config();
const app =express()
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('../config/mongoConfig');
const server = http.createServer(app);
const router = express.Router();
const Bid = require('../models/bidSchema')

app.use(cors()); 


const io = setupSocketIO(server); 

const allowedOrigins = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));


app.use(cors({
    origin: allowedOrigins, 
    credentials: true, 
}))

app.get('/',(req,res)=>{
    res.json({
        "ok":"okk"
    })
})



app.post("/bid", async (req, res) => {
  const { userId, amount, itemId, eventId } = req.body;
  if (!userId || !amount || amount <= 0 || !itemId || !eventId) {
    return res.status(400).json({ error: "Invalid bid data." });
  }

  // Log the incoming bid data for debugging
  console.log('Received bid data:', { userId, amount, itemId, eventId });

  const eventKey = `event:${eventId}`;
  const userBidsKey = `event:${eventId}:item:${itemId}:userBids`;
  const bidsKey = `event:${eventId}:item:${itemId}:bids`;

  try {
    const eventExists = await redis.exists(eventKey);
    if (!eventExists) {
      await redis.set(eventKey, JSON.stringify({ eventId, name: `Event ${eventId}` }));
     // console.log(`New event created: ${eventId}`);
    }

    // Retrieve existing bids for the user and update
    const existingBids = await redis.hget(userBidsKey, userId);
    if (existingBids) {
      const bidAmounts = JSON.parse(existingBids);
      bidAmounts.push(amount);
      await redis.hset(userBidsKey, userId, JSON.stringify(bidAmounts));
     // console.log(`Existing bid found for user ${userId}, updated bid amounts: ${bidAmounts}`);
    } else {
      await redis.hset(userBidsKey, userId, JSON.stringify([amount]));
      //console.log(`New bid for user ${userId}: ${amount}`);
    }

    // Add the new bid amount to the Redis sorted set
    await redis.zadd(bidsKey, amount, userId);

    // Get the leaderboard (ranked list of bids)
    const leaderboard = await redis.zrevrange(bidsKey, 0, -1, "WITHSCORES");

    // Log leaderboard data
    console.log('Leaderboard:', leaderboard);

    // Process leaderboard and assign ranks
    const rankedData = [];
    let rank = 1;
    let previousBid = null;
    for (let i = 0; i < leaderboard.length; i += 2) {
      const userId = leaderboard[i];
      const currentBid = parseInt(leaderboard[i + 1], 10);
      if (previousBid === currentBid) {
        rankedData.push({ userId, bid: currentBid, rank });
      } else {
        rankedData.push({ userId, bid: currentBid, rank });
        rank++;
      }
      previousBid = currentBid;
    }

    // Log the ranked data
    console.log('Ranked leaderboard data:', rankedData);
    
    // Emit the updated leaderboard to the clients
    io.emit("updateLeaderboard", rankedData);
    console.log("Data sent to client", rankedData);

    // Update Bid Document in MongoDB
    let bidDocument = await Bid.findOne({ event: eventId, user: userId });
    if (!bidDocument) {
      bidDocument = new Bid({
        event: eventId,
        user: userId,
        bids: [],
      });
    }

    // Find or create the itemBid for this itemId
    let itemBid = bidDocument.bids.find((bid) => bid.rowId === itemId);
    if (!itemBid) {
      itemBid = {
        rowId: itemId, // Use itemId as rowId
        amounts: [],
        rank: null,
      };
      bidDocument.bids.push(itemBid);
    }

    // Push the new bid amount into the itemBid amounts array
    itemBid.amounts.push({ value: amount });
    
    // Save the document
    await bidDocument.save();
    //console.log('Bid document saved:', bidDocument);

    return res.status(200).json({ message: "Bid placed successfully." });
  } catch (err) {
    console.error('Error placing bid:', err);
    return res.status(500).json({ error: "Internal server error." });
  }
});


app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

connectDB();

app.use(express.static(path.join(__dirname, 'public')));


const indexRoutes = require('../routes/index');


app.use('/api', indexRoutes);


server.listen(3000,()=>{
    console.log("..on 3000")
})