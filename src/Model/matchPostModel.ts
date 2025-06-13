import mongoose, { Document, Schema } from "mongoose";


export interface MatchPost extends Document{
    userId:mongoose.Types.ObjectId;
    title:string;
    sports:'football'|'cricket'|'basketball'|'badminton'|'tennnis'|'volleyball'|'hockey';
 maxPlayers: number;
  joinedPlayers: mongoose.Types.ObjectId[]; // Users who joined
  turfId: mongoose.Types.ObjectId; // ref to Turf
  date: Date;
  startTime: string;
  endTime: string;
  paymentPerPerson: number;
  location: string;
  status: 'open' | 'full' | 'completed' | 'cancelled';
}
const matchPostSchema=new Schema<MatchPost>({
   userId:{
    type:Schema.Types.ObjectId,
    ref:'User',
    required:true
   },
   title:{
    type:String,
    required:true
   },
   sports:{
    type:String,
    enum:['football', 'cricket', 'swimming', 'basketball', 'badminton', 'tennis', 'volleyball', 'hockey'],
    required:true
   },
   maxPlayers:{
    type:Number,
    required:true
   },
   joinedPlayers:[{
    type:mongoose.Types.ObjectId,
    ref:'User',
    default:[]
   }],
   turfId:{
    type:Schema.Types.ObjectId,
    ref:'Turf',
    required:true
   },
   date:{
    type:Date,
    required:true
   },
   startTime:{
    type:String,
    required:true
   },
   endTime:{
    type:String,
    required:true
   },
   paymentPerPerson:{
    type:Number,
    required:true
   },
   status:{
    type:String,
    enum:['open','full','completed','cancelled'],
    default:'open'
   }},{
    timestamps:true
   })

   const Match=mongoose.model<MatchPost>('Match',matchPostSchema)

   export default Match;

