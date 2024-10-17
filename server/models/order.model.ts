import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOrder extends Document {
  createdAt: Date;
  paymentId: string;
  totalAmount: string;
  event: {
    _id: string;
    title: string;
  };
  buyer: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export type IOrderItem = {
  _id: string;
  totalAmount: string;
  createdAt: Date;
  eventTitle: string;
  eventId: string;
  buyer: string;
};

const OrderSchema: Schema<IOrder> = new Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now,
    },
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    totalAmount: {
      type: String,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Order: Model<IOrder> = mongoose.model("Order", OrderSchema);
export default Order;
