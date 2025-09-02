import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Lead } from "../models/lead.model.js";
import { Audit } from "../models/audit.model.js";
import runDNCCheck from "../services/dncService.service.js";
import fetchJornayaData from "../services/jornayaServices.service.js";
import runNumberCheck from "../services/idServices.service.js";

// addLead
const addLead = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(401, "Unauthorized access");

  const { phone, jornayaId } = req.body;

  // Validation: only phone & jornayaId required from user
  if (!phone || !jornayaId) {
    throw new ApiError(400, "Phone and Jornaya ID are required");
  }

  // Fetch details from Mars API
  const marsRecord = await runNumberCheck(phone);

  if (!marsRecord) {
    throw new ApiError(404, "No lead details found for this phone number");
  }
  console.log(marsRecord);
  // Check JornayaId match
  // if (marsRecord.lead_id !== jornayaId) {
  //   throw new ApiError(400, "Jornaya ID does not match Mars record");
  // }

  // Extract details from Mars response
  const firstName = marsRecord.first_name || "Unknown";
  const lastName = marsRecord.last_name || "";
  const zipCode = marsRecord.zip_code || "";

  // Zip code validation (USA format)
  const usZipRegex = /^\d{5}(-\d{4})?$/;
  if (!usZipRegex.test(zipCode)) {
    throw new ApiError(400, "Invalid or non-US ZIP code");
  }
  console.log(zipCode);

  // Duplicate check
  const existingLead = await Lead.findOne({ $or: [{ phone }, { jornayaId }] });
  if (existingLead) throw new ApiError(400, "Lead already exists");

  // DNC Check
  let dncResult;
  try {
    dncResult = await runDNCCheck(marsRecord.lead_id, phone);
    if (dncResult.isDNC) {
      await Audit.create({
        leadId: null,
        agent: user._id,
        dncStatus: true,
        reason: "Customer is DNC.",
      });
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Customer is DNC."));
    }
  } catch (error) {
    console.error("DNC check failed:", error.message);
    throw new ApiError(500, "Failed to verify DNC status");
  }

  // Jornaya Check (already matched Jornaya ID, now fetch full details)
  try {
    const jornayaData = await fetchJornayaData(jornayaId);
    const tcpConsentBool = jornayaData.tcpConsent;
    const playbackUrl = jornayaData.playbackAvailable
      ? jornayaData.raw.Playback
      : "";

    let errors = [];
    if (!playbackUrl) errors.push("Playback missing");
    if (!tcpConsentBool) errors.push("TCP Consent missing");

    if (errors.length > 0) {
      const jornayaAudit = await Audit.create({
        leadId: null,
        agent: user._id,
        dncStatus: false,
        playbackUrl,
        tcpConsent: tcpConsentBool,
        finalDecision: "wait",
        reason: errors.join(" | "),
      });
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            { jornayaAudit },
            `Jornaya check failed: ${errors.join(", ")}`
          )
        );
    }

    // ✅ Lead Creation using Mars + Jornaya data
    const lead = await Lead.create({
      firstName,
      lastName,
      phone,
      zipCode,
      jornayaId,
      agent: user._id,
      dncStatus: dncResult.dncCode || null,
      tcpConsent: tcpConsentBool,
      playbackUrl,
    });

    // Audit Log
    await Audit.create({
      leadId: lead._id,
      agent: user._id,
      tcpConsent: tcpConsentBool,
      playbackUrl,
      dncStatus: dncResult.isDNC || false,
      recencyCheckPassed: true,
      finalDecision: "proceed",
      reason: "Lead created successfully",
    });

    return res
      .status(201)
      .json(new ApiResponse(201, { lead }, "Lead Created Successfully"));
  } catch (error) {
    console.error("Jornaya check failed:", error.message);
    throw new ApiError(500, "Failed to verify Jornaya consent");
  }
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

//addlead previous function
// const addLead = asyncHandler(async (req, res) => {
//   const user = req.user;
//   console.log("received payload", req.body);

//   if (!user) {
//     throw new ApiError(401, "Unauthorized access");
//   }

//   const { firstName, lastName, phone, zipCode, jornayaId } = req.body;

//   // Validation
//   if (
//     [firstName, lastName, phone, zipCode, jornayaId].some(
//       (field) => !field || field.trim() === ""
//     )
//   ) {
//     throw new ApiError(400, "All fields are required");
//   }

//   // Duplicate check
//   const existingLead = await Lead.findOne({
//     $or: [{ phone }, { jornayaId }],
//   });
//   if (existingLead) {
//     throw new ApiError(400, "Lead already exists");
//   }

//   // DNC Check
//   let dncResult;
//   try {
//     dncResult = await runDNCCheck(null, phone);

//     if (dncResult.isDNC) {
//       const dncAudit = await Audit.create({
//         leadId: null,
//         agent: user._id,
//         dncStatus: true,
//         reason: "Customer is DNC.",
//       });

//       if (!dncAudit) {
//         throw new ApiError(
//           500,
//           "Something went wrong while creating DNC Audit"
//         );
//       }

//       return res
//         .status(400)
//         .json(new ApiResponse(400, { dncAudit }, "Customer is DNC."));
//     }
//   } catch (error) {
//     console.error("DNC check failed:", error.message);
//     throw new ApiError(500, "Failed to verify DNC status");
//   }

//   // Jornaya Check
//   try {
//     const jornayaData = await fetchJornayaData(jornayaId);

//     const tcpConsentBool = jornayaData.tcpConsent; // ✅ from helper
//     const playbackUrl = jornayaData.playbackAvailable
//       ? jornayaData.raw.Playback
//       : "";

//     let errors = [];
//     let auditData = {
//       leadId: null,
//       agent: user._id,
//       dncStatus: false,
//       playbackUrl,
//       tcpConsent: tcpConsentBool,
//       finalDecision: "wait",
//     };

//     // Playback check
//     if (!playbackUrl) {
//       errors.push("Playback missing");
//     }

//     // TCP Consent check
//     if (!tcpConsentBool) {
//       errors.push("TCP Consent missing");
//     }

//     // If any error → audit + response
//     if (errors.length > 0) {
//       const jornayaAudit = await Audit.create({
//         ...auditData,
//         reason: errors.join(" | "),
//       });

//       return res
//         .status(400)
//         .json(
//           new ApiResponse(
//             400,
//             { jornayaAudit },
//             `Jornaya check failed: ${errors.join(", ")}`
//           )
//         );
//     }

//     // ✅ Lead Creation
//     const lead = await Lead.create({
//       firstName,
//       lastName,
//       phone,
//       zipCode,
//       jornayaId,
//       agent: user._id,
//       dncStatus: dncResult.dncCode || null,
//       tcpConsent: tcpConsentBool,
//       playbackUrl,
//     });

//     if (!lead) {
//       throw new ApiError(500, "Something went wrong while creating lead");
//     }

//     // Audit Log
//     await Audit.create({
//       leadId: lead._id,
//       agent: user._id,
//       tcpConsent: tcpConsentBool,
//       playbackUrl,
//       dncStatus: dncResult.isDNC || false,
//       recencyCheckPassed: true,
//       finalDecision: "proceed",
//       reason: "Lead created successfully",
//     });

//     console.log(lead);
//     return res
//       .status(201)
//       .json(new ApiResponse(201, { lead }, "Lead Created Successfully"));
//   } catch (error) {
//     console.error("Jornaya check failed:", error.message);
//     throw new ApiError(500, "Failed to verify Jornaya consent");
//   }
// });
