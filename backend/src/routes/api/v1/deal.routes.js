const express = require("express");
const DealController = require("../../../controller/deal.controller");
const router = express.Router();

router.post("/createLead", DealController.createDeal);         
router.get("/getAllLeads", DealController.getAllLeads);        
router.get("/getLead/:id", DealController.getLeadById);         
router.put("/updateLead/:id", DealController.updateLead);    
router.delete("/deleteLead/:id", DealController.deleteLead);   
router.get('/searchByMonth', DealController.searchByMonth);
router.get('/searchByYear', DealController.searchByYear);
router.get('/searchByDate', DealController.searchByDate);
router.get('/new', DealController.getNewLeads);
router.get('/discussion',DealController.getDiscussionLeads);
router.get('/demo', DealController.getDemoLeads);
router.get('/proposal', DealController.getProposalLeads);
router.get('/decided', DealController.getDecidedLeads);
router.post('/updateLeadStatus',DealController.updateStatus);

module.exports = router;
