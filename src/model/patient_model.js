import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    phone: {
      type: String,
      required: true,
    },

    address: {
      type: String,
    },

    medicalHistory: [
      {
        disease: String,
        description: String,
        date: Date,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Patient = mongoose.model("Patient", patientSchema);
