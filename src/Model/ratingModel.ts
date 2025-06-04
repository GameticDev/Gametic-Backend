
import mongoose, { Schema, Document } from 'mongoose';

export interface Rating extends Document {
  userId: mongoose.Types.ObjectId;
  rating: number;
  review?: string;
  createdAt: Date;
}

const ratingSchema = new Schema<Rating>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Rating = mongoose.model<Rating>('Rating', ratingSchema);
export { ratingSchema, Rating };
