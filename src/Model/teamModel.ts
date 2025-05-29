import mongoose, { Document, Schema } from "mongoose";


export interface ITeam extends Document{
    name:string;
    sport: 'football' | 'cricket' | 'multi-sport' | 'swimming' | 'basketball' | 'badminton' | 'tennis' | 'volleyball' | 'hockey';
    teamManager:mongoose.Types.ObjectId;
    members:mongoose.Types.ObjectId[];
    createdAt:Date;
}

const teamSchema:Schema<ITeam>=new Schema(
    {
        name:{
            type:String,
            required:true
        },
        sport:{
            type:String,
            enum: ['football', 'cricket', 'swimming', 'basketball', 'badminton', 'tennis', 'volleyball', 'hockey', 'multi-sport'],
            required:true
        },
        teamManager:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true,
        },
        members:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }],
        createdAt:{
            type:Date,
            default:Date.now
        }

    },
    {timestamps:true}
)

const Team=mongoose.model<ITeam>('Team',teamSchema)

export default Team;