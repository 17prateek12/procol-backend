const express = require('express');
const protect = require("../middleware/authMiddleware.js");
const {createBid, getEventItemsForBidder} = require("../controller/bidController.js");

const router = express.Router();

router.post('/bidder-part',protect,createBid);
router.get('/bids/event/:eventId/items', protect, getEventItemsForBidder);


module.exports = router;