"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCategories = exports.createCategory = void 0;
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const category_model_1 = __importDefault(require("../models/category.model"));
// create category
exports.createCategory = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { name } = req.body;
        const newCategory = (await category_model_1.default.create({
            name,
        }));
        res.status(201).json({
            success: true,
            category: newCategory,
            message: "Category created successfully!",
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// create category
exports.getAllCategories = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const categories = await category_model_1.default.find();
        res.status(201).json({
            success: true,
            categories,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
