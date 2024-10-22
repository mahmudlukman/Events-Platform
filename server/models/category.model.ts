import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
}

const CategorySchema: Schema<ICategory> = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const Category: Model<ICategory> = mongoose.model("Category", CategorySchema);

export default Category;
