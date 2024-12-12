const User = require('../models/userModel.js');
const Event = require('../models/eventModel.js');
const Bid = require('../models/bidModel.js');

const createBid = async(req,res) =>{
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
  };
  

module.exports = {createBid, getEventItemsForBidder};