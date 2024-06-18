const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

const { 
    // Email Account Names List
    emailAccountNamesListGET,
    emailAccountNamesListADDONE,
    emailAccountNamesListADDBULK,
    emailAccountNamesListEDITONE,
    emailAccountNamesListDELETEONE,
    emailAccountNamesListDELETEBULK,

    // cPanel Accounts
    cPanelAccountsGET,
    cPanelAccountsADDONE,
    cPanelAccountsADDBULK,
    cPanelAccountsEDITONE,
    cPanelAccountsDELETEONE,
    cPanelAccountsDELETEBULK,

    // Default Settings
    defaultSettingsGET,
    defaultSettingsEDIT,

    // Domains
    domainsGET,
    domainsADDONE,
    domainsADDBULK,
    domainsDELETEONE,
    domainsDELETEBULK,
    domainsCONTINUENEXTSTEP,
    domainsUPLOADDKIMRECORDS,
    domainsUPLOADSENDINGIPADDRESSES,
    domainsMARKMTACONNECTED,
    domainsMARKINSTANTLYCONNECTED,
    domainsGENERATEINSTANTLYUPLOADFILE,
    domainsUPLOADMTAAPIKEYS,

    // Email Accounts
    emailAccountsGET,
    emailAccountsDELETEONE,
    emailAccountsDELETEBULK,
    domainsDOWNLOADALLDATA,
    emailAccountsDOWNLOADALLDATA,

} = require('../controllers/preWarmupController');

// Email Account Names List
router
    .route('/email-account-names-list/get')
    .post(authenticateToken, emailAccountNamesListGET);

router
    .route('/email-account-names-list/add-one')
    .post(authenticateToken, emailAccountNamesListADDONE);

    router
    .route('/email-account-names-list/add-bulk')
    .post(authenticateToken, emailAccountNamesListADDBULK);

router
    .route('/email-account-names-list/edit-one')
    .post(authenticateToken, emailAccountNamesListEDITONE);

router
    .route('/email-account-names-list/delete-one')
    .post(authenticateToken, emailAccountNamesListDELETEONE);

router
    .route('/email-account-names-list/delete-bulk')
    .post(authenticateToken, emailAccountNamesListDELETEBULK);


// cPanel Accounts
router
    .route('/c-panel-accounts/get')
    .post(authenticateToken, cPanelAccountsGET);
    
router
    .route('/c-panel-accounts/add-one')
    .post(authenticateToken, cPanelAccountsADDONE);
    
router
    .route('/c-panel-accounts/add-bulk')
    .post(authenticateToken, cPanelAccountsADDBULK);
    
router
    .route('/c-panel-accounts/edit-one')
    .post(authenticateToken, cPanelAccountsEDITONE);
    
router
    .route('/c-panel-accounts/delete-one')
    .post(authenticateToken, cPanelAccountsDELETEONE);
    
router
    .route('/c-panel-accounts/delete-bulk')
    .post(authenticateToken, cPanelAccountsDELETEBULK);
    
    
// Default Settings
router
    .route('/default-settings/get')
    .post(authenticateToken, defaultSettingsGET);
    
router
    .route('/default-settings/edit')
    .post(authenticateToken, defaultSettingsEDIT);
        


// Domains
router
    .route('/domains/get')
    .post(authenticateToken, domainsGET);
    
router
    .route('/domains/add-one')
    .post(authenticateToken, domainsADDONE);
    
router
    .route('/domains/add-bulk')
    .post(authenticateToken, domainsADDBULK);
    
router
    .route('/domains/continue-next-step')
    .post(authenticateToken, domainsCONTINUENEXTSTEP);
router
    .route('/domains/upload-dkim-records')
    .post(authenticateToken, domainsUPLOADDKIMRECORDS);
router
    .route('/domains/upload-sending-ip-addresses')
    .post(authenticateToken, domainsUPLOADSENDINGIPADDRESSES);
router
    .route('/domains/upload-mta-api-keys')
    .post(authenticateToken, domainsUPLOADMTAAPIKEYS);

router
    .route('/domains/mark-mta-connected')
    .post(authenticateToken, domainsMARKMTACONNECTED);
    
router
    .route('/domains/mark-instantly-connected')
    .post(authenticateToken, domainsMARKINSTANTLYCONNECTED);

router
    .route('/domains/delete-one')
    .post(authenticateToken, domainsDELETEONE);
    
router
    .route('/domains/delete-bulk')
    .post(authenticateToken, domainsDELETEBULK);

router
    .route('/domains/generate-instantly-upload-file')
    .post(authenticateToken, domainsGENERATEINSTANTLYUPLOADFILE);
router
    .route('/domains/download-all-data')
    .post(authenticateToken, domainsDOWNLOADALLDATA);


// Email Accounts

router
    .route('/email-accounts/get')
    .post(authenticateToken, emailAccountsGET);
       
router
    .route('/email-accounts/delete-one')
    .post(authenticateToken, emailAccountsDELETEONE);
    
router
    .route('/email-accounts/delete-bulk')
    .post(authenticateToken, emailAccountsDELETEBULK);

router
    .route('/email-accounts/download-all-data')
    .post(authenticateToken, emailAccountsDOWNLOADALLDATA);



module.exports = router;