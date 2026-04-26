import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },

    specialization: {
      type: String,
      required: true,
    },

    experience: {
      type: Number, // in years
      required: true,
    },

    fee: {
      type: Number,
      required: true,
    },

    hospital: {
      type: String,
    },

    availability: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],

    rating: {
      type: Number,
      default: 0,
    },
    
  },
  { timestamps: true },
);

export const Doctor = mongoose.model("Doctor", doctorSchema);
