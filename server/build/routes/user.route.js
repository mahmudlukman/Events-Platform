"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const userRouter = express_1.default.Router();
userRouter.get("/me", auth_1.isAuthenticated, user_controller_1.getLoggedInUser);
userRouter.get("/user/:userId", auth_1.isAuthenticated, user_controller_1.getUserById);
userRouter.put("/update-user/", auth_1.isAuthenticated, user_controller_1.updateUser);
userRouter.delete("/delete/:userId", auth_1.isAuthenticated, user_controller_1.deleteUser);
exports.default = userRouter;
