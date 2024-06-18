const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {parse} = require('csv-parse');

const { Parser } = require('json2csv');
var fs = require('fs'); 

var fsprom = require('fs').promises; 
const path = require('path');

const User = require('../models/User');
const EmailAccountName = require('../models/EmailAccountName');
const CPanelAccount = require('../models/CPanelAccount');
const Contact = require('../models/Contact');
const EmailAccount = require('../models/EmailAccount');
const Domain = require('../models/Domain');
const PreWarmUpDefaultSettings = require('../models/PreWarmUpDefaultSettings');
const WarmUpDefaultSettings = require('../models/WarmUpDefaultSettings');
const Group = require('../models/Group');
const EmailCopy = require('../models/EmailCopy');


// START Contacts

exports.contactsGET = async (req, res, next) => {
    let { limit, skip, sortField, sortOrder, searchTerm } = req.body;

    limit = Number(limit);
    skip = Number(skip);
    sortField = sortField || '_id';
    sortOrder = sortOrder === 'desc' ? -1 : 1;

    try {
        let sortObj = {};
        sortObj[sortField] = sortOrder;

        let query = {};
        if (searchTerm) {
            const regex = new RegExp(searchTerm, 'i'); // 'i' for case-insensitive
            const isObjectId = searchTerm.match(/^[0-9a-fA-F]{24}$/); // Check if searchTerm is a valid ObjectId

            query = {
                $or: [
                    { email: regex },
                    { firstName: regex },
                    { lastName: regex },
                    { source: regex },
                    { status: regex },
                    { statusReason: regex },
                ]
            };

            if (isObjectId) {
                query.$or.push({ '_id': searchTerm });
            }
        }

        let allContacts = await Contact
            .find(query)
            .collation({ locale: 'en', strength: 2 })
            .sort(sortObj)
            .limit(limit)
            .skip(skip);

        let totalContacts = await Contact.countDocuments(query);
        return res.status(200).send({
            message: "Success",
            success: true,
            total: totalContacts,
            data: allContacts
        });
    } catch (error) {
        console.error("Error fetching Contacts:", error);
        return res.status(500).send({
            message: "Internal Server Error",
            success: false
        });
    }
};

exports.contactsADDONE = async (req, res, next) => {
    const { email, firstName, lastName, source, acquiredDate, status, statusReason, lastSentDate, lastOpenDate, lastClickDate } = req.body;

    try {
        // Check for existing combination
        const existingContact = await Contact.findOne({
            email,
        });

        if (existingContact) {
            // If combination exists, do not add a new entry
            return res.status(409).send({ // 409 Conflict
                message: "Duplicate entry: This contact already exists.",
                success: false,
                data: null
            });
        }

        // If combination does not exist, create a new entry
        let newContact = new Contact({
            email,
            firstName,
            lastName,
            source,
            acquiredDate,
            status,
            statusReason,
            lastSentDate,
            lastOpenDate,
            lastClickDate,
            dateAdded: new Date(),
        });
        await newContact.save();

        return res.status(200).send({
            message: "Successfully added Contact",
            success: true,
            data: newContact
        });
    } catch (err) {
        console.error("Error in contactsADDONE:", err);
        return res.status(500).send({ // Internal Server Error
            message: "Error adding Contact",
            success: false,
            data: null
        });
    }
}

