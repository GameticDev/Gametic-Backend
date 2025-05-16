import mongoose, { Document, Schema } from 'mongoose';

export interface TurffData extends Document{
    ownerId:mongoose.Types.ObjectId;
    name:string;
    city:string;
    area:string;
    address:string;
    turfType:'football'|'cricket'|'swimming'|'basketball'|'badminton'|'tennis'|'volleyball'|'hockey'
    size?:string;
    image:string[];
    availability: {
  [day: string]: { start: string; end: string }[];
};
hourlyRate:number;
status:'active'|'inactive';
isDelete:Boolean;

}


const turfSchema=new Schema<TurffData>(
    {
        ownerId:{
            type:Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        name:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        area:{
            type:String,
            required:true
        },
        address:{
            type:String,
            required:true
        },
        turfType:{
            type:String,
            enum:['football','cricket','swimming','basketball','badminton','tennis','volleyball','hockey'],
            required:true
        },
        size:{
            type:String
        },
        image:{
            type:[String],
            required:true,
        },
        hourlyRate:{
            type:Number,
            required:true,
        },
        status:{
            type:String,
            enum:['active','inactive'],
            default:'active'
        },
        availability:{
            type:String,
            required:true,
        },
     isDelete: {
      type: Boolean,
      default: false
    }

    },
    {
        timestamps:true,
    }

)

const Turff=mongoose.model('Turff',turfSchema)

export default Turff;