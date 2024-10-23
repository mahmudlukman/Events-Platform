import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import Category from "../models/category.model";
import User from "../models/user.model";
import { CreateEventParams, GetAllEventsParams, UpdateEventParams } from "../@types";
import Event from "../models/event.model";
import cloudinary from "cloudinary";


export const findCategoryByName = async (name: string) => {
  const category = await Category.findOne({
    name: { $regex: name, $options: "i" },
  });
  return category;
};

// Get Category By Name
export const getCategoryByName = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;
      const category = await findCategoryByName(name);

      if (!category) {
        return next(new ErrorHandler("Category not found", 400));
      }

      res.status(200).json({
        success: true,
        category: JSON.parse(JSON.stringify(category)),
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

const populateEvent = (query: any) => {
  return query
    .populate({
      path: "organizer",
      model: User,
      select: "_id firstName lastName",
    })
    .populate({ path: "category", model: Category, select: "_id name" });
};

// CREATE
export const createEvent = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user._id;
      const { event } = req.body;
      const image = event.image;

      const organizer = await User.findById(userId);
      if (!organizer) {
        return next(new ErrorHandler("Organizer not found", 404));
      }

      if (image) {
        const myCloud = await cloudinary.v2.uploader.upload(image, {
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

      const newEvent = await Event.create({
        ...event,
        category: event.categoryId,
        organizer: userId,
      });

      res.status(201).json({
        success: true,
        event: newEvent,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// GET ONE EVENT BY ID
export const getEventById = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const event = await populateEvent(Event.findById(id));

      if (!event) {
        return next(new ErrorHandler("Event not found", 404));
      }

      res.status(200).json({
        success: true,
        event,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// UPDATE
export const updateEvent = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { event } = req.body;
      const image = event.image;

      const eventToUpdate = await Event.findById(event._id);

      if (!eventToUpdate) {
        return next(new ErrorHandler("Event not found", 401));
      }

      const organizerId = eventToUpdate.organizer.toString();
      const requestUserId = userId.toString();

      if (organizerId !== requestUserId) {
        return next(
          new ErrorHandler("Unauthorized: You are not the event organizer", 403)
        );
      }

      if (image && image.startsWith("https")) {
        await cloudinary.v2.uploader.destroy(eventToUpdate.image.public_id);
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "courses",
        });
        event.image = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      if (image.startsWith("https")) {
        event.image = {
          public_id: eventToUpdate?.image.public_id,
          url: eventToUpdate?.image.url,
        };
      }

      const updateData = {
        ...event,
        category: event.categoryId,
        // Preserve the original organizer
        organizer: eventToUpdate.organizer,
      };

      const updatedEvent = await Event.findByIdAndUpdate(
        event._id,
        updateData,
        { new: true }
      ).populate("category");

      if (!updatedEvent) {
        return next(new ErrorHandler("Failed to update event", 500));
      }

      res.status(200).json({
        success: true,
        event: updatedEvent,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// DELETE
export const deleteEvent = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params;

      const event = await Event.findById(eventId);

      if (!event) {
        return next(new ErrorHandler("Event not found", 404));
      }

      await event.deleteOne({ _id: eventId });

      res.status(200).json({
        success: true,
        message: "Event deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


// GET ALL EVENTS
export const getAllEvents = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Type cast query parameters with default values
      const {
        query,
        category,
        page = '1',
        pageSize = '10',
        sortBy = 'recent'
      } = req.query as GetAllEventsParams;

      const skipAmount = (Number(page) - 1) * Number(pageSize);

      // Sorting options
      let sortOptions: Record<string, 1 | -1> = {};
      switch (sortBy) {
        case "recent":
          sortOptions = { createdAt: -1 };
          break;
        case "oldest":
          sortOptions = { createdAt: 1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
          break;
      }

      // Build query conditions
      const titleCondition = query
        ? { title: { $regex: query, $options: "i" } }
        : {};

      let categoryCondition = null;
      if (category && typeof category === 'string') {
        categoryCondition = await findCategoryByName(category);
      }

      const conditions = {
        $and: [
          titleCondition,
          categoryCondition ? { category: categoryCondition._id } : {},
        ],
      };

      const events = await populateEvent(
        Event.find(conditions)
          .sort(sortOptions)
          .skip(skipAmount)
          .limit(Number(pageSize))
      );

      const totalEvents = await Event.countDocuments(conditions);
      const isNext = totalEvents > skipAmount + events.length;

      res.status(200).json({
        success: true,
        events,
        isNext,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
// GET EVENTS BY ORGANIZER
export const getEventsByUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, page = 1, pageSize = 10, sortBy = "recent" } = req.query;

      const skipAmount = (Number(page) - 1) * Number(pageSize);

      let sortOptions = {};
      switch (sortBy) {
        case "recent":
          sortOptions = { createdAt: -1 };
          break;
        case "oldest":
          sortOptions = { createdAt: 1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
          break;
      }

      const conditions = { organizer: userId };

      const events = await populateEvent(
        Event.find(conditions)
          .sort(sortOptions)
          .skip(skipAmount)
          .limit(Number(pageSize))
      );

      const totalEvents = await Event.countDocuments(conditions);
      const isNext = totalEvents > skipAmount + events.length;

      res.status(200).json({
        success: true,
        events,
        isNext,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// GET RELATED EVENTS: EVENTS WITH SAME CATEGORY
export const getRelatedEventsByCategory = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        categoryId,
        eventId,
        page = 1,
        pageSize = 10,
        sortBy = "recent",
      } = req.query;

      const skipAmount = (Number(page) - 1) * Number(pageSize);

      let sortOptions = {};
      switch (sortBy) {
        case "recent":
          sortOptions = { createdAt: -1 };
          break;
        case "oldest":
          sortOptions = { createdAt: 1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
          break;
      }

      const conditions = {
        $and: [{ category: categoryId }, { _id: { $ne: eventId } }],
      };

      const events = await populateEvent(
        Event.find(conditions)
          .sort(sortOptions)
          .skip(skipAmount)
          .limit(Number(pageSize))
      );

      const totalEvents = await Event.countDocuments(conditions);
      const isNext = totalEvents > skipAmount + events.length;

      res.status(200).json({
        success: true,
        events,
        isNext,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