exports.contactsADDBULK = async (req, res, next) => {
    try {
        const newpath = path.join(__dirname, '..', 'tmp-files/');
        const file = req.files.file;
        const filename = file.name;

        let newInsertList = [];
        file.mv(`${newpath}${filename}`, (err) => {
            if (err) {
                res.status(500).send({ message: "File upload failed", code: 200 });
            }

            let i = 0;
            let existingKeys = new Set();
            fs.createReadStream(`${newpath}${filename}`)
                .pipe(parse({ delimiter: ',' }))
                .on('data', function (csvrow) {
                    if (i === 0) {
                        // Skip the first row (header)
                        i++;
                        return;
                    }
                
                    let email = csvrow[0];
                    let firstName = csvrow[1];
                    let lastName = csvrow[2];
                    let source = csvrow[3];
                    let acquiredDate = csvrow[4];
                    let status = csvrow[5];
                    let statusReason = csvrow[6];
                    let lastSentDate = csvrow[7];
                    let lastOpenDate = csvrow[8];
                    let lastClickDate = csvrow[9];

                    let uniqueKey = `${email}`;
                
                    if (!existingKeys.has(uniqueKey)) {
                        let newItem = {
                            "email": email,
                            "firstName": firstName,
                            "lastName": lastName,
                            "source": source,
                            "acquiredDate": acquiredDate,
                            "status": status,
                            "statusReason": statusReason,
                            "lastSentDate": lastSentDate,
                            "lastOpenDate": lastOpenDate,
                            "lastClickDate": lastClickDate,
                            "dateAdded": new Date()
                        };
                        newInsertList.push(newItem);
                        existingKeys.add(uniqueKey);
                    }
                    i++;
                })
                .on('end', async function () {
                    const existingItems = await Contact.find({
                        $or: newInsertList.map(item => ({
                            email: item.email,
                        }))
                    });

                    const existingItemsSet = new Set(existingItems.map(item => `${item.email}`));

                    const filteredInsertList = newInsertList.filter(item => !existingItemsSet.has(`${item.email}`));

                    Contact.insertMany(filteredInsertList, { ordered: false }, function (err, docs) {
                        fs.unlink(`${newpath}${filename}`, function (err) {
                            if (err) {
                                console.error("Error occurred while trying to remove file", err);
                            } else {
                                console.info(`File removed`);
                            }

                            return res.status(200).send({
                                message: "Successfully bulk added Contacts",
                                success: true,
                                data: null
                            });
                        });
                    });
                });
        });

    } catch (err) {
        console.log("error happens here", err);
        return res.status(400).send({
            success: false,
            message: "An error occurred!"
        });
    }
}

exports.contactsEDITONE = async (req, res, next) => {
    const {
        contactIdToEdit,
        email,
        firstName,
        lastName,
        source,
        acquiredDate,
        status,
        statusReason,
        lastSentDate,
        lastOpenDate,
        lastClickDate,
    } = req.body;

    try {
        // Check for existing combination excluding the current object
        const existingContact = await Contact.findOne({
            _id: contactIdToEdit, // Exclude the current object
        });

        if (!existingContact) {
            // If combination exists, do not update
            return res.status(409).send({ // 409 Conflict
                message: "This contact does not exist.",
                success: false,
                data: null
            });
        }

        // If combination does not exist, update the entry
        
        existingContact.email = email;
        existingContact.firstName = firstName;
        existingContact.lastName = lastName;
        existingContact.source = source;
        existingContact.acquiredDate = acquiredDate;
        existingContact.status = status;
        existingContact.statusReason = statusReason;
        existingContact.lastSentDate = lastSentDate;
        existingContact.lastOpenDate = lastOpenDate;
        existingContact.lastClickDate = lastClickDate;
        await existingContact.save();

        return res.status(200).send({
            message: "Successfully edited Contact",
            success: true,
            data: existingContact
        });
        

    } catch (err) {
        console.error("Error in contactsEDITONE:", err);
        return res.status(500).send({ // Internal Server Error
            message: "Error editing Contact",
            success: false,
            data: null
        });
    }
};


exports.contactsDELETEONE = async (req, res, next) => {

    const {
        contactIdToDelete
    } = req.body;
    try {

        let contactToDelete = await Contact.findById(contactIdToDelete);

        if (!contactToDelete) {
            return res.status(404).send({
                message: "The Contact was not found!",
                success: false,
                data: null
            });
        }

        await Contact.deleteOne({ _id: contactIdToDelete });

        return res.status(200).send({
            message: "Successfully deleted Contact",
            success: true,
            data: null
        });
    } catch (err) {
        console.error("Error in contactsDELETEONE:", err);
        return res.status(500).send({
            message: "Error deleting Contact",
            success: false,
            data: null
        });
    }
}

