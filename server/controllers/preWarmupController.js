const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { parse } = require("csv-parse");

const { Parser } = require("json2csv");
var fs = require("fs");

var fsprom = require("fs").promises;
const path = require("path");

const User = require("../models/User");
const EmailAccountName = require("../models/EmailAccountName");
const CPanelAccount = require("../models/CPanelAccount");
const EmailAccount = require("../models/EmailAccount");
const Domain = require("../models/Domain");
const PreWarmUpDefaultSettings = require("../models/PreWarmUpDefaultSettings");

const {
  domainsGetNextStep,
  namecheapUpdateDNSNameserversForDomain,
  // namecheapSetBasicDNSForDomain,
  // namecheapUpdateDNSRecordsForDomain,
  cPanelAddDomain,
  cPanelFileUpload,
  cPanelFileExtract,
  cPanelFileDelete,
  cPanelCreateEmailAccount,
  cPanelDNSFetchZoneRecords,

  constructEmail,
  cPanelDeleteEmailAccount,
  sortDNSRecordsDesc,
  cPanelDNSDeleteZoneRecord,
  cPanelDNSDeleteMXRecord,
  cPanelDNSAddMXRecord,
  cPanelDNSAddZoneRecord,
  domainsIsComplete,
  cPanelDeleteDomain,
  cPanelDeleteSubDomain,
  cPanelUnparkDomain,
  cPanelDeleteDomainRedirect,
  namecheapCheckDomainAvailability,
  parseNamecheapXMLResponse,
  namecheapPurchaseDomain,
} = require("../utilities/functions");
const WarmUpDefaultSettings = require("../models/WarmUpDefaultSettings");

// START Email Account Names List

exports.emailAccountNamesListGET = async (req, res, next) => {
  let { limit, skip, sortField, sortOrder, searchTerm } = req.body;

  limit = Number(limit);
  skip = Number(skip);
  sortField = sortField || "_id";
  sortOrder = sortOrder === "desc" ? -1 : 1;

  try {
    let sortObj = {};
    sortObj[sortField] = sortOrder;

    let query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // 'i' for case-insensitive
      const isObjectId = searchTerm.match(/^[0-9a-fA-F]{24}$/); // Check if searchTerm is a valid ObjectId

      query = {
        $or: [{ firstName: regex }, { lastName: regex }],
      };

      if (isObjectId) {
        query.$or.push({ _id: searchTerm });
      }
    }

    let allEmailAccountNames = await EmailAccountName.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort(sortObj)
      .limit(limit)
      .skip(skip);

    let totalEmailAccountNames = await EmailAccountName.countDocuments(query);
    return res.status(200).send({
      message: "Success",
      success: true,
      total: totalEmailAccountNames,
      data: allEmailAccountNames,
    });
  } catch (error) {
    console.error("Error fetching email account names:", error);
    return res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

exports.emailAccountNamesListADDONE = async (req, res, next) => {
  const { firstName, lastName = "", isRequired = false } = req.body;

  try {
    // Check for existing combination
    const existingEmailAccountName = await EmailAccountName.findOne({
      firstName,
      lastName,
      isRequired,
    });

    if (existingEmailAccountName) {
      // If combination exists, do not add a new entry
      return res.status(409).send({
        // 409 Conflict
        message:
          "Duplicate entry: This combination of first name, last name, and isRequired already exists.",
        success: false,
        data: null,
      });
    }

    // If combination does not exist, create a new entry
    let newEmailAccountName = new EmailAccountName({
      firstName,
      lastName,
      isRequired,
    });
    await newEmailAccountName.save();

    return res.status(200).send({
      message: "Successfully added email account name",
      success: true,
      data: newEmailAccountName,
    });
  } catch (err) {
    console.error("Error in emailAccountNamesListADDONE:", err);
    return res.status(500).send({
      // Internal Server Error
      message: "Error adding email account name",
      success: false,
      data: null,
    });
  }
};

exports.emailAccountNamesListADDBULK = async (req, res, next) => {
  try {
    const newpath = path.join(__dirname, "..", "tmp-files/");
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
        .pipe(parse({ delimiter: "," }))
        .on("data", function (csvrow) {
          if (i === 0) {
            // Skip the first row (header)
            i++;
            return;
          }

          let firstName = csvrow[0];
          let lastName = csvrow[1] || "";
          let isRequired = csvrow[2]
            ? csvrow[2].toLowerCase() === "true"
            : false;

          let uniqueKey = `${firstName}-${lastName}-${isRequired}`;

          if (!existingKeys.has(uniqueKey)) {
            let newItem = {
              firstName: firstName,
              lastName: lastName,
              isRequired: isRequired,
            };
            newInsertList.push(newItem);
            existingKeys.add(uniqueKey);
          }
          i++;
        })
        .on("end", async function () {
          const existingItems = await EmailAccountName.find({
            $or: newInsertList.map((item) => ({
              firstName: item.firstName,
              lastName: item.lastName,
              isRequired: item.isRequired,
            })),
          });

          const existingItemsSet = new Set(
            existingItems.map(
              (item) => `${item.firstName}-${item.lastName}-${item.isRequired}`
            )
          );

          const filteredInsertList = newInsertList.filter(
            (item) =>
              !existingItemsSet.has(
                `${item.firstName}-${item.lastName}-${item.isRequired}`
              )
          );

          EmailAccountName.insertMany(
            filteredInsertList,
            { ordered: false },
            function (err, docs) {
              fs.unlink(`${newpath}${filename}`, function (err) {
                if (err) {
                  console.error(
                    "Error occurred while trying to remove file",
                    err
                  );
                } else {
                  console.info(`File removed`);
                }

                return res.status(200).send({
                  message: "Successfully bulk added email account names",
                  success: true,
                  data: null,
                });
              });
            }
          );
        });
    });
  } catch (err) {
    console.log("error happens here", err);
    return res.status(400).send({
      success: false,
      message: "An error occurred!",
    });
  }
};

exports.emailAccountNamesListEDITONE = async (req, res, next) => {
  const {
    emailAccountNameIdToEdit,
    firstName,
    lastName = "",
    isRequired = false,
  } = req.body;

  try {
    // Check if there's another entry (excluding the current one being edited) with the same combination
    const existingEmailAccountName = await EmailAccountName.findOne({
      _id: { $ne: emailAccountNameIdToEdit }, // Exclude the current object
      firstName,
      lastName,
      isRequired,
    });

    if (existingEmailAccountName) {
      // If combination exists, do not update
      return res.status(409).send({
        // 409 Conflict
        message:
          "Conflict: Another entry with this combination of first name, last name, and isRequired already exists.",
        success: false,
        data: null,
      });
    }

    // If combination does not exist, proceed to update the entry
    let existingObject = await EmailAccountName.findById(
      emailAccountNameIdToEdit
    );
    if (existingObject != null) {
      existingObject.firstName = firstName;
      existingObject.lastName = lastName;
      existingObject.isRequired = isRequired;
      await existingObject.save();

      return res.status(200).send({
        message: "Successfully edited email account name",
        success: true,
        data: existingObject,
      });
    } else {
      return res.status(404).send({
        message: "The email account name was not found!",
        success: false,
        data: null,
      });
    }
  } catch (err) {
    console.error("Error in emailAccountNamesListEDITONE:", err);
    return res.status(500).send({
      // Internal Server Error
      message: "Error editing email account name",
      success: false,
      data: null,
    });
  }
};

exports.emailAccountNamesListDELETEONE = async (req, res, next) => {
  const { emailAccountNameIdToDelete } = req.body;

  try {
    let emailAccountNameToDelete = await EmailAccountName.findById(
      emailAccountNameIdToDelete
    );
    if (!emailAccountNameToDelete) {
      return res.status(404).send({
        message: "The email account name was not found!",
        success: false,
        data: null,
      });
    }
    await EmailAccountName.deleteOne({ _id: emailAccountNameIdToDelete });

    return res.status(200).send({
      message: "Successfully deleted email account name",
      success: true,
      data: null,
    });
  } catch (err) {
    console.error("Error in emailAccountNamesListDELETEONE:", err);
    return res.status(500).send({
      message: "Error deleting email account name",
      success: false,
      data: null,
    });
  }
};

exports.emailAccountNamesListDELETEBULK = async (req, res, next) => {
  const { idsToDelete } = req.body;

  try {
    await EmailAccountName.deleteMany({ _id: { $in: idsToDelete } });
    return res.status(200).send({
      message: "Successfully deleted email account names",
      success: true,
      data: null,
    });
  } catch (err) {
    console.error("Error in emailAccountNamesListDELETEBULK:", err);
    return res.status(500).send({
      message: "Error deleting email account names list",
      success: false,
      data: null,
    });
  }
};

// END Email Account Names List

// START cPanel Accounts

