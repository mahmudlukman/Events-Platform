import mongoose, { Document, Model, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description?: string;
  location?: string;
  image: {
    public_id: string;
    url: string;
  };
  startDateTime: Date;
  endDateTime: Date;
  price: string;
  isFree: boolean;
  url?: string;
  category: { _id: string; name: string };
  organizer: { _id: string; firstName: string; lastName: string };
}

const EventSchema: Schema<IEvent> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    image: {
      public_id: String,
      url: String,
    },
    startDateTime: { type: Date, default: Date.now },
    endDateTime: { type: Date, default: Date.now },
    price: { type: String },
    isFree: { type: Boolean, default: false },
    url: { type: String },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    organizer: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Event: Model<IEvent> = mongoose.model("Event", EventSchema);
export default Event;
