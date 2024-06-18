const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {parse} = require('csv-parse');
var fs = require('fs'); 
const path = require('path');

const User = require('../models/User');
const EmailAccountName = require('../models/EmailAccountName');
const CPanelAccount = require('../models/CPanelAccount');
const Domain = require('../models/Domain');
const PreWarmUpDefaultSettings = require('../models/PreWarmUpDefaultSettings');




// START Email Account Names List

exports.dashboardDataGET = async (req, res, next) => {
    
    try {
        
        let totalDomains = await Domain.countDocuments({});
        let completeDomains = await Domain.countDocuments({setupComplete: true});
        let notCompleteDomains = totalDomains - completeDomains;

        let totalCPanelAccounts = await CPanelAccount.countDocuments({});
       
        return res.status(200).send({
            message: "Success",
            success: true,
            data: {
                totalDomains,
                completeDomains,
                notCompleteDomains,
                totalCPanelAccounts
            }
        });
    } catch (error) {
        console.error("Error fetching email account names:", error);
        return res.status(500).send({
            message: "Internal Server Error",
            success: false
        });
    }
};
