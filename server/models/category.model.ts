import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICategory extends Document {
  _id: string;
  name: string;
}

const CategorySchema: Schema<ICategory> = new Schema({
  name: { type: String, required: true, unique: true },
});

const Category: Model<ICategory> = mongoose.model("Category", CategorySchema);

export default Category;
