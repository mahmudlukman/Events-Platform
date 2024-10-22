import express from "express";
import {
  createEvent,
  deleteEvent,
  getCategoryByName,
  getEventById,
  getEventsByUser,
  getRelatedEventsByCategory,
  updateEvent,
} from "../controllers/event.controller";
import { isAuthenticated } from "../middleware/auth";
const eventRouter = express.Router();

eventRouter.get("/get-category", getCategoryByName);
eventRouter.post("/create-event", isAuthenticated, createEvent);
eventRouter.get("/get-event/:id", getEventById);
eventRouter.get("/get-user-event", getEventsByUser);
eventRouter.get("/get-related-event", getRelatedEventsByCategory);
eventRouter.put("/update-event", isAuthenticated, updateEvent);
eventRouter.delete("/delete-event/:eventId", isAuthenticated, deleteEvent);

export default eventRouter;
