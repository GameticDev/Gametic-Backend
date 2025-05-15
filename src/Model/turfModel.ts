import mongoose, { Document, Schema } from 'mongoose';

export interface TurffData extends Document{
    // ownerId:mongoose.Types.ObjectId;
    name:string;
    city:string;
    area:string;
    address:string;
    turfType:'football'|'cricket'|'multi-sport';
    size?:string;
    image:string[];
//     availability: {
//   [day: string]: { start: string; end: string }[];
// };
hourlyRate:number;
status:'active'|'inactive'

}


const turfSchema=new Schema<TurffData>(
    {
        // ownerId:{
        //     type:Schema.Types.ObjectId,
        //     ref:'User',
        //     required:true
        // },
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
            enum:['football','cricket','multi-sport'],
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
        }


    },
    {
        timestamps:true,
    }

)

const Turff=mongoose.model('Turff',turfSchema)

export default Turff;