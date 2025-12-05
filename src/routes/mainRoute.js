// routes/userRoutes.js

const authRoute = require("./authRoute")
const recoveryRoute = require("./recoveryRoute")
const userRoute = require("./userRoute")
const trustDeviceRoute = require("./trusteDeviceRoute")
const verifyRoute = require("./verifyRoute")
const roleRoute = require("./roleRoute")
const verifyTokenWithRoles = require('../middlewares/verifyTokenWithRoles');

const express = require("express")



const router = express.Router();

router.use('/auth', authRoute); //Seguridad completa
router.use('/recovery',recoveryRoute)
router.use('/user',userRoute)
router.use("/trust-device",trustDeviceRoute)
router.use("/verify",verifyRoute)
router.use("/role",verifyTokenWithRoles(['admin']),roleRoute)

module.exports = router