require("dotenv").config();
import User from "../models/user.model";
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { NextFunction, Request, Response } from "express";
import { UpdateUserParams } from "../@types";
import cloudinary from "cloudinary";
import Event from "../models/event.model";
import Order from "../models/order.model";

// get logged in user
export const getLoggedInUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const user = await User.findById(userId).select("-password");
      res.status(200).json({ success: true, user });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get user by id
export const getUserById = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId).select("-password");
      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }
      res.status(200).json({ success: true, user });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// update user
export const updateUser = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { name, username, avatar }: UpdateUserParams =
          req.body;
        const userId = req.user?._id;
        const user = await User.findById(userId);
  
        if (!user) {
          return next(new ErrorHandler('User not found', 400));
        }
  
        if (name) user.name = name;
        if (username) user.username = username;
  
        if (avatar && avatar !== user.avatar?.url) {
          if (user.avatar?.public_id) {
            await cloudinary.v2.uploader.destroy(user.avatar.public_id);
          }
          const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: 'avatar',
            width: 150,
          });
          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        }
  
        await user.save();
  
        res.status(200).json({
          success: true,
          user,
        });
      } catch (error: any) {
        if (error.code === 11000) {
          if (error.keyValue.username) {
            return next(new ErrorHandler('Username already exists. Use a different one!', 400));
          }
        }
        return next(new ErrorHandler(error.message, 400));
      }
    }
  );

// delete user
export const deleteUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
      // Unlink relationships
      await Promise.all([
        Event.updateMany(
          { _id: { $in: user.events } },
          { $pull: { organizer: user._id } }
        ),

        // Update the 'orders' collection to remove references to the user
        Order.updateMany(
          { _id: { $in: user.orders } },
          { $unset: { buyer: 1 } }
        ),
      ]);

      // Delete user
      const deletedUser = await User.findByIdAndDelete(user._id);
      res.status(200).json({ success: true, message: 'User deleted successfully!' });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
