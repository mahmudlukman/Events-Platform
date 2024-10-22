import express from "express";
import {
  createCategory,
  getAllCategories,
} from "../controllers/category.controller";
import { isAuthenticated } from "../middleware/auth";
const userRouter = express.Router();

userRouter.post("/create-category", createCategory);
userRouter.get("/categories", getAllCategories);

export default userRouter;