exports.contactsDELETEBULK = async (req, res, next) => {

    const {
        idsToDelete
    } = req.body;
    try {
        await Contact.deleteMany({ _id: { $in: idsToDelete } });

        return res.status(200).send({
            message: "Successfully deleted Contacts",
            success: true,
            data: null
        })

    } catch (err) {
        console.error("Error in contactsDELETEBULK:", err);
        return res.status(500).send({
            message: "Error deleting Contacts",
            success: false,
            data: null
        });
    }

}

// END Contacts



// START Groups

exports.groupsGET = async (req, res, next) => {
    try {

        let allGroups = await Group.find({});
        let allDomains = await Domain.find({});
        return res.status(200).send({
            message: "Success",
            success: true,
            data: {
                allGroups,
                allDomains
            }
        });
    } catch (error) {
        console.error("Error fetching Groups:", error);
        return res.status(500).send({
            message: "Internal Server Error",
            success: false
        });
    }
};

exports.groupsADDONE = async (req, res, next) => {
    const { name, description, domainIds} = req.body;

    try {
        // Check for existing combination
        const existingGroup = await Group.findOne({
            name,
        });

        if (existingGroup) {
            // If combination exists, do not add a new entry
            return res.status(409).send({ // 409 Conflict
                message: "Duplicate entry: This name already exists.",
                success: false,
                data: null
            });
        }

        // If combination does not exist, create a new entry
        let newGroup = new Group({
            name,
            description,
            domainIds,
        });
        await newGroup.save();

        return res.status(200).send({
            message: "Successfully added Group.",
            success: true,
            data: newGroup
        });
    } catch (err) {
        console.error("Error in GroupsADDONE:", err);
        return res.status(500).send({ // Internal Server Error
            message: "Error adding group",
            success: false,
            data: null
        });
    }
}

exports.groupsEDITONE = async (req, res, next) => {
    const {
        groupIdToEdit,
        domainIds,
    } = req.body;

    try {
        // Check if the group exists
        const existingGroup = await Group.findById(groupIdToEdit);

        if (!existingGroup) {
            return res.status(404).send({ // 404 Not Found
                message: "Group not found.",
                success: false,
                data: null
            });
        }

        // Update the group properties
        existingGroup.domainIds = domainIds;
        // Save the updated group
        await existingGroup.save();

        await Domain.updateMany({_id: {$in: domainIds}}, {$set: {
            groupId: groupIdToEdit
        }})

        return res.status(200).send({
            message: "Successfully edited Group.",
            success: true,
            data: existingGroup
        });
    } catch (err) {
        console.error("Error editing Group:", err);
        return res.status(500).send({ // Internal Server Error
            message: "Error editing Group",
            success: false,
            data: null
        });
    }
};

exports.groupsDELETEONE = async (req, res, next) => {

    const {
        groupIdToDelete,
    } = req.body;
    try {

        let groupToDelete = await Group.findById(groupIdToDelete);

        if (!groupIdToDelete) {
            return res.status(404).send({
                message: "The Group was not found!",
                success: false,
                data: null
            });
        }

        await Group.deleteOne({ _id: groupIdToDelete });

        return res.status(200).send({
            message: "Successfully deleted Group.",
            success: true,
            data: null
        });
    } catch (err) {
        console.error("Error in groupsDELETEONE:", err);
        return res.status(500).send({
            message: "Error deleting Group.",
            success: false,
            data: null
        });
    }
}


// END Groups

//Start EmailCopy
exports.emailCopyGET = async (req, res, next) => {
    let { limit, skip, sortField, sortOrder, searchTerm } = req.body;

    limit = Number(limit);
    skip = Number(skip);
    sortField = sortField || '_id';
    sortOrder = sortOrder === 'desc' ? -1 : 1;

    try {
        let sortObj = {};
        sortObj[sortField] = sortOrder;

        let query = {};
        if (searchTerm) {
            const regex = new RegExp(searchTerm, 'i'); // 'i' for case-insensitive
            const isObjectId = searchTerm.match(/^[0-9a-fA-F]{24}$/); // Check if searchTerm is a valid ObjectId

            query = {
                $or: [
                    { name: regex },
                    { fullHTML: regex },
                ]
            };

            if (isObjectId) {
                query.$or.push({ '_id': searchTerm });
            }
        }

        let allEmailCopies = await EmailCopy
            .find(query)
            .collation({ locale: 'en', strength: 2 })
            .sort(sortObj)
            .limit(limit)
            .skip(skip);

        let totalEmailCopies = await EmailCopy.countDocuments(query);
        return res.status(200).send({
            message: "Success",
            success: true,
            total: totalEmailCopies,
            data: allEmailCopies
        });
    } catch (error) {
        console.error("Error fetching Email Copies:", error);
        return res.status(500).send({
            message: "Internal Server Error",
            success: false
        });
    }
};

