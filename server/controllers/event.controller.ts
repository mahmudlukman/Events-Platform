import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import Category from "../models/category.model";
import User from "../models/user.model";
import { CreateEventParams, UpdateEventParams } from "../@types";
import Event from "../models/event.model";

// get category by name
export const getCategoryByName = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;
      const category = await Category.findOne({
        name: { $regex: name, $options: "i" },
      });

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
      const { event }: CreateEventParams = req.body;

      const organizer = await User.findById(userId);
      if (!organizer) {
        return next(new ErrorHandler("Organizer not found", 404));
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
      const userId = req.user._id;
      const { event }: UpdateEventParams = req.body;

      const eventToUpdate = await Event.findById(event._id);
      if (!eventToUpdate || eventToUpdate.organizer.toString() !== userId) {
        return next(new ErrorHandler("Unauthorized or event not found", 401));
      }

      const updatedEvent = await Event.findByIdAndUpdate(
        event._id,
        { ...event, category: event.categoryId },
        { new: true }
      );

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

interface IPaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
}

// GET ALL EVENTS
// export const getAllEvents = catchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const {
//         query,
//         category,
//         page = 1,
//         pageSize = 10,
//         sortBy = "recent",
//       } = req.query;

//       const skipAmount = (Number(page) - 1) * Number(pageSize);

//       // Sorting options
//       let sortOptions = {};
//       switch (sortBy) {
//         case "recent":
//           sortOptions = { createdAt: -1 };
//           break;
//         case "oldest":
//           sortOptions = { createdAt: 1 };
//           break;
//         // Add more sorting options as needed
//         default:
//           sortOptions = { createdAt: -1 };
//           break;
//       }

//       // Build query conditions
//       const titleCondition = query
//         ? { title: { $regex: query, $options: "i" } }
//         : {};
//       const categoryCondition = category
//         ? await getCategoryByName(category)
//         : null;
//       const conditions = {
//         $and: [
//           titleCondition,
//           categoryCondition ? { category: categoryCondition._id } : {},
//         ],
//       };

//       const events = await populateEvent(
//         Event.find(conditions)
//           .sort(sortOptions)
//           .skip(skipAmount)
//           .limit(Number(pageSize))
//       );

//       const totalEvents = await Event.countDocuments(conditions);
//       const isNext = totalEvents > skipAmount + events.length;

//       res.status(200).json({
//         success: true,
//         events,
//         isNext,
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );

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