exports.cPanelAccountsGET = async (req, res, next) => {
  let { limit, skip, sortField, sortOrder, searchTerm } = req.body;

  limit = Number(limit);
  skip = Number(skip);
  sortField = sortField || "_id";
  sortOrder = sortOrder === "desc" ? -1 : 1;

  try {
    let sortObj = {};
    sortObj[sortField] = sortOrder;

    let query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // 'i' for case-insensitive
      const isObjectId = searchTerm.match(/^[0-9a-fA-F]{24}$/); // Check if searchTerm is a valid ObjectId

      query = {
        $or: [
          { name: regex },
          { primaryDomainName: regex },
          { ipAddress: regex },
          { port: regex },
        ],
      };

      if (isObjectId) {
        query.$or.push({ _id: searchTerm });
      }
    }

    let allCPanelAccounts = await CPanelAccount.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort(sortObj)
      .limit(limit)
      .skip(skip);

    let totalCPanelAccounts = await CPanelAccount.countDocuments(query);
    return res.status(200).send({
      message: "Success",
      success: true,
      total: totalCPanelAccounts,
      data: allCPanelAccounts,
    });
  } catch (error) {
    console.error("Error fetching cPanel accounts:", error);
    return res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

exports.cPanelAccountsADDONE = async (req, res, next) => {
  const {
    name,
    primaryDomainName,
    ipAddress,
    port,
    whmUsername,
    whmPassword,
    whmApiKey,
    cPanelUsername,
    cPanelPassword,
    cPanelApiKey,
  } = req.body;

  try {
    // Check for existing combination
    const existingCPanelAccount = await CPanelAccount.findOne({
      name,
      primaryDomainName,
      ipAddress,
      port,
    });

    if (existingCPanelAccount) {
      // If combination exists, do not add a new entry
      return res.status(409).send({
        // 409 Conflict
        message:
          "Duplicate entry: This combination of name, primaryDomainName, ipAddress, and port already exists.",
        success: false,
        data: null,
      });
    }

    // If combination does not exist, create a new entry
    let newCPanelAccount = new CPanelAccount({
      name,
      primaryDomainName,
      ipAddress,
      port,
      whmUsername,
      whmPassword,
      whmApiKey,
      cPanelUsername,
      cPanelPassword,
      cPanelApiKey,
      numberOfDomains: 0,
      dateAdded: new Date(),
    });
    await newCPanelAccount.save();

    return res.status(200).send({
      message: "Successfully added cPanel account",
      success: true,
      data: newCPanelAccount,
    });
  } catch (err) {
    console.error("Error in cPanelAccountsADDONE:", err);
    return res.status(500).send({
      // Internal Server Error
      message: "Error adding cPanel account",
      success: false,
      data: null,
    });
  }
};

exports.cPanelAccountsADDBULK = async (req, res, next) => {
  try {
    const newpath = path.join(__dirname, "..", "tmp-files/");
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
        .pipe(parse({ delimiter: "," }))
        .on("data", function (csvrow) {
          if (i === 0) {
            // Skip the first row (header)
            i++;
            return;
          }

          let name = csvrow[0];
          let primaryDomainName = csvrow[1];
          let ipAddress = csvrow[2];
          let port = csvrow[3];
          let whmUsername = csvrow[4];
          let whmPassword = csvrow[5];
          let whmApiKey = csvrow[6];
          let cPanelUsername = csvrow[7];
          let cPanelPassword = csvrow[8];
          let cPanelApiKey = csvrow[9];

          let uniqueKey = `${name}-${primaryDomainName}-${ipAddress}-${port}`;

          if (!existingKeys.has(uniqueKey)) {
            let newItem = {
              name: name,
              primaryDomainName: primaryDomainName,
              ipAddress: ipAddress,
              port: port,
              whmUsername: whmUsername,
              whmPassword: whmPassword,
              whmApiKey: whmApiKey,
              cPanelUsername: cPanelUsername,
              cPanelPassword: cPanelPassword,
              cPanelApiKey: cPanelApiKey,
              numberOfDomains: 0,
              dateAdded: new Date(),
            };
            newInsertList.push(newItem);
            existingKeys.add(uniqueKey);
          }
          i++;
        })
        .on("end", async function () {
          const existingItems = await CPanelAccount.find({
            $or: newInsertList.map((item) => ({
              name: item.name,
              primaryDomainName: item.primaryDomainName,
              ipAddress: item.ipAddress,
              port: item.port,
            })),
          });

          const existingItemsSet = new Set(
            existingItems.map(
              (item) =>
                `${item.name}-${item.primaryDomainName}-${item.ipAddress}-${item.port}`
            )
          );

          const filteredInsertList = newInsertList.filter(
            (item) =>
              !existingItemsSet.has(
                `${item.name}-${item.primaryDomainName}-${item.ipAddress}-${item.port}`
              )
          );

          CPanelAccount.insertMany(
            filteredInsertList,
            { ordered: false },
            function (err, docs) {
              fs.unlink(`${newpath}${filename}`, function (err) {
                if (err) {
                  console.error(
                    "Error occurred while trying to remove file",
                    err
                  );
                } else {
                  console.info(`File removed`);
                }

                return res.status(200).send({
                  message: "Successfully bulk added cPanel accounts",
                  success: true,
                  data: null,
                });
              });
            }
          );
        });
    });
  } catch (err) {
    console.log("error happens here", err);
    return res.status(400).send({
      success: false,
      message: "An error occurred!",
    });
  }
};

exports.cPanelAccountsEDITONE = async (req, res, next) => {
  const {
    cPanelAccountIdToEdit,
    name,
    primaryDomainName,
    ipAddress,
    port,
    whmUsername,
    whmPassword,
    whmApiKey,
    cPanelUsername,
    cPanelPassword,
    cPanelApiKey,
  } = req.body;

  try {
    // Check for existing combination excluding the current object
    const existingCPanelAccount = await CPanelAccount.findOne({
      _id: { $ne: cPanelAccountIdToEdit }, // Exclude the current object
      name,
      primaryDomainName,
      ipAddress,
      port,
    });

    if (existingCPanelAccount) {
      // If combination exists, do not update
      return res.status(409).send({
        // 409 Conflict
        message:
          "Conflict: Duplicate entry with this combination of fields exists.",
        success: false,
        data: null,
      });
    }

    // If combination does not exist, update the entry
    let existingObject = await CPanelAccount.findById(cPanelAccountIdToEdit);
    if (existingObject != null) {
      existingObject.name = name;
      existingObject.primaryDomainName = primaryDomainName;
      existingObject.ipAddress = ipAddress;
      existingObject.port = port;
      existingObject.whmUsername = whmUsername;
      existingObject.whmPassword = whmPassword;
      existingObject.whmApiKey = whmApiKey;
      existingObject.cPanelUsername = cPanelUsername;
      existingObject.cPanelPassword = cPanelPassword;
      existingObject.cPanelApiKey = cPanelApiKey;
      await existingObject.save();

      return res.status(200).send({
        message: "Successfully edited cPanel account",
        success: true,
        data: existingObject,
      });
    } else {
      return res.status(404).send({
        message: "The cPanel account was not found!",
        success: false,
        data: null,
      });
    }
  } catch (err) {
    console.error("Error in cPanelAccountsEDITONE:", err);
    return res.status(500).send({
      // Internal Server Error
      message: "Error editing cPanel account",
      success: false,
      data: null,
    });
  }
};

exports.cPanelAccountsDELETEONE = async (req, res, next) => {
  const { cPanelAccountIdToDelete } = req.body;
  try {
    let cPanelAccountToDelete = await CPanelAccount.findById(
      cPanelAccountIdToDelete
    );

    if (!cPanelAccountToDelete) {
      return res.status(404).send({
        message: "The cPanel Account was not found!",
        success: false,
        data: null,
      });
    }

    await CPanelAccount.deleteOne({ _id: cPanelAccountIdToDelete });

    return res.status(200).send({
      message: "Successfully deleted cPanel Account",
      success: true,
      data: null,
    });
  } catch (err) {
    console.error("Error in cPanelAccountsDELETEONE:", err);
    return res.status(500).send({
      message: "Error deleting cPanel account",
      success: false,
      data: null,
    });
  }
};

exports.cPanelAccountsDELETEBULK = async (req, res, next) => {
  const { idsToDelete } = req.body;
  try {
    await CPanelAccount.deleteMany({ _id: { $in: idsToDelete } });

    return res.status(200).send({
      message: "Successfully deleted cPanel accounts",
      success: true,
      data: null,
    });
  } catch (err) {
    console.error("Error in cPanelAccountsDELETEBULK:", err);
    return res.status(500).send({
      message: "Error deleting cPanel Accounts",
      success: false,
      data: null,
    });
  }
};

// END cPanel Accounts

// START Default Settings

