"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersByUser = exports.getOrdersByEvent = exports.verifyPayment = exports.initializePayment = void 0;
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const order_model_1 = __importDefault(require("../models/order.model"));
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const user_model_1 = __importDefault(require("../models/user.model"));
const event_model_1 = __importDefault(require("../models/event.model"));
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv").config();
const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
exports.initializePayment = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { eventId, amount, redirect_url } = req.body;
        const userId = req.user?._id;
        const event = await event_model_1.default.findById(eventId);
        if (!event) {
            return next(new errorHandler_1.default("Event not found", 404));
        }
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            return next(new errorHandler_1.default("User not found", 404));
        }
        // Handle free events
        if (amount === 0) {
            const order = await order_model_1.default.create({
                paymentId: `FREE_${(0, uuid_1.v4)()}`,
                totalAmount: "0",
                event: eventId,
                buyer: user._id,
                status: 'completed'
            });
            return res.status(201).json({
                success: true,
                isFreeEvent: true,
                message: "Order created successfully for free event",
                order,
                orderId: order._id
            });
        }
        const tx_ref = `EVENT_${(0, uuid_1.v4)()}`;
        // Use the provided redirect_url instead of environment variable
        const paymentData = {
            tx_ref,
            amount: amount,
            currency: "NGN",
            redirect_url, // Use the provided redirect_url
            customer: {
                email: user.email,
                name: user.name,
                user_id: userId.toString()
            },
            customizations: {
                title: `${event.title} Ticket Purchase`,
                description: `Ticket purchase for ${event.title}`,
            },
            meta: {
                eventId,
                userId: user._id,
                eventTitle: event.title
            },
            payment_options: "card,banktransfer,ussd",
        };
        const response = await axios_1.default.post("https://api.flutterwave.com/v3/payments", paymentData, {
            headers: {
                Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        if (response.data.status === "success") {
            const pendingOrder = await order_model_1.default.create({
                paymentId: tx_ref,
                totalAmount: amount.toString(),
                event: eventId,
                buyer: user._id,
                status: 'pending'
            });
            res.status(200).json({
                success: true,
                isFreeEvent: false,
                paymentUrl: response.data.data.link,
                orderId: pendingOrder._id,
                tx_ref
            });
        }
        else {
            return next(new errorHandler_1.default("Payment initialization failed", 400));
        }
    }
    catch (error) {
        console.error("Payment initialization error:", error.response?.data || error.message);
        return next(new errorHandler_1.default(error.message || "Payment initialization failed", 500));
    }
});
// VERIFY PAYMENT
exports.verifyPayment = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { status, tx_ref, transaction_id } = req.query;
        if (status === "successful") {
            const response = await flw.Transaction.verify({ id: transaction_id });
            if (response.data.status === "successful" &&
                response.data.amount &&
                response.data.currency === "NGN") {
                const { eventId, userId } = response.data.meta;
                const order = await order_model_1.default.create({
                    paymentId: transaction_id,
                    totalAmount: response.data.amount.toString(),
                    event: eventId,
                    buyer: userId,
                });
                // Send JSON response instead of redirect
                return res.status(200).json({
                    success: true,
                    orderId: order._id,
                    order: order,
                });
            }
            else {
                // Payment verification failed
                return res.status(400).json({
                    success: false,
                    message: "Payment verification failed",
                });
            }
        }
        else {
            // Payment status not successful
            return res.status(400).json({
                success: false,
                message: "Payment was not successful",
            });
        }
    }
    catch (error) {
        console.error(error.response?.data || error.message);
        return next(new errorHandler_1.default(error.message, 500));
    }
});
// GET ORDERS BY EVENT
exports.getOrdersByEvent = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { eventId, searchString = "" } = req.query;
        if (!eventId) {
            return next(new errorHandler_1.default("Event ID is required", 400));
        }
        const query = {
            event: new mongoose_1.default.Types.ObjectId(eventId),
        };
        if (searchString) {
            query["buyer.name"] = { $regex: searchString, $options: "i" };
        }
        const orders = await order_model_1.default.aggregate([
            {
                $match: query,
            },
            {
                $lookup: {
                    from: "users",
                    localField: "buyer",
                    foreignField: "_id",
                    as: "buyer",
                },
            },
            {
                $lookup: {
                    from: "events",
                    localField: "event",
                    foreignField: "_id",
                    as: "event",
                },
            },
            {
                $project: {
                    _id: 1,
                    totalAmount: 1,
                    createdAt: 1,
                    paymentId: 1,
                    eventTitle: "$event.title",
                    eventId: "$event._id",
                    buyer: "$buyer.name",
                },
            },
        ]);
        res.status(200).json({
            success: true,
            orders,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// GET ORDERS BY USER
exports.getOrdersByUser = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user?._id;
        if (!userId) {
            return next(new errorHandler_1.default("User ID is required", 400));
        }
        const skipAmount = (Number(page) - 1) * Number(limit);
        const orders = await order_model_1.default.find({ buyer: userId })
            .sort({ createdAt: "desc" })
            .skip(skipAmount)
            .limit(Number(limit))
            .populate({
            path: "event",
            select: "_id title image startDateTime",
        })
            .populate({
            path: "buyer",
            select: "_id name",
        });
        const totalOrders = await order_model_1.default.countDocuments({ buyer: userId });
        res.status(200).json({
            success: true,
            orders: JSON.parse(JSON.stringify(orders)),
            totalPages: Math.ceil(totalOrders / Number(limit)),
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
