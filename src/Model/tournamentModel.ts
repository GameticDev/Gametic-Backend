import mongoose, { Schema, Document } from 'mongoose';

export interface ITournament extends Document {
  title: string;
  description: string;
  sport: string;
 
  location:string; 
  dateFrom: Date;
  dateTo: Date;
  createdBy: mongoose.Types.ObjectId;
  maxTeams: number;
  joinedTeams: mongoose.Types.ObjectId[];
  entryFee: number;
  prizePool: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  image: string;
}

const tournamentSchema = new Schema<ITournament>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    sport: { type: String, required: true },
    location: String,
    dateFrom: { type: Date, required: true },
    dateTo: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    maxTeams: { type: Number, required: true },
    joinedTeams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
    entryFee: { type: Number, required: true },
    prizePool: { type: Number, required: true },
    status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' },
    image: { type: String }, // URL of the stadium image
  },
  { timestamps: true }
);
const Tournament=mongoose.model<ITournament>('Tournament',tournamentSchema)
export default Tournament;
// export default mongoose.model<ITournament>('Tournament', tournamentSchema);<