import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import Category from "../models/category.model";
import { CreateCategoryParams } from "../@types";

// create category
export const createCategory = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;
      const newCategory = (await Category.create({
        name,
      })) as CreateCategoryParams;

      res.status(201).json({
        success: true,
        category: newCategory,
        message: "Category created successfully!",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// create category
export const getAllCategories = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await Category.find();

      res.status(201).json({
        success: true,
        categories,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
