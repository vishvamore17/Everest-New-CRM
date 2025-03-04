const express=require("express")

const router = express.Router();



// const userRouts=require("./users.routs")
const invoiceRouts=require("./invoice.routs")
const leadRouts=require("./lead.routs")
const taskRouts=require("./task.routs")
const scheduledRouts=require("./scheduled.routs")
const complaintRouts=require("./complaint.routes")
const contactRouts=require("./contactrouts.routes")
const calandarRouts=require("./calender.routes")
const notificationRoutes = require("./notification.routes")
const usersdRoutes = require("./users.routs")
const ownerRoutes=require("./Owner.routes")
const profileRoutes=require('./profile.routs')
const globalRoutes =  require('./search.routes')
// router.use("/user",userRouts)
router.use("/invoice",invoiceRouts)
router.use("/lead",leadRouts)   
router.use("/task",taskRouts)
router.use("/scheduledEvents",scheduledRouts)
router.use("/complaint",complaintRouts)
router.use("/contact",contactRouts)
router.use("/calender",calandarRouts)
router.use("/notification", notificationRoutes);
router.use("/user", usersdRoutes);
router.use("/owner",ownerRoutes)
router.use('/profile',profileRoutes)
router.use('/search',globalRoutes)
module.exports=router