import Router from 'express'
import {
    signup,
    login,
    logout,
    refreshAccessToken,
    getUserProfile
} from '../controllers/user.controller.js'
import verifyJwt from '../middlewares/auth.middleware.js'

const router = Router()

//signup
router.route('/signup').post(signup)

//login
router.route("/login").post(login)

//logout
router.route("/logout").post (verifyJwt, logout)

//refreshAccessToken
router.route("/refreshAccessToken").post(refreshAccessToken)

//getUserProfile
router.route("/me").get(verifyJwt, getUserProfile);


export default router