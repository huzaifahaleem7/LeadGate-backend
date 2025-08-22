import mongoose, { Schema } from "mongoose";

const auditSchema = new Schema(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: false,
    },
    agent: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tcpaConsent: {
      type: Boolean,
      // required: true,
    },
    playbackUrl: {
      type: String,
      default: "",
    },
    dncStatus: {
      type: Boolean,
      required: true,
    },
    recencyCheckPassed: {
      type: Boolean,
      // required: true,
    }, // was recency check ok?
    finalDecision: {
      type: String,
      enum: ["proceed", "wait", "block"],
      default: "wait"
      // required: true,
    },
    reason: {
      type: String,
    }, // optional explanation for the decision
    notes: {
      type: String,
    }, // any agent notes
  },
  {
    timestamps: true,
  }
);

export const Audit = mongoose.model("Audit", auditSchema);
