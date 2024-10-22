import express from "express";
import {
  createCategory,
  getAllCategories,
} from "../controllers/category.controller";

const categoryRouter = express.Router();

categoryRouter.post("/create-category", createCategory);
categoryRouter.get("/categories", getAllCategories);

export default categoryRouter;
