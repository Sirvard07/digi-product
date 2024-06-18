const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

const { 
    // Contacts
    contactsGET,
    contactsADDONE,
    contactsADDBULK,
    contactsEDITONE,
    contactsDELETEONE,
    contactsDELETEBULK,

    // Groups
    groupsGET,
    groupsADDONE,
    groupsEDITONE,
    groupsDELETEONE,
    groupsDELETEBULK,

    // Email Copy
    emailCopyGET,
    emailCopyCREATEONE,
    emailCopyEDITONE,
    emailCopyDELETEONE,
    emailCopyDELETEBULK,

} = require('../controllers/productionController');

// Contacts
router
    .route('/contacts/get')
    .post(authenticateToken, contactsGET);

router
    .route('/contacts/add-one')
    .post(authenticateToken, contactsADDONE);

router
    .route('/contacts/add-bulk')
    .post(authenticateToken, contactsADDBULK);

router
    .route('/contacts/edit-one')
    .post(authenticateToken, contactsEDITONE);

router
    .route('/contacts/delete-one')
    .post(authenticateToken, contactsDELETEONE);
        
router
    .route('/contacts/delete-bulk')
    .post(authenticateToken, contactsDELETEBULK);

    
// Groups
router
    .route('/groups/get')
    .post(authenticateToken, groupsGET);

router
    .route('/groups/add-one')
    .post(authenticateToken, groupsADDONE);

router
    .route('/groups/edit-one')
    .post(authenticateToken, groupsEDITONE);

router
    .route('/groups/delete-one')
    .post(authenticateToken, groupsDELETEONE);


// Email Copy
router
    .route('/email-copy/get')
    .post(authenticateToken, emailCopyGET);

router
    .route('/email-copy/create-one')
    .post(authenticateToken, emailCopyCREATEONE);

router
    .route('/email-copy/edit-one')
    .post(authenticateToken, emailCopyEDITONE);

router
    .route('/email-copy/delete-one')
    .post(authenticateToken, emailCopyDELETEONE);

router
    .route('/email-copy/delete-bulk')
    .post(authenticateToken, emailCopyDELETEBULK);

module.exports = router;