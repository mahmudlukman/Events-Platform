"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const event_controller_1 = require("../controllers/event.controller");
const auth_1 = require("../middleware/auth");
const eventRouter = express_1.default.Router();
eventRouter.get("/get-category", event_controller_1.getCategoryByName);
eventRouter.post("/create-event", auth_1.isAuthenticated, event_controller_1.createEvent);
eventRouter.get("/get-event/:id", event_controller_1.getEventById);
eventRouter.get("/get-user-event", event_controller_1.getEventsByUser);
eventRouter.get("/get-related-event", event_controller_1.getRelatedEventsByCategory);
eventRouter.get("/get-events", event_controller_1.getAllEvents);
eventRouter.put("/update-event", auth_1.isAuthenticated, event_controller_1.updateEvent);
eventRouter.delete("/delete-event/:eventId", auth_1.isAuthenticated, event_controller_1.deleteEvent);
exports.default = eventRouter;
