require("dotenv").config();
import User, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { NextFunction, Request, Response } from "express";
import { sendToken } from "../utils/jwt";
import { CreateUserParams } from "../@types";

// create user
export const createUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
      }: CreateUserParams = req.body;

      const isEmailExist = await User.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exist", 400));
      }

      const userNameWithoutSpace = firstName.replace(/\s/g, "");

      const uniqueNumber = Math.floor(Math.random() * 1000);

      const user: IUser = await User.create({
        firstName,
        lastName,
        email,
        password,
        username: `${userNameWithoutSpace}${uniqueNumber}`,
      });

      res.status(201).json({
        success: true,
        message: "User Created Successfully!",
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


export const loginUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
      }
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("Invalid credentials", 400));
      }

      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid credentials", 400));
      }
      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const logoutUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("access_token", "", { maxAge: 1 });
      res
        .status(200)
        .json({ success: true, message: "Logged out successfully" });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
