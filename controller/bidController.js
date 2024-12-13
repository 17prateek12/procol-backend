const User = require('../models/userModel.js');
const Event = require('../models/eventModel.js');
const Bid = require('../models/bidModel.js');

//Participants view api

const getParticipantEventRoom = async (req, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;
  
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
  
      if (event.createdBy.toString() === userId) {
        return res
          .status(403)
          .json({ message: "Creator of event cannot participate in their own Event" });
      }
  
      const userBid = await Bid.findOne({ event: eventId, user: userId }).lean();
      res.status(200).json({
        eventName: event.eventName,
        items: event.items,
        userBid: userBid
          ? userBid.bids.map((itemBid) => ({
              item: itemBid.item,
              latestAmount: itemBid.amounts[itemBid.amounts.length - 1], // Get the last amount
            }))
          : [],
      });
    } catch (error) {
      return res.status(500).json({ message: "Server Error", error: error.message });
    }
  };
  


//Allow biider to place bid
const placeBid = async (req, res) => {
    try {
      const { eventId, bids } = req.body;
      const userId = req.user.id;
  
      // Find the event by its ID
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event Not Found" });
      }
  
      // Check if the user is the creator of the event
      if (event.createdBy.toString() === userId) {
        return res
          .status(403)
          .json({ message: "Event creators cannot place bids in their own event" });
      }
  
      // Find the user's bid for the event
      let userBid = await Bid.findOne({ event: eventId, user: userId });
  
      // If the user doesn't have a bid, create a new one
      if (!userBid) {
        userBid = new Bid({
          event: eventId,
          user: userId,
          bids: bids.map((bid) => ({
            item: bid.item,
            amounts: [bid.amount],
          })),
        });
      } else {
        // If the user already has a bid, update it
        bids.forEach((bid) => {
          const existingBid = userBid.bids.find(
            (b) => b.item.toString() === bid.item
          );
          if (existingBid) {
            existingBid.amounts.push(bid.amount); // Fixed: use `amounts.push()`
          } else {
            userBid.bids.push({ item: bid.item, amounts: [bid.amount] });
          }
        });
      }
  
      // Save the user's bid
      await userBid.save();
  
      res.status(200).json({ message: "Bid placed successfully", bid: userId });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  

module.exports = {
    //createBid, getEventItemsForBidder, 
    getParticipantEventRoom, placeBid};

{/*const createBid = async(req,res) =>{
    try {
        const {eventId, userId, bids} = req.body;

        const event = await Event.findById(eventId);
        if(!event){
            return res.status(404).json({message:"event not found"});
        }

        if(event.createBy.toString()===userId.toString()){
            return res.status(400).json({message:"Event creator cannot participate in their own bid"});
        }

        const bidItems = [];
        for(let i =0;i<bids.length;i++){
            const {itemId, amounts}= bids[i];

            const item = event.items.id(itemId);
            
            if(!item){
                return res.status(404).json({message:`Item with ID ${itemId} not found in the event`});
            }
            bidItems.push({
                item:itemId,
                amounts:amounts,
            });

            const newBid = new Bid({
                event:eventId,
                user:userId,
                bids:bidItems,
            });

            const savedBId= await newBid.save();

            return res.status(201).json(savedBId);
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

const getEventItemsForBidder = async (req, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;
  
      // Fetch the event and items
      const event = await Event.findById(eventId).populate("createdBy", "name email");
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
  
      // Prevent the creator from participating as a bidder
      if (event.createdBy._id.toString() === userId) {
        return res.status(403).json({ message: "You cannot participate in your own event." });
      }
  
      return res.status(200).json({ eventName: event.eventName, items: event.items });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };*/}