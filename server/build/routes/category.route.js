"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("../controllers/category.controller");
const categoryRouter = express_1.default.Router();
categoryRouter.post("/create-category", category_controller_1.createCategory);
categoryRouter.get("/categories", category_controller_1.getAllCategories);
exports.default = categoryRouter;
