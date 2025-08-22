import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Lead } from "../models/lead.model.js";
import { Audit } from "../models/audit.model.js";
import runDNCCheck from "../services/dncService.service.js";
import fetchJornayaData from "../services/jornayaServices.service.js";

//addLead
const addLead = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Unauthorized access");
  }

  const { firstName, lastName, phone, zipCode, jornayaId } = req.body;

  // Validation
  if (
    [firstName, lastName, phone, zipCode, jornayaId].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Duplicate check
  const existingLead = await Lead.findOne({
    $or: [{ phone }, { jornayaId }],
  });
  if (existingLead) {
    throw new ApiError(400, "Lead already exists");
  }

  // DNC Check
  let dncResult;
  try {
    dncResult = await runDNCCheck(null, phone);

    if (dncResult.isDNC) {
      const dncAudit = await Audit.create({
        leadId: null,
        agent: user._id,
        dncStatus: true,
        reason: "Customer is DNC.",
      });

      if (!dncAudit) {
        throw new ApiError(
          500,
          "Something went wrong while creating DNC Audit"
        );
      }

      return res
        .status(400)
        .json(new ApiResponse(400, { dncAudit }, "Customer is DNC."));
    }
  } catch (error) {
    console.error("DNC check failed:", error.message);
    throw new ApiError(500, "Failed to verify DNC status");
  }

  // Jornaya Check
  let jornayataData;
  try {
    jornayataData = await fetchJornayaData(jornayaId);

    // Playback check
    if (!jornayataData.playbackAvailable) {
      const jornayaPlayBack = await Audit.create({
        leadId: null,
        agent: user._id,
        dncStatus: false,
        playbackUrl: "",
        finalDecision: "wait",
        reason: "Playback missing. Agent needs to re-verify.",
      });

      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            { jornayaPlayBack },
            "Playback missing, sent back to agent."
          )
        );
    }

    // TCP check
    if (!jornayataData.tcpConsent) {
      const jornayaTcpConsent = await Audit.create({
        leadId: null,
        agent: user._id,
        dncStatus: false,
        tcpConsent: false,
        finalDecision: "wait",
        reason: "TCP Consent missing. Agent needs to re-verify.",
      });

      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            { jornayaTcpConsent },
            "TCP Consent missing. Agent needs to re-verify."
          )
        );
    }
  } catch (error) {
    console.error("Jornaya check failed:", error.message);
    throw new ApiError(500, "Failed to verify Jornaya consent");
  }

  // Lead Creation
  const lead = await Lead.create({
    firstName,
    lastName,
    phone,
    zipCode,
    jornayaId,
    agent: user._id,
    dncStatus: dncResult.dncCode || null,
    tcpConsent: jornayataData.tcpConsent,
    playbackUrl: jornayataData.playbackUrl || "",
  });

  if (!lead) {
    throw new ApiError(500, "Something went wrong while creating lead");
  }

  // Audit Log
  await Audit.create({
    leadId: lead._id,
    agent: user._id,
    tcpConsent: jornayataData.tcpConsent,
    playbackUrl: jornayataData.playbackUrl || "",
    dncStatus: dncResult.isDNC || false,
    recencyCheckPassed: true,
    finalDecision: "proceed",
    reason: "Lead created successfully",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { lead }, "Lead Created Successfully"));
});

//getLeadById
const getLeadById = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Unauthorized access");
  }
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Id is required");
  }
  const leadById = await Lead.findById(id).populate("agent", "fullName");
  if (!leadById) {
    throw new ApiError(404, "Lead not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { leadById }, "Lead fetched successfully"));
});

//getallLeads
const getAllLeads = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Unauthorized access");
  }
  const leads = await Lead.find()
    .populate("agent", "fullName")
    .sort({ createdAt: -1 });
  if (!leads || leads.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, { leads: [] }, "No leads available"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { leads }, "All leads fetched successfully"));
});

export { addLead, getLeadById, getAllLeads };
