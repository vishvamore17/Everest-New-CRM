const express = require("express");
const LeadController = require("../../../controller/lead.controller");
const router = express.Router();

router.post("/createLead", LeadController.createLead);         
router.get("/getAllLeads", LeadController.getAllLeads);        
router.get("/getLead/:id", LeadController.getLeadById);         
router.put("/updateLead/:id", LeadController.updateLead);    
router.delete("/deleteLead/:id", LeadController.deleteLead);   
router.get('/searchByMonth', LeadController.searchByMonth);
router.get('/searchByYear', LeadController.searchByYear);
router.get('/searchByDate', LeadController.searchByDate);
router.get('/new', LeadController.getNewLeads);
router.get('/discussion',LeadController.getDiscussionLeads);
router.get('/demo', LeadController.getDemoLeads);
router.get('/proposal', LeadController.getProposalLeads);
router.get('/decided', LeadController.getDecidedLeads);
router.post('/updateLeadStatus',LeadController.updateStatus);
router.get('/getLeadsByStatus', LeadController.getLeadsByStatus);

            


module.exports = router;
