
// import mongoose, { Document, Schema } from 'mongoose';
// import { TurfData } from '../Type/turf';

// export interface Rating {
//   userId: mongoose.Types.ObjectId;
//   rating: number;
//   review?: string;
//   createdAt: Date;
// }

// export interface Booking {
//   userId: mongoose.Types.ObjectId;
//   date: Date;
//   startTime: string;
//   endTime: string;
//   status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
//   paymentStatus: 'pending' | 'paid' | 'refunded';
//   amount: number;
//   createdAt: Date;
// }

// export interface TurffData extends Document{
//     ownerId:mongoose.Types.ObjectId;
//     name:string;
//     city:string;
//     area:string;
//     location:string;
//     turfType: 'football' | 'cricket' | 'multi-sport' | 'swimming' | 'basketball' | 'badminton' | 'tennis' | 'volleyball' | 'hockey';
//     size?:string;
//     images:string[];
//     availability: {
//   [day: string]: { start: string; end: string }[];
// };
// hourlyRate:number;
// status:'active'|'inactive';
// isDelete:Boolean;
// ratings: Rating[];
//   bookings: Booking[];
//   averageRating?: number;

// }

// const ratingSchema = new Schema<Rating>({
//   userId: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   rating: {
//     type: Number,
//     required: true,
//     min: 1,
//     max: 5
//   },
//   review: {
//     type: String,
//     maxlength: 500
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// const bookingSchema = new Schema<Booking>({
//   userId: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   date: {
//     type: Date,
//     required: true
//   },
//   startTime: {
//     type: String,
//     required: true
//   },
//   endTime: {
//     type: String,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'confirmed', 'cancelled', 'completed'],
//     default: 'pending'
//   },
//   paymentStatus: {
//     type: String,
//     enum: ['pending', 'paid', 'refunded'],
//     default: 'pending'
//   },
//   amount: {
//     type: Number,
//     required: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });


// const turfSchema=new Schema<TurffData>(
//     {
//         ownerId:{
//             type:Schema.Types.ObjectId,
//             ref:'User',
//             required:true
//         },
//         name:{
//             type:String,
//             required:true
//         },
//         city:{
//             type:String,
//             required:true
//         },
//         area:{
//             type:String,
//             required:true
//         },
//         location:{
//             type:String,
//             required:true
//         },
//         turfType:{
//             type:String,
//             // enum:['football','cricket','swimming','basketball','badminton','tennis','volleyball','hockey'],
//             enum: ['football', 'cricket', 'swimming', 'basketball', 'badminton', 'tennis', 'volleyball', 'hockey', 'multi-sport'],
//             // enum: ['Football', 'Cricket', 'Swimming', 'Basketball', 'Badminton', 'Tennis', 'Volleyball', 'Hockey', 'Multi-sport'],

//             required:true
//         },
//         size:{
//             type:String
//         },
//         images:{
//             type:[String],
//             required:true,
//         },
//         hourlyRate:{
//             type:Number,
//             required:true,
//         },
//         status:{
//             type:String,
//             enum:['active','inactive'],
//             default:'active'
//         },
//         // availability:{
//         //     type:String,
//         //     required:true,
//         // },
//          availability: { type: Schema.Types.Mixed, required: true },
//      isDelete: {
//       type: Boolean,
//       default: false
//     },

//     ratings: [ratingSchema],
//     bookings: [bookingSchema],
//     averageRating: {
//       type: Number,
//       default: 0,
//       min: 0,
//       max: 5
//     }

//     },
//     {
//         timestamps:true,
//     }

// );

// // Calculate average rating before saving
// turfSchema.pre('save', function(next) {
//   if (this.ratings && this.ratings.length > 0) {
//     const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0);
//     this.averageRating = sum / this.ratings.length;
//   } else {
//     this.averageRating = 0;
//   }
//   next();
// });

// // const Turff=mongoose.model('Turff',turfSchema)
// const Turff = mongoose.model<TurffData>('Turf', turfSchema);

// export default Turff;




import mongoose, { Schema, Document } from 'mongoose';
import { ratingSchema, Rating } from './ratingModel';
import { bookingSchema, Booking } from './bookingModel';

export interface TurffData extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  city: string;
  area: string;
  location: string;
  turfType: 'football' | 'cricket' | 'multi-sport' | 'swimming' | 'basketball' | 'badminton' | 'tennis' | 'volleyball' | 'hockey';
  size?: string;
  images: string[];
  availability: {
    [day: string]: { start: string; end: string }[];
  };
  hourlyRate: number;
  status: 'active' | 'inactive';
  isDelete: boolean;
  ratings: Rating[];
  bookings: Booking[];
  averageRating?: number;
}

const turfSchema = new Schema<TurffData>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    area: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    turfType: {
      type: String,
      enum: ['football', 'cricket', 'multi-sport', 'swimming', 'basketball', 'badminton', 'tennis', 'volleyball', 'hockey'],
      required: true
    },
    size: {
      type: String
    },
    images: {
      type: [String],
      required: true
    },
    hourlyRate: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    availability: {
      type: Schema.Types.Mixed,
      required: true
    },
    isDelete: {
      type: Boolean,
      default: false
    },
    ratings: [ratingSchema],
    bookings: [bookingSchema],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  {
    timestamps: true
  }
);

// Calculate average rating before saving
turfSchema.pre('save', function (next) {
  if (this.ratings && this.ratings.length > 0) {
    const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0);
    this.averageRating = sum / this.ratings.length;
  } else {
    this.averageRating = 0;
  }
  next();
});

const Turff = mongoose.model<TurffData>('Turf', turfSchema);
export default Turff;