exports.emailCopyCREATEONE = async (req, res, next) => {
    const { name, lastSentDate, fullHTML } = req.body;

    try {
        // Check for existing combination
        const existingEmailCopy = await EmailCopy.findOne({
            name,
            fullHTML,
        });

        if (existingEmailCopy) {
            // If combination exists, do not add a new entry
            return res.status(409).send({ // 409 Conflict
                message: "Duplicate entry: This email copy already exists.",
                success: false,
                data: null
            });
        }

        // If combination does not exist, create a new entry
        let newEmailCopy = new EmailCopy({
            name,
            lastSentDate,
            fullHTML,
            dateAdded: new Date(),
        });
        await newEmailCopy.save();

        return res.status(200).send({
            message: "Successfully created Email Copy",
            success: true,
            data: newEmailCopy,
        });
    } catch (err) {
        console.error("Error in emailCopyGET:", err);
        return res.status(500).send({ // Internal Server Error
            message: "Error adding Contact",
            success: false,
            data: null
        });
    }
}

exports.emailCopyEDITONE = async (req, res, next) => {
    const {
        emailCopyIdToEdit,
        name,
        lastSentDate,
        fullHTML,
    } = req.body;

    try {
        // Check for existing combination excluding the current object
        const existingEmailCopy = await EmailCopy.findOne({
            _id: emailCopyIdToEdit, // Exclude the current object
        });

        if (!existingEmailCopy) {
            // If combination exists, do not update
            return res.status(409).send({ // 409 Conflict
                message: "This email copy does not exist.",
                success: false,
                data: null
            });
        }

        // If combination does not exist, update the entry
        
        existingEmailCopy.name = name;
        existingEmailCopy.lastSentDate = lastSentDate;
        existingEmailCopy.fullHTML = fullHTML;
        await existingEmailCopy.save();

        return res.status(200).send({
            message: "Successfully edited Email Copy",
            success: true,
            data: existingEmailCopy,
        });
        

    } catch (err) {
        console.error("Error in emailCopyEDITONE:", err);
        return res.status(500).send({ // Internal Server Error
            message: "Error editing Email Copy",
            success: false,
            data: null
        });
    }
};

exports.emailCopyDELETEONE = async (req, res, next) => {

    const {
        emailCopyIdToDelete
    } = req.body;
    try {

        let emailCopyToDelete = await EmailCopy.findById(emailCopyIdToDelete);

        if (!emailCopyToDelete) {
            return res.status(404).send({
                message: "The Email Copy was not found!",
                success: false,
                data: null
            });
        }

        await EmailCopy.deleteOne({ _id: emailCopyIdToDelete });

        return res.status(200).send({
            message: "Successfully deleted Email Copy",
            success: true,
            data: null
        });
    } catch (err) {
        console.error("Error in emailCopyDELETEONE:", err);
        return res.status(500).send({
            message: "Error deleting Email Copy",
            success: false,
            data: null
        });
    }
}

exports.emailCopyDELETEBULK = async (req, res, next) => {

    const {
        emailCopiesToDelete
    } = req.body;
    try {
        await EmailCopy.deleteMany({ _id: { $in: emailCopiesToDelete } });

        return res.status(200).send({
            message: "Successfully deleted Email Copy",
            success: true,
            data: null
        })

    } catch (err) {
        console.error("Error in emailCopyDELETEBULK:", err);
        return res.status(500).send({
            message: "Error deleting Email Copies",
            success: false,
            data: null
        });
    }

}