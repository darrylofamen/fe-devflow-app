import { Document, model, models, Schema, Types } from "mongoose";

export interface ICollection extends Document {
  author: Types.ObjectId;
  question: Types.ObjectId;
}

const collectionSchema = new Schema<ICollection>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  },
  { timestamps: true }
);

const Collection = models?.collection || model<ICollection>("Collection", collectionSchema);

export default Collection;
