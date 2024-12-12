const express = require('express');
const {createEvent, getEvent, getEventsByUser, getAllEvents} = require('../controller/eventController.js');
const protect = require("../middleware/authMiddleware.js");


const router = express.Router();
router.post('/event-create', protect, createEvent);
router.get('/events/:eventId', protect ,getEvent);
router.get('/users/:userId/events', protect ,getEventsByUser);
router.get('/events', getAllEvents);


module.exports = router;