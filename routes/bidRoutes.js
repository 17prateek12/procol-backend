const express = require('express');
const protect = require("../middleware/authMiddleware.js");
const {
    //createBid, getEventItemsForBidder, 
    getParticipantEventRoom, placeBid} = require("../controller/bidController.js");

const router = express.Router();

//router.post('/bidder-part',protect,createBid);
//router.get('/bids/event/:eventId/items', protect, getEventItemsForBidder);
router.get('/bids/:eventId/participant-room', protect, getParticipantEventRoom);
router.post('/placed-bid', protect,placeBid);



module.exports = router;