const express = require('express');
const eventController=require("../controllers/eventController");
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
const verifyEventCreator = require('../middlewares/verifyEventCreator');


router.post('/eventdetails', authMiddleware,eventController.EventDetails);


router.get('/getLiveEvents', eventController.getLiveEvents );


router.get('/getEvents/:eventId', eventController.getEventWithItems );

router.get("/events", eventController.getAllEvents);

// Route to fetch events created by logged-in user
router.get("/mineEvent", authMiddleware, eventController.getEventsByUser);


module.exports = router;

