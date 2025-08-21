import mongoose, { Schema } from "mongoose";

const auditSchema = new Schema(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tcpaConsent: {
      type: Boolean,
      required: true,
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
      required: true,
    }, // was recency check ok?
    finalDecision: {
      type: String,
      enum: ["proceed", "wait", "block"],
      required: true,
    },
    reason: {
      type: String,
    }, // optional explanation for the decision
    notes: {
      type: String,
    }, // any agent notes
    apiResponse: {
      type: Object,
      default: {},
    }, // store full Jornaya/DNC API response if needed
  },

  {
    timestamps: true,
  }
);

export const Audit = mongoose.model("Audit", auditSchema);
