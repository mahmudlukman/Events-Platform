"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getLoggedInUser = void 0;
require("dotenv").config();
const user_model_1 = __importDefault(require("../models/user.model"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const cloudinary_1 = __importDefault(require("cloudinary"));
const event_model_1 = __importDefault(require("../models/event.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
// get logged in user
exports.getLoggedInUser = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const user = await user_model_1.default.findById(userId).select("-password");
        res.status(200).json({ success: true, user });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// get user by id
exports.getUserById = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await user_model_1.default.findById(userId).select("-password");
        if (!user) {
            return next(new errorHandler_1.default("User not found", 400));
        }
        res.status(200).json({ success: true, user });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// update user
exports.updateUser = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { name, username, avatar } = req.body;
        const userId = req.user?._id;
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            return next(new errorHandler_1.default('User not found', 400));
        }
        if (name)
            user.name = name;
        if (username)
            user.username = username;
        if (avatar && avatar !== user.avatar?.url) {
            if (user.avatar?.public_id) {
                await cloudinary_1.default.v2.uploader.destroy(user.avatar.public_id);
            }
            const myCloud = await cloudinary_1.default.v2.uploader.upload(avatar, {
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
    }
    catch (error) {
        if (error.code === 11000) {
            if (error.keyValue.username) {
                return next(new errorHandler_1.default('Username already exists. Use a different one!', 400));
            }
        }
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// delete user
exports.deleteUser = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            return next(new errorHandler_1.default("User not found", 404));
        }
        // Unlink relationships
        await Promise.all([
            event_model_1.default.updateMany({ _id: { $in: user.events } }, { $pull: { organizer: user._id } }),
            // Update the 'orders' collection to remove references to the user
            order_model_1.default.updateMany({ _id: { $in: user.orders } }, { $unset: { buyer: 1 } }),
        ]);
        // Delete user
        const deletedUser = await user_model_1.default.findByIdAndDelete(user._id);
        res.status(200).json({ success: true, message: 'User deleted successfully!' });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
