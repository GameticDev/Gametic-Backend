import mongoose, { Schema, Document } from "mongoose";

export interface ITournament extends Document {
  title: string;
  description: string;
  sport: string;
  turf: mongoose.Types.ObjectId;
  dateFrom: Date;
  dateTo: Date;
  organizer: mongoose.Types.ObjectId;
  maxTeams: number;
  maxPlayers: number;
  joinedTeams: mongoose.Types.ObjectId[];
  entryFee: number;
  prizePool: number;
  status: "upcoming" | "ongoing" | "completed";
  image: string;
}

const tournamentSchema = new Schema<ITournament>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    sport: { type: String, required: true },
    turf: { type: Schema.Types.ObjectId, required: true, ref: "Turf" },
    dateFrom: { type: Date, required: true },
    dateTo: { type: Date, required: true },
    organizer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    maxTeams: { type: Number, required: true },
    maxPlayers: { type: Number, required: true },
    joinedTeams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
    entryFee: { type: Number, required: true },
    prizePool: { type: Number, required: true },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },
    image: { type: String },
  },
  { timestamps: true }
);
const Tournament = mongoose.model<ITournament>("Tournament", tournamentSchema);
export default Tournament;
// export default mongoose.model<ITournament>('Tournament', tournamentSchema);<
