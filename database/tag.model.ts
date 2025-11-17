import { Document, model, models, Schema } from "mongoose";

export interface ITag extends Document {
  name: string;
  questions: number;
}

const tagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, unique: true },
    questions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Tag = models?.tag || model<ITag>("Tag", tagSchema);

export default Tag;
