const Event = require('../models/Event');
const Item=require("../models/Items");
const Bid = require('../models/bidSchema');

exports.EventDetails = async (req, res) => {
  try {
    const { eventName, startTime, endTime, columns, rows, createdBy, description, eventDate } = req.body;

    console.log("Data received from frontend for event creation...");

    // Validation for required event fields
    if (!eventName || !startTime || !endTime || !Array.isArray(columns) || !Array.isArray(rows) || !createdBy) {
      return res.status(400).json({ message: "Invalid data format." });
    }

    // Ensure each row contains data (check dynamic columns)
    if (!rows.every(row => typeof row === "object")) {
      return res.status(400).json({ message: "Rows must be valid objects with column data." });
    }

    // Step 1: Save the Event
    const newEvent = new Event({
      eventName,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      description: description || "",
      createdBy,
      eventDate: new Date(eventDate),
    });

    const savedEvent = await newEvent.save();

    // Step 2: Process and save Items with dynamic rows
    const itemsToSave = [
      {
        eventId: savedEvent._id,
        columns: columns.map(col => col.name || col), // Save dynamic column names
        rows: rows.map(row => ({
          data: Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key, String(value)]) // Ensure values are strings
          ),
        })),
      },
    ];

    const savedItems = await Item.insertMany(itemsToSave);

    res.status(201).json({
      message: "Event and items created successfully.",
      event: savedEvent,
      items: savedItems,
    });
  } catch (error) {
    console.error("Error creating event:", error.message);
    res.status(500).json({ message: "Error creating event", error: error.message });
  }
};



  exports.getLiveEvents = async (req, res) => {
    try {
      const events = await Event.find();
    
      if (!events.length) {
        return res.status(404).json({ success: false, message: "No events found." });
      }
      const currentDate = new Date();
      console.log("Current Date (UTC):", currentDate); 
      const eventsWithStatus = events.map(event => {
        const eventStartTime = new Date(event.startTime); 
        const eventEndTime = new Date(event.endTime); 
        const isLive = currentDate >= eventStartTime && currentDate <= eventEndTime;
      
        const isUpcoming = eventStartTime > currentDate;
      
        return {
          ...event.toObject(),
          live: isLive, 
          upcoming: isUpcoming,
        };
      });
      
      const liveEvents = eventsWithStatus.filter(event => event.live);
      const upcomingEvents = eventsWithStatus.filter(event => event.upcoming && !event.live);
    
      res.status(200).json({
        success: true,
        liveEvents,     
        upcomingEvents,  
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching events', error: error.message });
    }
  };

exports.getEventWithItems = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required." });
    }
    const event = await Event.findById(eventId).populate({
      path: "items",
      model: "Item",
      match: { eventId },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    // Fetch associated items explicitly in case `populate` isn't used
    const items = await Item.find({ eventId });

    res.status(200).json({
      message: "Event and associated items fetched successfully.",
      event,
      items,
    });
  } catch (error) {
    console.error("Error fetching event with items:", error.message);
    res.status(500).json({ message: "Error fetching event with items", error: error.message });
  }
};


exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("items") // Populate items linked to the event
      .populate("createdBy", "name email"); // Optionally populate user details (name, email)

    res.status(200).json({
      message: "All events fetched successfully.",
      events,
    });
  } catch (error) {
    console.error("Error fetching all events:", error.message);
    res.status(500).json({ message: "Error fetching events", error: error.message });
  }
};


exports.getEventsByUser = async (req, res) => {
  try {
    // Assuming `req.user` contains the authenticated user's ID
    const userId = req.user.id;

    const userEvents = await Event.find({ createdBy: userId })
      .populate("items") // Populate items linked to the event
      .populate("createdBy", "name email"); // Optionally populate user details (name, email)

    res.status(200).json({
      message: "User's events fetched successfully.",
      events: userEvents,
    });
  } catch (error) {
    console.error("Error fetching user's events:", error.message);
    res.status(500).json({ message: "Error fetching user's events", error: error.message });
  }
};