exports.defaultSettingsGET = async (req, res, next) => {
  try {
    let defaultSettings = await PreWarmUpDefaultSettings.findOne({});

    return res.status(200).send({
      message: "Success",
      success: true,
      data: defaultSettings,
    });
  } catch (error) {
    console.error("Error fetching Default Settings:", error);
    return res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

exports.defaultSettingsEDIT = async (req, res, next) => {
  const {
    namecheapUsername,
    namecheapApiKey,
    instantlyApiKey,
    numberOfEmailAccountsPerDomain,
    defaultEmailAccountPassword,
    MTAIpAddress,
  } = req.body;

  try {
    // Check for existing combination excluding the current object
    const existingDefaultSettings = await PreWarmUpDefaultSettings.findOne({});

    if (existingDefaultSettings) {
      // If exists, update existing
      existingDefaultSettings.namecheapUsername = namecheapUsername;
      existingDefaultSettings.namecheapApiKey = namecheapApiKey;
      existingDefaultSettings.instantlyApiKey = instantlyApiKey;
      existingDefaultSettings.numberOfEmailAccountsPerDomain =
        numberOfEmailAccountsPerDomain;
      existingDefaultSettings.defaultEmailAccountPassword =
        defaultEmailAccountPassword;
      existingDefaultSettings.MTAIpAddress = MTAIpAddress;

      await existingDefaultSettings.save();
    } else {
      // If it doesn't exist, create a new one
      let newDefaultSettings = new PreWarmUpDefaultSettings({
        namecheapUsername,
        namecheapApiKey,
        instantlyApiKey,
        numberOfEmailAccountsPerDomain,
        defaultEmailAccountPassword,
        MTAIpAddress,
      });
      await newDefaultSettings.save();
    }

    await Domain.updateMany(
      { numberOfEmailAccounts: { $lt: numberOfEmailAccountsPerDomain } },
      { $set: { emailAccountsCreated: false } }
    );

    return res.status(200).send({
      message: "Successfully edited Default Settings",
      success: true,
      data: null,
    });
  } catch (err) {
    console.error("Error in defaultSettingsEDIT:", err);
    return res.status(500).send({
      // Internal Server Error
      message: "Error editing Default Settings",
      success: false,
      data: null,
    });
  }
};

// END Default Settings

// START Domains

exports.domainsGET = async (req, res, next) => {
  let { limit, skip, sortField, sortOrder, searchTerm } = req.body;

  limit = Number(limit);
  skip = Number(skip);
  sortField = sortField || "_id";
  sortOrder = sortOrder === "desc" ? -1 : 1;

  try {
    let sortObj = {};
    sortObj[sortField] = sortOrder;

    let query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // 'i' for case-insensitive
      const isObjectId = searchTerm.match(/^[0-9a-fA-F]{24}$/); // Check if searchTerm is a valid ObjectId

      query = {
        $or: [{ domainName: regex }, { cPanelAccountName: regex }],
      };

      if (isObjectId) {
        query.$or.push({ _id: searchTerm });
      }
    }

    let allDomains = await Domain.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort(sortObj)
      .limit(limit)
      .skip(skip);

    let cPanelAccounts = await CPanelAccount.find().select("_id name");

    let totalDomains = await Domain.countDocuments(query);
    return res.status(200).send({
      message: "Success",
      success: true,
      total: totalDomains,
      data: {
        domains: allDomains,
        cPanelAccounts: cPanelAccounts,
      },
    });
  } catch (error) {
    console.error("Error fetching domains:", error);
    return res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

exports.domainsADDONE = async (req, res, next) => {
  const { domainName, isDomainPurchased, cPanelAccountId, cPanelAccountName } =
    req.body;

  try {
    // Check for existing combination
    const existingDomain = await Domain.findOne({
      domainName,
    });

    if (existingDomain) {
      // If combination exists, do not add a new entry
      return res.status(409).send({
        // 409 Conflict
        message: "Duplicate entry: This domain name already exists.",
        success: false,
        data: null,
      });
    }

    let cPanelAccount = await CPanelAccount.findOne({ _id: cPanelAccountId });
    if (!cPanelAccount) {
      return res.status(404).send({
        message: "cPanel account not found.",
        success: false,
        data: null,
      });
    }
    // let defaultSettings = await PreWarmUpDefaultSettings.findOne({});
    // If combination does not exist, create a new entry
    let newDomain = new Domain({
      domainName: domainName,
      dateAdded: new Date(),
      currentWarmupDay: 0,
      isPurchased: isDomainPurchased,
      isConnectedToInstantly: false,
      numberOfEmailAccounts: 0,
      isConnectedToCPanel: false,
      cPanelAccountId: cPanelAccountId,
      cPanelAccountName: cPanelAccountName,
      hasWebsite: false,
      emailAccountsCreated: false,
      isConnectedToMTA: false,
      isMTAApiKeySet: false,
      mtaApiKey: "",
      isDNSComplete: false,
      isDNSNameserversComplete: false,
      isDKIMComplete: false,
      DKIMValue: "",
      groupId: "",
      ipAddress: cPanelAccount.ipAddress,
      isLocked: false,
      inRecoveryMode: false,
      warmupLimitDaily: 0,
      productionLimitDaily: 0,
      setupComplete: false,
    });

    await newDomain.save();

    await CPanelAccount.findOneAndUpdate(
      { _id: cPanelAccountId },
      { $inc: { numberOfDomains: 1 } }
    );

    // update namecheap nameservers for domain

    // create domain in cpanel

    // upload website in domain's folder

    return res.status(200).send({
      message: "Successfully added cPanel account",
      success: true,
      data: newDomain,
    });
  } catch (err) {
    console.error("Error in domainsADDONE:", err);
    return res.status(500).send({
      // Internal Server Error
      message: "Error adding domain",
      success: false,
      data: null,
    });
  }
};

exports.domainsADDBULK = async (req, res, next) => {
  const { cPanelAccountId, cPanelAccountName } = req.body;

  try {
    let cPanelAccount = await CPanelAccount.findOne({ _id: cPanelAccountId });
    if (!cPanelAccount) {
      return res.status(404).send({
        message: "cPanel account not found.",
        success: false,
        data: null,
      });
    }
    const newpath = path.join(__dirname, "..", "tmp-files/");
    const file = req.files.file;
    const filename = file.name;

    let newInsertList = [];
    let existingKeys = new Set();

    let bulkInsertCount = 0;

    file.mv(`${newpath}${filename}`, (err) => {
      if (err) {
        res.status(500).send({ message: "File upload failed", code: 200 });
      }

      let i = 0;

      fs.createReadStream(`${newpath}${filename}`)
        .pipe(parse({ delimiter: "," }))
        .on("data", function (csvrow) {
          if (i === 0) {
            // Skip the first row (header)
            i++;
            return;
          }

          let domainName = csvrow[0];
          let isDomainPurchased = csvrow[1] == "true" ? true : false;

          let uniqueKey = `${domainName}`;

          if (!existingKeys.has(uniqueKey)) {
            let newItem = {
              domainName: domainName,
              dateAdded: new Date(),
              currentWarmupDay: 0,
              isPurchased: isDomainPurchased,
              isConnectedToInstantly: false,
              numberOfEmailAccounts: 0,
              isConnectedToCPanel: false,
              isConnectedToInstantly: false,
              cPanelAccountId: cPanelAccountId,
              cPanelAccountName: cPanelAccountName,
              hasWebsite: false,
              emailAccountsCreated: false,
              isConnectedToMTA: false,
              isMTAApiKeySet: false,
              mtaApiKey: "",
              isDNSComplete: false,
              isDNSNameserversComplete: false,
              isDKIMComplete: false,
              DKIMValue: "",
              groupId: "",
              ipAddress: cPanelAccount.ipAddress,
              isLocked: false,
              inRecoveryMode: false,
              warmupLimitDaily: 0,
              productionLimitDaily: 0,
              setupComplete: false,
            };

            newInsertList.push(newItem);
            existingKeys.add(uniqueKey);
          }
          i++;
        })
        .on("end", async function () {
          const existingItems = await Domain.find({
            $or: newInsertList.map((item) => ({
              domainName: item.domainName,
            })),
          });

          const existingItemsSet = new Set(
            existingItems.map((item) => `${item.domainName}`)
          );

          const filteredInsertList = newInsertList.filter(
            (item) => !existingItemsSet.has(`${item.domainName}`)
          );
          bulkInsertCount = filteredInsertList.length;

          if (bulkInsertCount > 0) {
            await Domain.insertMany(filteredInsertList, { ordered: false });
            await CPanelAccount.findOneAndUpdate(
              { _id: cPanelAccountId },
              { $inc: { numberOfDomains: bulkInsertCount } }
            );
          }

          fs.unlink(`${newpath}${filename}`, function (err) {
            if (err)
              console.error("Error occurred while trying to remove file", err);
            else console.info(`File removed`);

            return res.status(200).send({
              message: "Successfully bulk added Domains",
              success: true,
              data: null,
            });
          });
        });
    });
  } catch (err) {
    console.log("error happens here", err);
    return res.status(400).send({
      success: false,
      message: "An error occurred!",
    });
  }
};

exports.domainsCONTINUENEXTSTEP = async (req, res, next) => {
  try {
    // Check for existing combination
    const domainsToContinue = await Domain.find({ setupComplete: false });
    const preWarmUpDefaultSettings = await PreWarmUpDefaultSettings.findOne({});
    const warmUpDefaultSettings = await WarmUpDefaultSettings.findOne({});

    for (const domain of domainsToContinue) {
      let nextDomainStep = domainsGetNextStep(domain);
      let domainCPanelAccount = await CPanelAccount.findOne({
        _id: domain.cPanelAccountId,
      });
      switch (nextDomainStep) {
        case 0:
          // Purchase Domain from Namecheap
          let domainAvalabilityReponse = await namecheapCheckDomainAvailability(
            domain.domainName,
            preWarmUpDefaultSettings.namecheapUsername,
            preWarmUpDefaultSettings.namecheapApiKey
          );
          let parsedNamecheapAvailabilityResponse =
            await parseNamecheapXMLResponse(domainAvalabilityReponse.data);
          let availablilityResponseStatus =
            parsedNamecheapAvailabilityResponse.ApiResponse["$"].Status;
          if (availablilityResponseStatus == "OK") {
            let domainAvailable =
              parsedNamecheapAvailabilityResponse["ApiResponse"]
                .CommandResponse[0].DomainCheckResult[0]["$"].Available ==
              "true"
                ? true
                : false;
            let domainPremium =
              parsedNamecheapAvailabilityResponse["ApiResponse"]
                .CommandResponse[0].DomainCheckResult[0]["$"].IsPremiumName ==
              "true"
                ? true
                : false;
            if (domainAvailable && !domainPremium) {
              // proceed with purchase
              console.log(
                `domain ${domain.domainName} is available and not premium - ready for purchase.`
              );
              let domainPurchaseResponse = await namecheapPurchaseDomain(
                domain.domainName,
                preWarmUpDefaultSettings.namecheapUsername,
                preWarmUpDefaultSettings.namecheapApiKey
              );
              let parsedNamecheapPurchaseResponse =
                await parseNamecheapXMLResponse(domainPurchaseResponse.data);
              console.log("parsed", parsedNamecheapPurchaseResponse);
              let purchaseResponseStatus =
                parsedNamecheapPurchaseResponse.ApiResponse["$"].Status;
              if (purchaseResponseStatus == "OK") {
                // domain success
                console.log("status OK");
                console.log(
                  "function res",
                  parsedNamecheapPurchaseResponse["ApiResponse"]
                    .CommandResponse[0]
                );
                let domainSuccessfullyPurchased =
                  parsedNamecheapPurchaseResponse["ApiResponse"]
                    .CommandResponse[0].DomainCreateResult[0]["$"].Registered ==
                  "true"
                    ? true
                    : false;
                if (domainSuccessfullyPurchased) {
                  console.log(
                    " domain was successfully purchased, updating domain in db"
                  );
                  await Domain.updateOne(
                    {
                      _id: domain._id,
                    },
                    {
                      $set: {
                        isPurchased: true,
                      },
                    }
                  );
                }
              } else {
                console.log(
                  "something went wrong",
                  parsedNamecheapPurchaseResponse["ApiResponse"]
                    .CommandResponse[0].DomainCreateResult[0]["$"]
                );
                console.log(
                  "error",
                  parsedNamecheapPurchaseResponse["ApiResponse"]["Errors"][0]
                    .Error
                );
              }
            } else {
              console.log(
                `domain ${domain.domainName} is not available or is premium - unavailable for purchase.`
              );
            }
          } else {
            console.log("something went wrong");
          }
          break;
        case 1:
          // Update Namecheap basic DNS
          await namecheapUpdateDNSNameserversForDomain(
            domain._id,
            domain.domainName,
            domain.cPanelAccountId,
            preWarmUpDefaultSettings.namecheapUsername,
            preWarmUpDefaultSettings.namecheapApiKey
          );
          break;
        case 2:
          // Create domain in cPanel
          await cPanelAddDomain(
            domain._id,
            domain.domainName,
            domain.cPanelAccountId
          );
          break;
        case 3:
          // Upload domain website files to cPanel
          const localFilePath = path.join(
            __dirname,
            "../tmp-files/demo-website.zip"
          );
          console.log("filepath", localFilePath);
          let uploadResponse = await cPanelFileUpload(
            domain.cPanelAccountId,
            domain.domainName,
            localFilePath
          );
          if (uploadResponse.data.succeeded) {
            console.log("successfully UPLOADED, domain:", domain.domainName);
            let extractResponse = await cPanelFileExtract(
              domain.cPanelAccountId,
              domain.domainName
            );
            if (
              extractResponse.data[0].output.includes("Archive:") &&
              extractResponse.data[0].output.includes("inflating:")
            ) {
              console.log("successfully EXTRACTED, domain:", domain.domainName);
              let deleteResponse = await cPanelFileDelete(
                domain.cPanelAccountId,
                domain.domainName
              );
              if (deleteResponse.data) {
                console.log("successfully DELETED, domain:", domain.domainName);
                await Domain.updateOne(
                  {
                    _id: domain._id,
                  },
                  {
                    $set: {
                      hasWebsite: true,
                    },
                  }
                );
              }
            }
          }
          break;
        case 4:
          // create domain email accounts in cpanel

          let maxLimit = await EmailAccountName.countDocuments({});

          let limit = preWarmUpDefaultSettings.numberOfEmailAccountsPerDomain;

          if (limit > maxLimit) {
            limit = maxLimit;
          }

          let defaultPassword =
            preWarmUpDefaultSettings.defaultEmailAccountPassword;

          let alreadyCreatedEmailAccountsForDomain = await EmailAccount.find({
            domainId: domain._id,
          });

          let existingEmailsSet = new Set(
            alreadyCreatedEmailAccountsForDomain.map((account) =>
              account.fullEmail.toLowerCase()
            )
          );

          let requiredEmailAccountNames = (
            await EmailAccountName.find({ isRequired: true }).limit(limit)
          ).filter((accountName) => {
            let fullEmail = constructEmail(accountName, domain.domainName); // Assuming accountName has firstName and optionally lastName
            return !existingEmailsSet.has(fullEmail);
          });

          var remainingLimit =
            limit -
            requiredEmailAccountNames.length -
            alreadyCreatedEmailAccountsForDomain.length;

          let nonRequiredEmailAccountNames = (
            await EmailAccountName.aggregate([
              { $match: { isRequired: false } },
              {
                $sample: {
                  size:
                    remainingLimit +
                    alreadyCreatedEmailAccountsForDomain.length,
                },
              }, // Fetch more than needed to account for existing emails
            ])
          )
            .filter((accountName) => {
              let fullEmail = constructEmail(accountName, domain.domainName); // Assuming accountName has firstName and optionally lastName
              return !existingEmailsSet.has(fullEmail);
            })
            .slice(0, remainingLimit); // Ensure only the needed amount is selected

          // Combine filtered lists
          let combinedEmailAccounts = [
            ...requiredEmailAccountNames,
            ...nonRequiredEmailAccountNames,
          ];

          // using for iterate over the combined and start creating them in cpanel
          for (let emailAccountName of combinedEmailAccounts) {
            let name = emailAccountName.firstName;

            if (emailAccountName.lastName) {
              name += "." + emailAccountName.lastName;
            }

            let fullEmail = constructEmail(emailAccountName, domain.domainName);

            // Proceed with creating the email account if it's not in existingEmailsSet
            if (!existingEmailsSet.has(fullEmail.toLowerCase())) {
              let createEmailReponse = await cPanelCreateEmailAccount(
                domainCPanelAccount,
                fullEmail,
                domain.domainName,
                defaultPassword
              );
              if (!createEmailReponse.errors) {
                let newEmailAccount = new EmailAccount({
                  name,
                  firstName: emailAccountName.firstName,
                  lastName: emailAccountName.lastName || "",
                  domainName: domain.domainName,
                  fullEmail,
                  domainId: domain._id,
                  isConnectedToInstantly: false,
                  cPanelAccountId: domain.cPanelAccountId,
                  cPanelAccountName: domain.cPanelAccountName,
                  cPanelPrimaryDomainName:
                    domainCPanelAccount.primaryDomainName,
                  password: defaultPassword,
                  replyRate: warmUpDefaultSettings.replyRate,
                  isLocked: false,
                  inRecoveryMode: false,
                  isRequired: emailAccountName.isRequired,
                  currentWarmupDay: 0,
                  warmupLimitDaily: 0,
                  productionLimitDaily: 0,
                  dateAdded: new Date(),
                });
                await newEmailAccount.save();
                await Domain.findOneAndUpdate(
                  { _id: domain._id },
                  { $inc: { numberOfEmailAccounts: 1 } }
                );
              } else {
                console.log("create email errors", fullEmail);
              }
            } else {
              console.log("full email exists", fullEmail);
            }
          }

          let numberOfEmailAccountsForDomain =
            await EmailAccount.countDocuments({ domainId: domain._id });

          if (numberOfEmailAccountsForDomain == limit) {
            await Domain.updateOne(
              { _id: domain._id },
              { $set: { emailAccountsCreated: true } }
            );
          } else {
            console.log("setting domain NOT completed email accounts");
          }
        case 5:
          // create domain in MTA - get DKIM DMARC, API KEY also
          // this case is handled MANUALLY
          break;

        case 6:
          // upload MTA API KEY
          // this case is handled MANUALLY
          break;
        case 7:
          // upload DKIM Records for domains
          // this case is handled MANUALLY
          break;
        case 8:
          // upload Domain Sending IP
          // this case is handled MANUALLY
          break;

        case 9:
          // update domain DNS records in cpanel with dkim dmarc data, and all other required dns records

          // get list of current records
          let existingDNSRecords = await cPanelDNSFetchZoneRecords(
            domainCPanelAccount,
            domain.domainName
          );
          existingDNSRecords = sortDNSRecordsDesc(existingDNSRecords);
          // console.log(existingDNSRecords);

          // remove existing records
          for (record of existingDNSRecords) {
            if (record.type == "MX") {
              console.log("remove MX record", record);
              await cPanelDNSDeleteMXRecord(
                domainCPanelAccount,
                domain.domainName
              );
            } else if (record.record && record.record.includes("v=DKIM")) {
              console.log("remove DKIM record", record);
              await cPanelDNSDeleteZoneRecord(
                domainCPanelAccount,
                domain.domainName,
                record.line
              );
            } else if (record.record && record.record.includes("v=spf")) {
              console.log("remove spf record", record);
              await cPanelDNSDeleteZoneRecord(
                domainCPanelAccount,
                domain.domainName,
                record.line
              );
            }
          }

          // add new records
          console.log("adding mx record");
          await cPanelDNSAddMXRecord(domainCPanelAccount, domain.domainName);
          console.log("adding DKIM record");
          let recordDetails = {
            name: "dkim._domainkey." + domain.domainName + ".",
            txtdata: domain.DKIMValue,
            ttl: 14400,
          };
          await cPanelDNSAddZoneRecord(
            domainCPanelAccount,
            domain.domainName,
            "TXT",
            recordDetails
          );

          console.log("adding DMARC record");
          recordDetails = {
            name: "_dmarc." + domain.domainName + ".",
            txtdata:
              "V=DMARC1;p=quarantine;sp=none;adkim=r;aspf=r;pct=100;fo=0;rf=afrf;ri=86400",
            ttl: 14400,
          };
          await cPanelDNSAddZoneRecord(
            domainCPanelAccount,
            domain.domainName,
            "TXT",
            recordDetails
          );

          console.log("adding SPF record");
          recordDetails = {
            name: domain.domainName + ".",
            txtdata:
              "v=spf1 +a +mx +ip4:" +
              domainCPanelAccount.ipAddress +
              " ip4:" +
              domain.sendingIpAddress +
              " ~all",
            ttl: 14400,
          };
          await cPanelDNSAddZoneRecord(
            domainCPanelAccount,
            domain.domainName,
            "TXT",
            recordDetails
          );

          console.log("adding MTA Tracking link record");
          recordDetails = {
            name: "track." + domain.domainName + ".",
            address: domain.sendingIpAddress,
            ttl: 14400,
          };
          await cPanelDNSAddZoneRecord(
            domainCPanelAccount,
            domain.domainName,
            "A",
            recordDetails
          );

          console.log("adding Instantly Tracking link record");
          recordDetails = {
            name: "inst." + domain.domainName + ".",
            cname: "prox.itrackly.com.",
            ttl: 14400,
          };
          await cPanelDNSAddZoneRecord(
            domainCPanelAccount,
            domain.domainName,
            "CNAME",
            recordDetails
          );

          console.log("update domain DNS complete");
          await Domain.findOneAndUpdate(
            { _id: domain._id },
            { $set: { isDNSComplete: true } }
          );

          break;

        case 10:
          // instantly upload file will be automatically generated, this needs to be market manually
          break;
      }

      updateDomain = await Domain.findOne({ _id: domain._id });
      updateDomain.setupComplete = domainsIsComplete(updateDomain);
      await updateDomain.save();
    }

    return res.status(200).send({
      message: "Successfully continued integration of domains",
      success: true,
      data: null,
    });
  } catch (err) {
    console.error("Error in domainsCONTINUENEXTSTEP:", err);
    return res.status(500).send({
      // Internal Server Error
      message: "Error in function",
      success: false,
      data: null,
    });
  }
};

exports.domainsDELETEONE = async (req, res, next) => {
  const { domainIdToDelete } = req.body;

  try {
    let domainToDelete = await Domain.findById(domainIdToDelete);

    if (!domainToDelete) {
      return res.status(404).send({
        message: "The domain was not found!",
        success: false,
        data: null,
      });
    }

    // Save the cPanelAccountId before deleting the domain
    const cPanelAccountId = domainToDelete.cPanelAccountId;
    // Delete email accounts cpanel
    const emailAccountsToDelete = await EmailAccount.find({
      domainId: domainIdToDelete,
    });

    // Delete each email account from cPanel
    const deletePromises = emailAccountsToDelete.map(async (emailAccount) => {
      let cPanelAccount = await CPanelAccount.findOne({
        _id: emailAccount.cPanelAccountId,
      });
      if (!cPanelAccount) {
        throw new Error(
          `CPanelAccount not found for email account ${emailAccount.fullEmail}`
        );
      }
      await cPanelDeleteEmailAccount(cPanelAccount, emailAccount.fullEmail);
      // Optionally, handle the response or errors
    });

    await Promise.all(deletePromises);
    // Bulk delete email accounts in the database
    await EmailAccount.deleteMany({ domainId: domainIdToDelete });

    await Domain.deleteOne({ _id: domainIdToDelete });

    // Decrement the numberOfDomains in the associated cPanel account
    await CPanelAccount.findOneAndUpdate(
      { _id: cPanelAccountId },
      { $inc: { numberOfDomains: -1 } }
    );

    return res.status(200).send({
      message: "Successfully deleted domain",
      success: true,
      data: null,
    });
  } catch (err) {
    console.error("Error in domainsDELETEONE:", err);
    return res.status(500).send({
      message: "Error deleting domain",
      success: false,
      data: null,
    });
  }
};

exports.domainsDELETEBULK = async (req, res, next) => {
  const { idsToDelete } = req.body;

  try {
    // Fetch all domains to be deleted to get their associated cPanelAccountIds
    const domainsToDelete = await Domain.find({ _id: { $in: idsToDelete } });

    // Aggregate the number of domains per cPanel account
    const cPanelAccountUpdates = domainsToDelete.reduce((acc, domain) => {
      acc[domain.cPanelAccountId] = (acc[domain.cPanelAccountId] || 0) + 1;
      return acc;
    }, {});

    // Perform bulk update on cPanel accounts
    for (const [cPanelAccountId, count] of Object.entries(
      cPanelAccountUpdates
    )) {
      await CPanelAccount.findOneAndUpdate(
        { _id: cPanelAccountId },
        { $inc: { numberOfDomains: -count } }
      );
    }

    // Delete each email account from cPanel
    const emailAccountsToDelete = await EmailAccount.find({
      domainId: { $in: idsToDelete },
    });

    // Delete each email account from cPanel
    const deletePromises = emailAccountsToDelete.map(async (emailAccount) => {
      let cPanelAccount = await CPanelAccount.findOne({
        _id: emailAccount.cPanelAccountId,
      });
      if (!cPanelAccount) {
        throw new Error(
          `CPanelAccount not found for email account ${emailAccount.fullEmail}`
        );
      }
      await cPanelDeleteEmailAccount(cPanelAccount, emailAccount.fullEmail);
      // Optionally, handle the response or errors
    });

    await Promise.all(deletePromises);

    // Bulk delete email accounts in the database
    await EmailAccount.deleteMany({ domainId: { $in: idsToDelete } });
    // Perform bulk delete of domains

    await Domain.deleteMany({ _id: { $in: idsToDelete } });

    return res.status(200).send({
      message: "Successfully deleted domains",
      success: true,
      data: null,
    });
  } catch (err) {
    console.error("Error in domainsDELETEBULK:", err);
    return res.status(500).send({
      message: "Error deleting domains",
      success: false,
      data: null,
    });
  }
};

exports.domainsMARKMTACONNECTED = async (req, res, next) => {
  try {
    const newpath = path.join(__dirname, "..", "tmp-files/");
    const file = req.files.file;
    const filename = file.name;
    const filePath = `${newpath}${filename}`;

    await file.mv(filePath);

    // Read file content asynchronously
    const fileContent = await fsprom.readFile(filePath);

    // Parse CSV content asynchronously
    parse(
      fileContent,
      { columns: true, skip_empty_lines: true },
      async (err, records) => {
        if (err) {
          // Handle parsing error
          console.error("CSV parsing error:", err);
          return res
            .status(500)
            .send({ message: "CSV parsing failed", success: false });
        }

        // Proceed with bulk operations as before
        // Ensure records is correctly formatted as an array
        console.log(records); // Debug: Inspect the parsed records

        // Initialize the bulk operation
        const bulkOps = Domain.collection.initializeOrderedBulkOp();
        let opsCount = 0;

        records.forEach((record) => {
          const { domain: domainName } = record;
          bulkOps.find({ domainName }).updateOne({
            $set: {
              isConnectedToMTA: true,
            },
          });
          opsCount++;
        });

        if (opsCount > 0) {
          await bulkOps.execute();
        }

        await fsprom.unlink(filePath);
        return res
          .status(200)
          .send({
            message: "Successfully updated MTA complete for domains",
            success: true,
          });
      }
    );
  } catch (error) {
    console.error("Error in domainsMARKMTACONNECTED:", error);
    return res
      .status(500)
      .send({
        message: "An error occurred during file processing",
        success: false,
      });
  }
};

exports.domainsMARKINSTANTLYCONNECTED = async (req, res, next) => {
  try {
    const newpath = path.join(__dirname, "..", "tmp-files/");
    const file = req.files.file;
    const filename = file.name;
    const filePath = `${newpath}${filename}`;

    await file.mv(filePath);
    const fileContent = await fsprom.readFile(filePath, { encoding: "utf8" });

    // Wrap CSV parsing in a promise to handle it asynchronously
    const records = await new Promise((resolve, reject) => {
      parse(
        fileContent,
        { columns: true, skip_empty_lines: true },
        (err, output) => {
          if (err) {
            reject(err);
          } else {
            resolve(output);
          }
        }
      );
    });

    let domainUpdatePromises = [];
    let domainNames = [];
    for (let record of records) {
      // console.log(record);
      const { Email: fullEmail } = record;
      // console.log(fullEmail);
      const domainName = fullEmail.split("@")[1];
      domainNames.push(domainName);
      // Update EmailAccount
      domainUpdatePromises.push(
        EmailAccount.findOneAndUpdate(
          { fullEmail, isConnectedToInstantly: false },
          {
            $set: {
              isConnectedToInstantly: true,
              dateConnectedToInstantly: new Date(),
            },
          }
        )
      );
    }
    console.log(domainNames);

    let domainsSet = new Set(domainNames);
    console.log(domainsSet);

    await Promise.all(domainUpdatePromises);
    domainUpdatePromises = [];
    for (let domainName of domainsSet) {
      // Domain update logic remains unchanged
      // Collect domain updates to run in parallel after the loop
      domainUpdatePromises.push(
        (async () => {
          const emailCount = await EmailAccount.countDocuments({
            domainName,
            isConnectedToInstantly: true,
          });
          const requiredEmailAccounts = await EmailAccount.countDocuments({
            domainName,
            isRequired: true,
          });
          const domain = await Domain.findOne({ domainName });
          // console.log(`Domain name ${domainName} | Email Count: ${emailCount} | Required Email Accounts: ${requiredEmailAccounts} | Domain Valid Emails: ${domain.numberOfEmailAccounts - requiredEmailAccounts}`);
          if (
            emailCount ===
            domain.numberOfEmailAccounts - requiredEmailAccounts
          ) {
            return Domain.findOneAndUpdate(
              { domainName },
              {
                $set: {
                  isConnectedToInstantly: true,
                  dateConnectedToInstantly: new Date(),
                },
              }
            );
          }
        })()
      );
    }

    // Execute all promises
    await Promise.all(domainUpdatePromises);

    await fsprom.unlink(filePath);
    return res
      .status(200)
      .send({
        message: "Successfully updated Instantly complete for domains",
        success: true,
      });
  } catch (error) {
    console.error("Error in domainsMARKINSTANTLYCONNECTED:", error);
    return res
      .status(500)
      .send({
        message: "An error occurred during file processing",
        success: false,
      });
  }
};

exports.domainsUPLOADDKIMRECORDS = async (req, res) => {
  try {
    const newpath = path.join(__dirname, "..", "tmp-files/");
    const file = req.files.file;
    const filename = file.name;
    const filePath = `${newpath}${filename}`;

    await file.mv(filePath);

    // Read file content asynchronously
    const fileContent = await fsprom.readFile(filePath);

    // Parse CSV content asynchronously
    parse(
      fileContent,
      { columns: true, skip_empty_lines: true },
      async (err, records) => {
        if (err) {
          // Handle parsing error
          console.error("CSV parsing error:", err);
          return res
            .status(500)
            .send({ message: "CSV parsing failed", success: false });
        }

        // Proceed with bulk operations as before
        // Ensure records is correctly formatted as an array
        console.log(records); // Debug: Inspect the parsed records

        // Initialize the bulk operation
        const bulkOps = Domain.collection.initializeOrderedBulkOp();
        let opsCount = 0;

        records.forEach((record) => {
          const {
            domain: domainName,
            record: dkimRecord,
            value: dkimValue,
          } = record;
          bulkOps.find({ domainName }).updateOne({
            $set: {
              DKIMValue: dkimValue,
              isDKIMComplete: true,
            },
          });
          opsCount++;
        });

        if (opsCount > 0) {
          await bulkOps.execute();
        }

        await fsprom.unlink(filePath);
        return res
          .status(200)
          .send({
            message: "Successfully updated DKIM records",
            success: true,
          });
      }
    );
  } catch (error) {
    console.error("Error in domainsUPLOADDKIMRECORDS:", error);
    return res
      .status(500)
      .send({
        message: "An error occurred during file processing",
        success: false,
      });
  }
};

exports.domainsUPLOADSENDINGIPADDRESSES = async (req, res) => {
  try {
    const newpath = path.join(__dirname, "..", "tmp-files/");
    const file = req.files.file;
    const filename = file.name;
    const filePath = `${newpath}${filename}`;

    await file.mv(filePath);

    // Read file content asynchronously
    const fileContent = await fsprom.readFile(filePath);

    // Parse CSV content asynchronously
    parse(
      fileContent,
      { columns: true, skip_empty_lines: true },
      async (err, records) => {
        if (err) {
          // Handle parsing error
          console.error("CSV parsing error:", err);
          return res
            .status(500)
            .send({ message: "CSV parsing failed", success: false });
        }

        // Proceed with bulk operations as before
        // Ensure records is correctly formatted as an array
        console.log(records); // Debug: Inspect the parsed records

        // Initialize the bulk operation
        const bulkOps = Domain.collection.initializeOrderedBulkOp();
        let opsCount = 0;

        records.forEach((record) => {
          const { domain: domainName, ip: sendingIpAddress } = record;
          bulkOps.find({ domainName }).updateOne({
            $set: {
              sendingIpAddress: sendingIpAddress,
              isSendingIpAddressComplete: true,
            },
          });
          opsCount++;
        });

        if (opsCount > 0) {
          await bulkOps.execute();
        }

        await fsprom.unlink(filePath);
        return res
          .status(200)
          .send({
            message: "Successfully updated Sending IP Addresses",
            success: true,
          });
      }
    );
  } catch (error) {
    console.error("Error in domainsUPLOADSENDINGIPADDRESSES:", error);
    return res
      .status(500)
      .send({
        message: "An error occurred during file processing",
        success: false,
      });
  }
};

exports.domainsUPLOADMTAAPIKEYS = async (req, res) => {
  try {
    const newpath = path.join(__dirname, "..", "tmp-files/");
    const file = req.files.file;
    const filename = file.name;
    const filePath = `${newpath}${filename}`;

    await file.mv(filePath);

    // Read file content asynchronously
    const fileContent = await fsprom.readFile(filePath);

    // Parse CSV content asynchronously
    parse(
      fileContent,
      { columns: true, skip_empty_lines: true },
      async (err, records) => {
        if (err) {
          // Handle parsing error
          console.error("CSV parsing error:", err);
          return res
            .status(500)
            .send({ message: "CSV parsing failed", success: false });
        }

        // Proceed with bulk operations as before
        // Ensure records is correctly formatted as an array
        console.log(records); // Debug: Inspect the parsed records

        // Initialize the bulk operation
        const bulkOps = Domain.collection.initializeOrderedBulkOp();
        let opsCount = 0;

        records.forEach((record) => {
          const { domain: domainName, apiKey: apiKey } = record;
          bulkOps.find({ domainName }).updateOne({
            $set: {
              mtaApiKey: apiKey,
              isMTAApiKeySet: true,
            },
          });
          opsCount++;
        });

        if (opsCount > 0) {
          await bulkOps.execute();
        }

        await fsprom.unlink(filePath);
        return res
          .status(200)
          .send({ message: "Successfully updated MTA Api Key", success: true });
      }
    );
  } catch (error) {
    console.error("Error in domainsUPLOADMTAAPIKEY:", error);
    return res
      .status(500)
      .send({
        message: "An error occurred during file processing",
        success: false,
      });
  }
};

exports.domainsGENERATEINSTANTLYUPLOADFILE = async (req, res, next) => {
  const { selectedInstantlyFileExportType } = req.body;

  console.log("file here");
  try {
    let domains = [];

    if (selectedInstantlyFileExportType == "All email accounts") {
      domains = await Domain.find({
        numberOfEmailAccounts: { $gt: 0 },
        isConnectedToCPanel: true,
        isConnectedToMTA: true,
        isMTAApiKeySet: true,
        isDKIMComplete: true,
        isSendingIpAddressComplete: true,
        isDNSComplete: true,
        isDNSNameserversComplete: true,
      });
    } else if (selectedInstantlyFileExportType == "Only not connected yet") {
      domains = await Domain.find({
        numberOfEmailAccounts: { $gt: 0 },
        isConnectedToCPanel: true,
        isConnectedToMTA: true,
        isMTAApiKeySet: true,
        isDKIMComplete: true,
        isSendingIpAddressComplete: true,
        isDNSComplete: true,
        isDNSNameserversComplete: true,
        isConnectedToInstantly: false,
      });
    }

    const domainIds = domains.map((domain) => domain._id);
    let emailAccounts = [];
    if (selectedInstantlyFileExportType == "All email accounts") {
      emailAccounts = await EmailAccount.find({
        domainId: { $in: domainIds },
        isRequired: false,
      }).lean(); // Get the data as plain JS objects
    } else if (selectedInstantlyFileExportType == "Only not connected yet") {
      emailAccounts = await EmailAccount.find({
        domainId: { $in: domainIds },
        isRequired: false,
        isConnectedToInstantly: false,
      }).lean(); // Get the data as plain JS objects
    }

    // Fields to include in the CSV
    const fields = [
      {
        label: "Email",
        value: "email",
      },
      {
        label: "First Name",
        value: "firstName",
      },
      {
        label: "Last Name",
        value: "lastName",
      },
      {
        label: "IMAP Username",
        value: "imapUsername",
      },
      {
        label: "IMAP Password",
        value: "imapPassword",
      },
      {
        label: "IMAP Host",
        value: "imapHost",
      },
      {
        label: "IMAP Port",
        value: "imapPort",
      },
      {
        label: "SMTP Username",
        value: "smtpPassword",
      },
      {
        label: "SMTP Host",
        value: "smtpHost",
      },
      {
        label: "SMTP Port",
        value: "smtpPort",
      },
      {
        label: "Daily Limit",
        value: "dailyLimit",
      },
      {
        label: "Warmup Enabled",
        value: "warmupEnabled",
      },
      {
        label: "Warmup Limit",
        value: "warmupLimit",
      },
      {
        label: "WarmupIncrement",
        value: "warmupIncrement",
      },
      // Add other fields as needed...
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(
      emailAccounts.map((emailAccount) => {
        // Map your domain object to the fields structure
        return {
          email: emailAccount.fullEmail,
          firstName: emailAccount.firstName,
          lastName: emailAccount.lastName,
          imapUsername: emailAccount.fullEmail,
          imapPassword: emailAccount.password,
          imapHost: emailAccount.cPanelPrimaryDomainName,
          imapPort: 993,
          smtpUsername: emailAccount.fullEmail,
          smtpPassword: emailAccount.password,
          smtpHost: "digiclicksmail.com",
          smtpPort: 587,
          dailyLimit: 0,
          warmupEnabled: "TRUE",
          warmupLimit: 0,
          warmupIncrement: 1,
        };
      })
    );

    const filePath = path.join(__dirname, "../exports");
    const filename = `emailAccounts-Instantly-${Date.now()}.csv`;
    const fullPath = path.join(filePath, filename);

    // Ensure the 'exports' directory exists
    fs.mkdirSync(filePath, { recursive: true });

    // Write CSV to file
    fs.writeFileSync(fullPath, csv);
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    // Provide file for download
    res.download(fullPath, filename, function (err) {
      if (err) {
        // Handle error, but don't leak paths
        console.error("File download error:", err);
        res.sendStatus(404);
      } else {
        // Delete the file after download
        fs.unlink(fullPath, function (err) {
          if (err) console.error("File deletion error:", err);
        });
      }
    });
  } catch (err) {
    console.error("Error during CSV generation", err);
    return res.status(500).send({
      message: "Error genrating Instantly file",
      success: false,
      data: null,
    });
  }
};

exports.domainsDOWNLOADALLDATA = async (req, res, next) => {
  try {
    let domains = await Domain.find({});

    // Fields to include in the CSV
    const fields = [
      {
        label: "Domain Name",
        value: "domainName",
      },
      {
        label: "Date Added",
        value: "dateAdded",
      },
      {
        label: "cPanel Account ID",
        value: "cPanelAccountId",
      },
      {
        label: "cPanel Account Name",
        value: "cPanelAccountName",
      },
      {
        label: "IP Address",
        value: "ipAddress",
      },
      {
        label: "Sending IP Address",
        value: "sendingIpAddress",
      },
      {
        label: "Number Of Email Accounts",
        value: "numberOfEmailAccounts",
      },
      {
        label: "Current Warmup Day",
        value: "currentWarmupDay",
      },
      {
        label: "Warmup Limit Daily",
        value: "warmupLimitDaily",
      },
      {
        label: "Production Limit Daily",
        value: "productionLimitDaily",
      },
      {
        label: "DKIM Value",
        value: "DKIMValue",
      },
      {
        label: "MTA API Key",
        value: "mtaApiKey",
      },
      {
        label: "Is Purchased?",
        value: "isPurchased",
      },
      {
        label: "Is Connected To cPanel?",
        value: "isConnectedToCPanel",
      },
      {
        label: "Date Connected To cPanel",
        value: "dateConnectedToCPanel",
      },
      {
        label: "Has Website?",
        value: "hasWebsite",
      },
      {
        label: "Is Connected To Instantly?",
        value: "isConnectedToInstantly",
      },
      {
        label: "Date Connected To Instantly",
        value: "dateConnectedToInstantly",
      },
      {
        label: "Email Accounts Created?",
        value: "emailAccountsCreated",
      },
      {
        label: "Is Connected To MTA?",
        value: "isConnectedToMTA",
      },
      {
        label: "Is MTA API Key Set?",
        value: "isMTAApiKeySet",
      },
      {
        label: "Is DKIM Complete?",
        value: "isDKIMComplete",
      },
      {
        label: "Is Sending IP Address Complete?",
        value: "isSendingIpAddressComplete",
      },
      {
        label: "Is DNS Complete?",
        value: "isDNSComplete",
      },
      {
        label: "Is DNS Nameservers Complete?",
        value: "isDNSNameserversComplete",
      },
      {
        label: "Is Locked?",
        value: "isLocked",
      },
      {
        label: "In Recovery Mode?",
        value: "inRecoveryMode",
      },
      {
        label: "Setup Complete?",
        value: "setupComplete",
      },
      // Add other fields as needed...
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(
      domains.map((domain) => {
        // Map your domain object to the fields structure
        return {
          domainName: domain.domainName || "",
          dateAdded: domain.dateAdded || "",
          cPanelAccountId: domain.cPanelAccountId || "",
          cPanelAccountName: domain.cPanelAccountName || "",
          ipAddress: domain.ipAddress || "",
          sendingIpAddress: domain.sendingIpAddress || "",
          numberOfEmailAccounts: domain.numberOfEmailAccounts || 0,
          currentWarmupDay: domain.currentWarmupDay || 0,
          warmupLimitDaily: domain.warmupLimitDaily || 0,
          productionLimitDaily: domain.productionLimitDaily || 0,
          DKIMValue: domain.DKIMValue || "",
          mtaApiKey: domain.mtaApiKey || "",
          isPurchased: domain.isPurchased || false,
          isConnectedToCPanel: domain.isConnectedToCPanel || false,
          dateConnectedToCPanel: domain.dateConnectedToCPanel || false,
          hasWebsite: domain.hasWebsite || false,
          isConnectedToInstantly: domain.isConnectedToInstantly || false,
          dateConnectedToInstantly: domain.dateConnectedToInstantly || "",
          emailAccountsCreated: domain.emailAccountsCreated || false,
          isConnectedToMTA: domain.isConnectedToMTA || false,
          isMTAApiKeySet: domain.isMTAApiKeySet || false,
          isDKIMComplete: domain.isDKIMComplete || false,
          isSendingIpAddressComplete:
            domain.isSendingIpAddressComplete || false,
          isDNSComplete: domain.isDNSComplete || false,
          isDNSNameserversComplete: domain.isDNSNameserversComplete || false,
          isLocked: domain.isLocked || false,
          inRecoveryMode: domain.inRecoveryMode || false,
          setupComplete: domain.setupComplete || false,
        };
      })
    );

    const filePath = path.join(__dirname, "../exports");
    const filename = `preWarmup-Domains-${Date.now()}.csv`;
    const fullPath = path.join(filePath, filename);

    // Ensure the 'exports' directory exists
    fs.mkdirSync(filePath, { recursive: true });

    // Write CSV to file
    fs.writeFileSync(fullPath, csv);
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    // Provide file for download
    res.download(fullPath, filename, function (err) {
      if (err) {
        // Handle error, but don't leak paths
        console.error("File download error:", err);
        res.sendStatus(404);
      } else {
        // Delete the file after download
        fs.unlink(fullPath, function (err) {
          if (err) console.error("File deletion error:", err);
        });
      }
    });
  } catch (err) {
    console.error("Error during CSV generation", err);
    return res.status(500).send({
      message: "Error genrating Instantly file",
      success: false,
      data: null,
    });
  }
};
// END Domains

// START Email Accounts

exports.emailAccountsGET = async (req, res, next) => {
  let { limit, skip, sortField, sortOrder, searchTerm } = req.body;

  limit = Number(limit);
  skip = Number(skip);
  sortField = sortField || "_id";
  sortOrder = sortOrder === "desc" ? -1 : 1;

  try {
    let sortObj = {};
    sortObj[sortField] = sortOrder;

    let query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // 'i' for case-insensitive
      const isObjectId = searchTerm.match(/^[0-9a-fA-F]{24}$/); // Check if searchTerm is a valid ObjectId

      query = {
        $or: [{ fullEmail: regex }, { cPanelAccountName: regex }],
      };

      if (isObjectId) {
        query.$or.push({ _id: searchTerm });
      }
    }

    let allEmailAccounts = await EmailAccount.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort(sortObj)
      .limit(limit)
      .skip(skip);

    let totalEmailAccounts = await EmailAccount.countDocuments(query);
    return res.status(200).send({
      message: "Success",
      success: true,
      total: totalEmailAccounts,
      data: allEmailAccounts,
    });
  } catch (error) {
    console.error("Error fetching email accounts:", error);
    return res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

exports.emailAccountsDELETEONE = async (req, res, next) => {
  const { emailAccountIdToDelete } = req.body;
  try {
    let emailAccountToDelete = await EmailAccount.findById(
      emailAccountIdToDelete
    );

    if (!emailAccountToDelete) {
      return res.status(404).send({
        message: "The Email Account was not found!",
        success: false,
        data: null,
      });
    }
    let cPanelAccount = await CPanelAccount.findOne({
      _id: emailAccountToDelete.cPanelAccountId,
    });
    let domain = await Domain.findOne({ _id: emailAccountToDelete.domainId });

    await EmailAccount.deleteOne({ _id: emailAccountIdToDelete });

    await cPanelDeleteEmailAccount(
      cPanelAccount,
      emailAccountToDelete.fullEmail
    );

    let preWarmUpDefaultSettings = await PreWarmUpDefaultSettings.findOne({});

    console.log(
      "num prew settings",
      preWarmUpDefaultSettings.numberOfEmailAccountsPerDomain
    );
    console.log("num accs", domain.numberOfEmailAccounts - 1);

    if (
      preWarmUpDefaultSettings.numberOfEmailAccountsPerDomain >
      domain.numberOfEmailAccounts - 1
    ) {
      domain.emailAccountsCreated = false;
    }
    domain.numberOfEmailAccounts = domain.numberOfEmailAccounts - 1;
    await domain.save();

    return res.status(200).send({
      message: "Successfully deleted email Account",
      success: true,
      data: null,
    });
  } catch (err) {
    console.error("Error in emailAccountsDELETEONE:", err);
    return res.status(500).send({
      message: "Error deleting email account",
      success: false,
      data: null,
    });
  }
};

exports.emailAccountsDELETEBULK = async (req, res, next) => {
  const { idsToDelete } = req.body;

  try {
    // Fetch email accounts to delete
    const emailAccountsToDelete = await EmailAccount.find({
      _id: { $in: idsToDelete },
    });
    let preWarmUpDefaultSettings = await PreWarmUpDefaultSettings.findOne({});
    // Delete each email account from cPanel
    const deletePromises = emailAccountsToDelete.map(async (emailAccount) => {
      let cPanelAccount = await CPanelAccount.findOne({
        _id: emailAccount.cPanelAccountId,
      });
      if (!cPanelAccount) {
        throw new Error(
          `CPanelAccount not found for email account ${emailAccount.fullEmail}`
        );
      }
      await cPanelDeleteEmailAccount(cPanelAccount, emailAccount.fullEmail);
      // Optionally, handle the response or errors
    });

    await Promise.all(deletePromises);

    // Bulk delete email accounts in the database
    await EmailAccount.deleteMany({ _id: { $in: idsToDelete } });

    // Update domain records
    const uniqueDomainIds = [
      ...new Set(emailAccountsToDelete.map((account) => account.domainId)),
    ];
    for (let domainId of uniqueDomainIds) {
      let domain = await Domain.findOne({ _id: domainId });
      if (domain) {
        let updatedEmailAccountCount = await EmailAccount.countDocuments({
          domainId: domain._id,
        });
        domain.numberOfEmailAccounts = updatedEmailAccountCount;
        domain.emailAccountsCreated = !(
          preWarmUpDefaultSettings.numberOfEmailAccountsPerDomain >
          updatedEmailAccountCount
        );
        await domain.save();
      }
    }

    return res.status(200).send({
      message: "Successfully deleted email accounts",
      success: true,
      data: null,
    });
  } catch (err) {
    console.error("Error in emailAccountsDELETEBULK:", err);
    return res.status(500).send({
      message: "Error deleting Email Accounts",
      success: false,
      data: null,
    });
  }
};

//     const {
//         cPanelAccountIdToEdit,
//         name,
//         primaryDomainName,
//         ipAddress,
//         port,
//         whmUsername,
//         whmPassword,
//         whmApiKey,
//         cPanelUsername,
//         cPanelPassword,
//         cPanelApiKey
//     } = req.body;

//     try {
//         // Check for existing combination excluding the current object
//         const existingCPanelAccount = await CPanelAccount.findOne({
//             _id: { $ne: cPanelAccountIdToEdit }, // Exclude the current object
//             name,
//             primaryDomainName,
//             ipAddress,
//             port,
//         });

//         if (existingCPanelAccount) {
//             // If combination exists, do not update
//             return res.status(409).send({ // 409 Conflict
//                 message: "Conflict: Duplicate entry with this combination of fields exists.",
//                 success: false,
//                 data: null
//             });
//         }

//         // If combination does not exist, update the entry
//         let existingObject = await CPanelAccount.findById(cPanelAccountIdToEdit);
//         if (existingObject != null) {
//             existingObject.name = name;
//             existingObject.primaryDomainName = primaryDomainName;
//             existingObject.ipAddress = ipAddress;
//             existingObject.port = port;
//             existingObject.whmUsername = whmUsername;
//             existingObject.whmPassword = whmPassword;
//             existingObject.whmApiKey = whmApiKey;
//             existingObject.cPanelUsername = cPanelUsername;
//             existingObject.cPanelPassword = cPanelPassword;
//             existingObject.cPanelApiKey = cPanelApiKey;
//             await existingObject.save();

//             return res.status(200).send({
//                 message: "Successfully edited cPanel account",
//                 success: true,
//                 data: existingObject
//             });
//         } else {
//             return res.status(404).send({
//                 message: "The cPanel account was not found!",
//                 success: false,
//                 data: null
//             });
//         }

//     } catch (err) {
//         console.error("Error in cPanelAccountsEDITONE:", err);
//         return res.status(500).send({ // Internal Server Error
//             message: "Error editing cPanel account",
//             success: false,
//             data: null
//         });
//     }
// };

// exports.cPanelAccountsDELETEONE = async (req, res, next) => {

//     const {
//         cPanelAccountIdToDelete
//     } = req.body;

//     let existingObject = await CPanelAccount.findById({ _id: cPanelAccountIdToDelete });

//     if (existingObject != null) {
//         await CPanelAccount.deleteOne({ _id: cPanelAccountIdToDelete });

//         return res.status(200).send({
//             message: "Successfully deleted cPanel account",
//             success: true,
//             data: null
//         })
//     }

//     return res.status(404).send({
//         message: "The cPanel account was not found!",
//         success: false,
//         data: null
//     })

// }

// exports.cPanelAccountsDELETEBULK = async (req, res, next) => {

//     const {
//         idsToDelete
//     } = req.body;

//     await CPanelAccount.deleteMany({ _id: { $in: idsToDelete } });

//     return res.status(200).send({
//         message: "Successfully deleted cPanel accounts",
//         success: true,
//         data: null
//     })

// }

exports.emailAccountsDOWNLOADALLDATA = async (req, res, next) => {
  try {
    let emailAccounts = await EmailAccount.find({});

    // Fields to include in the CSV
    const fields = [
      {
        label: "Full Email",
        value: "fullEmail",
      },
      {
        label: "Name",
        value: "name",
      },
      {
        label: "First Name",
        value: "firstName",
      },
      {
        label: "Last Name",
        value: "lastName",
      },
      {
        label: "Domain Name",
        value: "domainName",
      },
      {
        label: "Domain ID",
        value: "domainId",
      },
      {
        label: "Is Connected To Instantly?",
        value: "isConnectedToInstantly",
      },
      {
        label: "Date Connected To Instantly",
        value: "dateConnectedToInstantly",
      },
      {
        label: "cPanel Account ID",
        value: "cPanelAccountId",
      },
      {
        label: "cPanel Account Name",
        value: "cPanelAccountName",
      },
      {
        label: "cPanel Primary Domain Name",
        value: "cPanelPrimaryDomainName",
      },
      {
        label: "Password",
        value: "password",
      },
      {
        label: "Reply Rate",
        value: "replyRate",
      },
      {
        label: "Is Locked?",
        value: "isLocked",
      },
      {
        label: "In Recovery Mode?",
        value: "inRecoveryMode",
      },
      {
        label: "Current Warmup Day",
        value: "currentWarmupDay",
      },
      {
        label: "Warmup Limit Daily",
        value: "warmupLimitDaily",
      },
      {
        label: "Production Limit Daily",
        value: "productionLimitDaily",
      },
      {
        label: "Date Added",
        value: "dateAdded",
      },
      // Add other fields as needed...
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(
      emailAccounts.map((emailAccount) => {
        // Map your domain object to the fields structure
        return {
          fullEmail: emailAccount.fullEmail || "",
          name: emailAccount.name || "",
          firstName: emailAccount.firstName || "",
          lastName: emailAccount.lastName || "",
          domainName: emailAccount.domainName || "",
          domainId: emailAccount.domainId || "",
          isConnectedToInstantly: emailAccount.isConnectedToInstantly || false,
          dateConnectedToInstantly: emailAccount.dateConnectedToInstantly || "",
          cPanelAccountId: emailAccount.cPanelAccountId || "",
          cPanelAccountName: emailAccount.cPanelAccountName || "",
          cPanelPrimaryDomainName: emailAccount.cPanelPrimaryDomainName || "",
          password: emailAccount.password || "",
          replyRate: emailAccount.replyRate || 0,
          isLocked: emailAccount.isLocked || false,
          inRecoveryMode: emailAccount.inRecoveryMode || false,
          currentWarmupDay: emailAccount.currentWarmupDay || 0,
          warmupLimitDaily: emailAccount.warmupLimitDaily || 0,
          productionLimitDaily: emailAccount.productionLimitDaily || 0,
          dateAdded: emailAccount.dateAdded || "",
        };
      })
    );

    const filePath = path.join(__dirname, "../exports");
    const filename = `preWarmup-EmailAccounts-${Date.now()}.csv`;
    const fullPath = path.join(filePath, filename);

    // Ensure the 'exports' directory exists
    fs.mkdirSync(filePath, { recursive: true });

    // Write CSV to file
    fs.writeFileSync(fullPath, csv);
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    // Provide file for download
    res.download(fullPath, filename, function (err) {
      if (err) {
        // Handle error, but don't leak paths
        console.error("File download error:", err);
        res.sendStatus(404);
      } else {
        // Delete the file after download
        fs.unlink(fullPath, function (err) {
          if (err) console.error("File deletion error:", err);
        });
      }
    });
  } catch (err) {
    console.error("Error during CSV generation", err);
    return res.status(500).send({
      message: "Error genrating Instantly file",
      success: false,
      data: null,
    });
  }
};

// END Email Accounts
