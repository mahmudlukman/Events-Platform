import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import Order, { IOrderItem } from "../models/order.model";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import User from "../models/user.model";
import Event from "../models/event.model";
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
export const initializePayment = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId, amount } = req.body as InitiatePaymentParams;

      const event = await Event.findById(eventId);
      if (!event) {
        return next(new ErrorHandler("Event not found", 404));
      }

      const user = await User.findById(req.user?._id);
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
        });

        return res.status(201).json({
          success: true,
          message: "Order created successfully for free event",
          order,
        });
      }

      // Initialize Flutterwave payment
      const response = await axios.post(
        "https://api.flutterwave.com/v3/payments",
        {
          tx_ref: `EVENT_${uuidv4()}`,
          amount: amount,
          currency: "NGN",
          redirect_url: `${process.env.ORIGIN}/payment/callback`,
          customer: {
            email: user.email,
            name: user.name,
          },
          customizations: {
            title: `${event.title} Ticket Purchase`,
          },
          meta: {
            eventId,
            userId: user._id,
          },
          configurations: {
            session_duration: 10,
            max_retry_attempt: 5,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        res.status(200).json({
          success: true,
          paymentUrl: response.data.data.link,
        });
      } else {
        return next(new ErrorHandler("Payment initialization failed", 400));
      }
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      return next(new ErrorHandler(error.message, 500));
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
        const transactionDetails = await flw.Transaction.find({
          id: transaction_id,
        });

        const response = await flw.Transaction.verify({ id: transaction_id });

        if (
          response.data.status === "successful" &&
          response.data.amount === transactionDetails.amount &&
          response.data.currency === "NGN"
        ) {
          const { eventId, userId } = response.data.meta;

          const order = await Order.create({
            paymentId: transaction_id,
            totalAmount: response.data.amount.toString(),
            event: eventId,
            buyer: userId,
          });

          res.redirect(
            `${process.env.ORIGIN}/payment/success?orderId=${order._id}`
          );
        } else {
          res.redirect(`${process.env.ORIGIN}/payment/failure`);
        }
      } else {
        res.redirect(`${process.env.ORIGIN}/payment/failure`);
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

      const orders = await Order.aggregate<IOrderItem>([
        {
          $lookup: {
            from: "users",
            localField: "buyer",
            foreignField: "_id",
            as: "buyer",
          },
        },
        {
          $unwind: "$buyer",
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
          $unwind: "$event",
        },
        {
          $project: {
            _id: 1,
            totalAmount: 1,
            createdAt: 1,
            paymentId: 1,
            eventTitle: "$event.title",
            eventId: "$event._id",
            buyer: {
              $concat: ["$buyer.firstName", " ", "$buyer.lastName"],
            },
          },
        },
        {
          $match: {
            $and: [
              { eventId: new Object(eventId) },
              { buyer: { $regex: searchString, $options: "i" } },
            ],
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
          select: "_id title",
        })
        .populate({
          path: "buyer",
          select: "_id firstName lastName",
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
