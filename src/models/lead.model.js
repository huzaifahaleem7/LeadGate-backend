import mongoose, { Schema } from "mongoose";

const leadSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      match: [/^\+?[0-9]{10,15}$/, "Invalid phone number format"],
    },
    zipCode: {
      type: String,
      required: true,
    },
    jornayaId: {
      type: String,
      required: true,
      unique: true,
    },

    tcpaConsent: {
      type: Boolean,
      default: false,
    },
    playbackUrl: {
      type: String,
      default: "",
    },
    dncStatus: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Lead = mongoose.model("Lead", leadSchema);
