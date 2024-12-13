const express = require('express');
const {createEvent, getEvent, getEventsByUser, getAllEvents, getCreatorEventRoom} = require('../controller/eventController.js');
const protect = require("../middleware/authMiddleware.js");
const verifyEventCreator = require("../middleware/verifyEventCreator.js");


const router = express.Router();
router.post('/event-create', protect, createEvent);
router.get('/events/:eventId', protect ,getEvent);
router.get('/users/:userId/events', protect ,getEventsByUser);
router.get('/events', getAllEvents);
router.get('/events/:eventId/room', protect,verifyEventCreator , getCreatorEventRoom);


module.exports = router;