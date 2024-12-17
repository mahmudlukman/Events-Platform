"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelatedEventsByCategory = exports.getEventsByUser = exports.getAllEvents = exports.deleteEvent = exports.updateEvent = exports.getEventById = exports.createEvent = exports.getCategoryByName = exports.findCategoryByName = void 0;
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const category_model_1 = __importDefault(require("../models/category.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const event_model_1 = __importDefault(require("../models/event.model"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const findCategoryByName = async (name) => {
    const category = await category_model_1.default.findOne({
        name: { $regex: name, $options: "i" },
    });
    return category;
};
exports.findCategoryByName = findCategoryByName;
// Get Category By Name
exports.getCategoryByName = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { name } = req.body;
        const category = await (0, exports.findCategoryByName)(name);
        if (!category) {
            return next(new errorHandler_1.default("Category not found", 400));
        }
        res.status(200).json({
            success: true,
            category: JSON.parse(JSON.stringify(category)),
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
const populateEvent = (query) => {
    return query
        .populate({
        path: "organizer",
        model: user_model_1.default,
        select: "_id name",
    })
        .populate({ path: "category", model: category_model_1.default, select: "_id name" });
};
// CREATE
exports.createEvent = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { event } = req.body;
        const image = event.image;
        const organizer = await user_model_1.default.findById(userId);
        if (!organizer) {
            return next(new errorHandler_1.default("Organizer not found", 404));
        }
        if (image) {
            const myCloud = await cloudinary_1.default.v2.uploader.upload(image, {
                folder: "event",
                width: 800,
                height: 500,
                crop: "fill",
                quality: 90,
            });
            event.image = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        const newEvent = await event_model_1.default.create({
            ...event,
            category: event.categoryId,
            organizer: userId,
        });
        res.status(201).json({
            success: true,
            event: newEvent,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// GET ONE EVENT BY ID
exports.getEventById = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { id } = req.params;
        const event = await populateEvent(event_model_1.default.findById(id));
        if (!event) {
            return next(new errorHandler_1.default("Event not found", 404));
        }
        res.status(200).json({
            success: true,
            event,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
exports.updateEvent = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const { event } = req.body;
        const image = event.image;
        const eventToUpdate = await event_model_1.default.findById(event._id);
        if (!eventToUpdate) {
            return next(new errorHandler_1.default("Event not found", 401));
        }
        const organizerId = eventToUpdate.organizer.toString();
        const requestUserId = userId.toString();
        if (organizerId !== requestUserId) {
            return next(new errorHandler_1.default("Unauthorized: You are not the event organizer", 403));
        }
        // Create update data object with only the fields that are present
        const updateData = {
            category: event.categoryId,
            organizer: eventToUpdate.organizer, // Preserve the original organizer
        };
        // Only add fields that are present in the request
        if (event.title)
            updateData.title = event.title;
        if (event.description)
            updateData.description = event.description;
        if (event.location)
            updateData.location = event.location;
        if (event.startDateTime)
            updateData.startDateTime = event.startDateTime;
        if (event.endDateTime)
            updateData.endDateTime = event.endDateTime;
        if (typeof event.price !== "undefined")
            updateData.price = event.price;
        if (typeof event.isFree !== "undefined")
            updateData.isFree = event.isFree;
        if (event.url)
            updateData.url = event.url;
        // Handle image update only if a new image is provided
        if (image &&
            typeof image === "string" &&
            image.startsWith("data:image")) {
            // Delete old image if exists
            if (eventToUpdate.image?.public_id) {
                await cloudinary_1.default.v2.uploader.destroy(eventToUpdate.image.public_id);
            }
            // Upload new image
            const myCloud = await cloudinary_1.default.v2.uploader.upload(image, {
                folder: "event",
            });
            updateData.image = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        const updatedEvent = await event_model_1.default.findByIdAndUpdate(event._id, updateData, { new: true }).populate("category");
        if (!updatedEvent) {
            return next(new errorHandler_1.default("Failed to update event", 500));
        }
        res.status(200).json({
            success: true,
            event: updatedEvent,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// DELETE
exports.deleteEvent = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const event = await event_model_1.default.findById(eventId);
        if (!event) {
            return next(new errorHandler_1.default("Event not found", 404));
        }
        await event.deleteOne({ _id: eventId });
        res.status(200).json({
            success: true,
            message: "Event deleted successfully",
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// GET ALL EVENTS
exports.getAllEvents = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { query, limit = 6, page, category, } = req.query;
        const skipAmount = (Number(page) - 1) * limit;
        // Build query conditions
        const titleCondition = query
            ? { title: { $regex: query, $options: "i" } }
            : {};
        let categoryCondition = null;
        if (category && typeof category === "string") {
            categoryCondition = await (0, exports.findCategoryByName)(category);
        }
        const conditions = {
            $and: [
                titleCondition,
                categoryCondition ? { category: categoryCondition._id } : {},
            ],
        };
        const eventsQuery = event_model_1.default.find(conditions)
            .sort({ createdAt: "desc" })
            .skip(skipAmount)
            .limit(limit);
        const events = await populateEvent(eventsQuery);
        const eventsCount = await event_model_1.default.countDocuments(conditions);
        res.status(200).json({
            success: true,
            events,
            totalPages: Math.ceil(eventsCount / limit),
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// GET EVENTS BY ORGANIZER
exports.getEventsByUser = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { userId, limit = 6, page, } = req.query;
        const conditions = { organizer: userId };
        const skipAmount = (page - 1) * limit;
        const eventsQuery = event_model_1.default.find(conditions)
            .sort({ createdAt: "desc" })
            .skip(skipAmount)
            .limit(+limit);
        const events = await populateEvent(eventsQuery);
        const eventsCount = await event_model_1.default.countDocuments(conditions);
        res.status(200).json({
            success: true,
            events,
            totalPages: Math.ceil(eventsCount / +limit),
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// GET RELATED EVENTS: EVENTS WITH SAME CATEGORY
exports.getRelatedEventsByCategory = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { categoryId, eventId, page = 1, limit = 3, } = req.query;
        const skipAmount = (Number(page) - 1) * limit;
        const conditions = {
            $and: [{ category: categoryId }, { _id: { $ne: eventId } }],
        };
        const eventsQuery = event_model_1.default.find(conditions)
            .sort({ createdAt: "desc" })
            .skip(skipAmount)
            .limit(limit);
        const events = await populateEvent(eventsQuery);
        const eventsCount = await event_model_1.default.countDocuments(conditions);
        res.status(200).json({
            success: true,
            events,
            totalPages: Math.ceil(eventsCount / +limit),
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
