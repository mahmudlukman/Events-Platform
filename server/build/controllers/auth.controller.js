"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.loginUser = exports.createUser = void 0;
require("dotenv").config();
const user_model_1 = __importDefault(require("../models/user.model"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const jwt_1 = require("../utils/jwt");
// create user
exports.createUser = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const isEmailExist = await user_model_1.default.findOne({ email });
        if (isEmailExist) {
            return next(new errorHandler_1.default("Email already exist", 400));
        }
        const userNameWithoutSpace = name.replace(/\s/g, "");
        const uniqueNumber = Math.floor(Math.random() * 1000);
        const user = await user_model_1.default.create({
            name,
            email,
            password,
            username: `${userNameWithoutSpace}${uniqueNumber}`,
        });
        res.status(201).json({
            success: true,
            message: "User Created Successfully!",
            user,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
exports.loginUser = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new errorHandler_1.default("Please enter email and password", 400));
        }
        const user = await user_model_1.default.findOne({ email }).select("+password");
        if (!user) {
            return next(new errorHandler_1.default("Invalid credentials", 400));
        }
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return next(new errorHandler_1.default("Invalid credentials", 400));
        }
        (0, jwt_1.sendToken)(user, 200, res);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
exports.logoutUser = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        res.cookie("access_token", "", {
            maxAge: 1,
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        res
            .status(200)
            .json({ success: true, message: "Logged out successfully" });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
