import {Router} from "express"
import { parseMessage } from "../controllers/parseMessage.controller.js"
import verifyJwt from "../middlewares/auth.middleware.js"

const router = Router()

//parseMessage
router.route("/parseMessage").post(verifyJwt,parseMessage)


export default router