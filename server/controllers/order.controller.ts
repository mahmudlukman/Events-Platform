import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import Order, { IOrderItem } from "../models/order.model";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import User from "../models/user.model";
import Event from "../models/event.model";
import mongoose from "mongoose";
require("dotenv").config();
const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

interface InitiatePaymentParams {
  eventId: string;
  amount: number;
}

interface PaymentVerificationParams {
  status: string;
  tx_ref: string;
  transaction_id: string;
}

// INITIALIZE PAYMENT
interface InitiatePaymentParams {
  eventId: string;
  amount: number;
}

export const initializePayment = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId, amount, redirect_url } = req.body as {
        eventId: string;
        amount: number;
        redirect_url: string;
      };
      const userId = req.user?._id

      const event = await Event.findById(eventId);
      if (!event) {
        return next(new ErrorHandler("Event not found", 404));
      }

      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      // Handle free events
      if (amount === 0) {
        const order = await Order.create({
          paymentId: `FREE_${uuidv4()}`,
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

      const tx_ref = `EVENT_${uuidv4()}`;
      
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

      const response = await axios.post(
        "https://api.flutterwave.com/v3/payments",
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        const pendingOrder = await Order.create({
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
      } else {
        return next(new ErrorHandler("Payment initialization failed", 400));
      }
    } catch (error: any) {
      console.error("Payment initialization error:", error.response?.data || error.message);
      return next(new ErrorHandler(error.message || "Payment initialization failed", 500));
    }
  }
);

// VERIFY PAYMENT
export const verifyPayment = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, tx_ref, transaction_id } =
        req.query as unknown as PaymentVerificationParams;

      if (status === "successful") {

        const response = await flw.Transaction.verify({ id: transaction_id });

        if (
          response.data.status === "successful" &&
          response.data.amount &&
          response.data.currency === "NGN"
        ) {
          const { eventId, userId } = response.data.meta;

          const order = await Order.create({
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
        } else {
          // Payment verification failed
          return res.status(400).json({
            success: false,
            message: "Payment verification failed",
          });
        }
      } else {
        // Payment status not successful
        return res.status(400).json({
          success: false,
          message: "Payment was not successful",
        });
      }
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// GET ORDERS BY EVENT
export const getOrdersByEvent = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId, searchString = "" } = req.query;

      if (!eventId) {
        return next(new ErrorHandler("Event ID is required", 400));
      }

      const query: any = {
        event: new mongoose.Types.ObjectId(eventId as string),
      };

      if (searchString) {
        query["buyer.name"] = { $regex: searchString, $options: "i" };
      }

      const orders = await Order.aggregate<IOrderItem>([
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
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// GET ORDERS BY USER
export const getOrdersByUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const userId = req.user?._id;

      if (!userId) {
        return next(new ErrorHandler("User ID is required", 400));
      }

      const skipAmount = (Number(page) - 1) * Number(limit);

      const orders = await Order.find({ buyer: userId })
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

      const totalOrders = await Order.countDocuments({ buyer: userId });

      res.status(200).json({
        success: true,
        orders: JSON.parse(JSON.stringify(orders)),
        totalPages: Math.ceil(totalOrders / Number(limit)),
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
