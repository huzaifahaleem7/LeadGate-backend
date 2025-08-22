import { Router } from "express";
import {
    addLead,
    getLeadById,
    getAllLeads
} from "../controllers/lead.controller.js"
import verifyJwt from "../middlewares/auth.middleware.js";

const router = Router()

//addLead
router.route("/addlead").post(verifyJwt, addLead)

//getLeadById
router.route("/leadbyid/:id").get(verifyJwt, getLeadById)

//getAllLeads
router.route("/leads").get(verifyJwt, getAllLeads)

export default router