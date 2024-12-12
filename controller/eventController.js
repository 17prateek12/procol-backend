const User = require('../models/userModel.js');
const Event = require('../models/eventModel.js');

const createEvent = async(req,res) =>{
    try {
        const user = await User.findById(req.body.createdBy);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        const newEvent = new Event({
            eventName:req.body.eventName,
            startTime:req.body.startTime,
            endTime:req.body.endTime,
            description:req.body.description,
            createdBy:req.body.createdBy,
            items: req.body.items.map(item => ({
                itemName: item.itemName,
                quantity: item.quantity,
                dynamicFields: item.dynamicFields || {}, // If dynamicFields is not provided, initialize as an empty object
              }))
        });
        const savedEvent = await newEvent.save();
        return res.status(201).json(savedEvent);

    } catch (error) {
        return res.status(500).json({message:"server error",error:error.message});
    }
}



const getEvent = async (req, res) => {
    try {
      const { eventId } = req.params;
      const requestingUserId = req.user.id; // Assuming you have middleware to decode the token and attach `req.user`
  
      // Find the event by ID
      const event = await Event.findById(eventId).populate('createdBy', 'name email');
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
  
      // Check if the requesting user is the creator of the event
      if (event.createdBy._id.toString() !== requestingUserId) {
        return res.status(403).json({ message: "Access denied. You are not authorized to view this event." });
      }
  
      return res.status(200).json(event);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  

  const getEventsByUser = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Validate that the requesting user matches the userId in the request
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Access denied. You are not authorized to view these events." });
      }
  
      // Verify the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Fetch events created by the user
      const events = await Event.find({ createdBy: userId });
  
      return res.status(200).json(events);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
  
  const getAllEvents = async (req, res) => {
    try {
      // Fetch all events, populate user details
      const events = await Event.find().populate('createdBy', 'name email');
  
      return res.status(200).json(events);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };  


module.exports = {createEvent,getEvent, getEventsByUser, getAllEvents};