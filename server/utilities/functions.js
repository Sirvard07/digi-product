const axios = require('axios');
const https = require('https');
const path = require('path');
const util = require("util");
const fs = require("fs");
const url = require("url");
const writeFile = util.promisify(fs.writeFile);
const FormData = require('form-data');
var parseString = require('xml2js').parseString;
const {
    CPANEL_URL_ADD_DOMAIN,
    CPANEL_FETCH_DNS_RECORDS_FOR_DOMAIN,

    NAMECHEAP_CHECK_DOMAIN_AVAILABILITY,
    NAMECHEAP_PURCHASE_DOMAIN,
    NAMECHEAP_GET_EXISTING_DNS_RECORDS_FOR_DOMAIN,
    NAMECHEAP_SET_DEFAULT_DNS,
    NAMECHEAP_UPDATE_DNS_NAMESERVERS,
    NAMECHEAP_UPDATE_DNS_RECORDS,
    CPANEL_URL_DELETE_DOMAIN,
    CPANEL_URL_DELETE_SUBDOMAIN,
    CPANEL_URL_UNPARK_DOMAIN,
    CPANEL_URL_DELETE_DOMAIN_REDIRECT,
} = require('../utilities/constants');
const Domain = require('../models/Domain');
const CPanelAccount = require('../models/CPanelAccount');
const WarmUpGroup = require('../models/WarmUpGroup');

function parseXml (xml) {
    return new Promise((resolve, reject) => {
        parseString(xml, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}
module.exports = {
    
    parseNamecheapXMLResponse: async function (xml) {
        try {
            let result = await parseXml(xml);
            // Now that you have the result you can do further processing, write to file etc.
            return result;
        } catch (err) {
            console.error("parseXml failed: ", err);
        }
    },
    sortDNSRecordsDesc: function (records) {
        records.sort((a, b) => b.line - a.line); 
        return records;
    },
    domainsGetNextStep: function (domain) {
        const steps = [
            { key: 'isPurchased', label: 'Purchase Domain' },
            { key: 'isDNSNameserversComplete', label: 'Point Namecheap DNS to custom Nameservers' },
            { key: 'isConnectedToCPanel', label: 'Connect to cPanel' },
            { key: 'hasWebsite', label: 'Setup Website' },
            { key: 'emailAccountsCreated', label: 'Create Email Accounts' },
            { key: 'isConnectedToMTA', label: 'Connect to MTA' },
            { key: 'isMTAApiKeySet', label: 'Upload MTA API Key' },
            { key: 'isDKIMComplete', label: 'Upload DKIM record'},
            { key: 'isSendingIpAddressComplete', label: 'Upload Domain Sending IP Addresses'},
            { key: 'isDNSComplete', label: 'Complete DNS Setup' },
            { key: 'isConnectedToInstantly', label: 'Connect to Instantly' },
          ];

        for (var i = 0; i < steps.length; i++){
            if (!domain[steps[i]["key"]]){
                return i;
            }
        }
    },
    domainsIsComplete: function (domain) {
        const steps = [
            { key: 'isPurchased', label: 'Purchase Domain' },
            { key: 'isDNSNameserversComplete', label: 'Point Namecheap DNS to custom Nameservers' },
            { key: 'isConnectedToCPanel', label: 'Connect to cPanel' },
            { key: 'hasWebsite', label: 'Setup Website' },
            { key: 'emailAccountsCreated', label: 'Create Email Accounts' },
            { key: 'isConnectedToMTA', label: 'Connect to MTA' },
            { key: 'isMTAApiKeySet', label: 'Upload MTA API Key' },
            { key: 'isDKIMComplete', label: 'Upload DKIM record'},
            { key: 'isSendingIpAddressComplete', label: 'Upload Domain Sending IP Addresses'},
            { key: 'isDNSComplete', label: 'Complete DNS Setup' },
            { key: 'isConnectedToInstantly', label: 'Connect to Instantly' },
          ];

        for (var i = 0; i < steps.length; i++){
            if (!domain[steps[i]["key"]]){
                return false;
            }
        }
        return true;
    },
    cPanelFileUpload: async function (cPanelAccountId, domainName, localFilePath) {
        
        let cPanelObject = await CPanelAccount.findOne({_id: cPanelAccountId});
        let cPanelUrl = cPanelObject.primaryDomainName;
        let cPanelUsername = cPanelObject.cPanelUsername;
        let cPanelApiKey = cPanelObject.cPanelPassword;

        const cPanelFilePath = `public_html/${domainName}`; // Or the path where you want to upload in cPanel
        const zipFilePathInCpanel = `public_html/${domainName}/demo-website.zip`; // Adjust the path and filename

        const form = new FormData();
        form.append('dir', cPanelFilePath);
        form.append('file-1', fs.createReadStream(localFilePath));
        // form.append('file', fs.createReadStream(localFilePath), {
        //     filename: 'demo-website.zip',
        //     contentType: 'application/zip'
        // });
        if (!fs.existsSync(localFilePath)) {
            console.error('File not found:', localFilePath);
            return;
        }

            // Calculate content length asynchronously
        const getFormHeaders = (form) => {
            return new Promise((resolve, reject) => {
                form.getLength((err, length) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            ...form.getHeaders(),
                            'Content-Length': length
                        });
                    }
                });
            });
        };
        try {
            const headers = await getFormHeaders(form);

            const response = await axios.post(`https://${cPanelUrl}:2083/execute/Fileman/upload_files`, form, {
                auth: { username: cPanelUsername, password: cPanelApiKey },
                headers: headers,
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            });
            console.log('File uploaded:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error uploading file:', error);
            return null;
        }
    },
    cPanelFileExtract: async function (cPanelAccountId, domainName) {
        let cPanelObject = await CPanelAccount.findOne({_id: cPanelAccountId});
        let cPanelUrl = cPanelObject.primaryDomainName;
        let cPanelUsername = cPanelObject.cPanelUsername;
        let cPanelApiKey = cPanelObject.cPanelPassword;
    
        const cPanelFilePath = `/home/${cPanelUsername}/public_html/${domainName}`;
        const zipFilePathInCpanel = `${cPanelFilePath}/demo-website.zip`;
    
        try {
            const response = await axios.get(`https://${cPanelUrl}:2083/json-api/cpanel`, {
                params: {
                    cpanel_jsonapi_user: cPanelUsername,
                    cpanel_jsonapi_apiversion: 2,
                    cpanel_jsonapi_module: 'Fileman',
                    cpanel_jsonapi_func: 'fileop',
                    op: 'extract',
                    sourcefiles: zipFilePathInCpanel,
                    destfiles: cPanelFilePath
                },
                auth: { username: cPanelUsername, password: cPanelApiKey },
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            });
            console.log('File extracted:', response.data);
            return response.data.cpanelresult;
        } catch (error) {
            console.error('Error extracting file:', error);
            return null;
        }
    },
    cPanelFileDelete: async function (cPanelAccountId, domainName) {
        let cPanelObject = await CPanelAccount.findOne({_id: cPanelAccountId});
        let cPanelUrl = cPanelObject.primaryDomainName;
        let cPanelUsername = cPanelObject.cPanelUsername;
        let cPanelApiKey = cPanelObject.cPanelPassword;
    
        const zipFilePathInCpanel = `/home/${cPanelUsername}/public_html/${domainName}/demo-website.zip`; // Adjust the path and filename
    
        try {
            const response = await axios.get(`https://${cPanelUrl}:2083/json-api/cpanel`, {
                params: {
                    cpanel_jsonapi_user: cPanelUsername,
                    cpanel_jsonapi_apiversion: 2,
                    cpanel_jsonapi_module: 'Fileman',
                    cpanel_jsonapi_func: 'fileop',
                    op: 'unlink',
                    sourcefiles: zipFilePathInCpanel
                },
                auth: { username: cPanelUsername, password: cPanelApiKey },
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            });
            console.log('File deleted:', response.data.cpanelresult);
            return response.data.cpanelresult;
        } catch (error) {
            console.error('Error deleting file:', error);
            return null;
        }
    },
    cPanelAddDomain: async function (domainId, newDomain, cPanelId) {
        try {
            let cPanelObject = await CPanelAccount.findOne({_id: cPanelId});
            // console.log(cPanelObject);
            const addDomainResponse = await axios({
                method: CPANEL_URL_ADD_DOMAIN.method,
                timeout: 60000,
                httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: false }),
                url: CPANEL_URL_ADD_DOMAIN.url(cPanelObject, newDomain),
                headers: CPANEL_URL_ADD_DOMAIN.headers(cPanelObject)
            });
            console.log(addDomainResponse);

            console.log("Domain Result Successfull", addDomainResponse.data.cpanelresult.data);
            if (!addDomainResponse.data.cpanelresult.error){
                await Domain.updateOne({
                    _id: domainId
                }, 
                { 
                    $set: { 
                        isConnectedToCPanel: true,
                        dateConnectedToCPanel: new Date()
                    } 
                }); 
            }
            return;
        } catch (err) {
            if (err.response) {
                // The server responded with a status code outside the 2xx range
                console.error("Server Response Error:", err.response.status, err.response.data);
            } else if (err.request) {
                // The request was made but no response was received
                console.error("No Response:", err);
            } else {
                // Something else caused an error
                console.error("Error:", err.message);
            }
            return null;
        }
    },
    cPanelDeleteDomain: async function (cPanelAccount, domainName) {
        try {
            
            const deleteDomainResponse = await axios({
                method: CPANEL_URL_DELETE_DOMAIN.method,
                timeout: 60000,
                httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: false }),
                url: CPANEL_URL_DELETE_DOMAIN.url(cPanelAccount, domainName),
                headers: CPANEL_URL_DELETE_DOMAIN.headers(cPanelAccount)
            });

            console.log("Delete Domain Result Successfull", deleteDomainResponse.data.cpanelresult.data);
            // if (!deleteDomainResponse.data.cpanelresult.error && deleteDomainResponse.data.cpanelresult.data.result){
            //     await Domain.deleteOne({
            //         domainName: domainName
            //     }); 
            // }
            return;
        } catch (err) {
            if (err.response) {
                // The server responded with a status code outside the 2xx range
                console.error("Server Response Error:", err.response.status, err.response.data);
            } else if (err.request) {
                // The request was made but no response was received
                console.error("No Response:", err);
            } else {
                // Something else caused an error
                console.error("Error:", err.message);
            }
            return null;
        }
    },
    cPanelDeleteSubDomain: async function (cPanelAccount, domainName) {
        try {
            
            const deleteDomainResponse = await axios({
                method: CPANEL_URL_DELETE_SUBDOMAIN.method,
                timeout: 60000,
                httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: false }),
                url: CPANEL_URL_DELETE_SUBDOMAIN.url(cPanelAccount, domainName),
                headers: CPANEL_URL_DELETE_SUBDOMAIN.headers(cPanelAccount)
            });

            console.log("Delete Domain Result Successfull", deleteDomainResponse.data.cpanelresult.data);
            // if (!deleteDomainResponse.data.cpanelresult.error && deleteDomainResponse.data.cpanelresult.data.result){
            //     await Domain.deleteOne({
            //         domainName: domainName
            //     }); 
            // }
            return;
        } catch (err) {
            if (err.response) {
                // The server responded with a status code outside the 2xx range
                console.error("Server Response Error:", err.response.status, err.response.data);
            } else if (err.request) {
                // The request was made but no response was received
                console.error("No Response:", err);
            } else {
                // Something else caused an error
                console.error("Error:", err.message);
            }
            return null;
        }
    },
    cPanelUnparkDomain: async function (cPanelAccount, domainName) {
        try {
            
            const deleteDomainResponse = await axios({
                method: CPANEL_URL_UNPARK_DOMAIN.method,
                timeout: 60000,
                httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: false }),
                url: CPANEL_URL_UNPARK_DOMAIN.url(cPanelAccount, domainName),
                headers: CPANEL_URL_UNPARK_DOMAIN.headers(cPanelAccount)
            });

            console.log("Delete Domain Result Successfull", deleteDomainResponse.data.cpanelresult.data);
            // if (!deleteDomainResponse.data.cpanelresult.error && deleteDomainResponse.data.cpanelresult.data.result){
            //     await Domain.deleteOne({
            //         domainName: domainName
            //     }); 
            // }
            return;
        } catch (err) {
            if (err.response) {
                // The server responded with a status code outside the 2xx range
                console.error("Server Response Error:", err.response.status, err.response.data);
            } else if (err.request) {
                // The request was made but no response was received
                console.error("No Response:", err);
            } else {
                // Something else caused an error
                console.error("Error:", err.message);
            }
            return null;
        }
    },
    cPanelDeleteDomainRedirect: async function (cPanelAccount, domainName) {
        try {
            
            const deleteDomainResponse = await axios({
                method: CPANEL_URL_DELETE_DOMAIN_REDIRECT.method,
                timeout: 60000,
                httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: false }),
                url: CPANEL_URL_DELETE_DOMAIN_REDIRECT.url(cPanelAccount, domainName),
                auth: CPANEL_URL_DELETE_DOMAIN_REDIRECT.auth(cPanelAccount)
            });

            console.log("Delete Domain Result Successfull", deleteDomainResponse.data);
            // if (!deleteDomainResponse.data.cpanelresult.error && deleteDomainResponse.data.cpanelresult.data.result){
            //     await Domain.deleteOne({
            //         domainName: domainName
            //     }); 
            // }
            return;
        } catch (err) {
            if (err.response) {
                // The server responded with a status code outside the 2xx range
                console.error("Server Response Error:", err.response.status, err.response.data);
            } else if (err.request) {
                // The request was made but no response was received
                console.error("No Response:", err);
            } else {
                // Something else caused an error
                console.error("Error:", err.message);
            }
            return null;
        }
    },
    cPanelCreateEmailAccount: async function (cPanelAccount, emailAccountName, domain, emailPassword) {
        try {
            const response = await axios.post(`https://${cPanelAccount.ipAddress}:2083/execute/Email/add_pop`, {
                email: emailAccountName,
                domain: domain,
                password: emailPassword,
                quota: 0  // 0 for unlimited, or set a specific quota
            }, {
                auth: { username: cPanelAccount.cPanelUsername, password: cPanelAccount.cPanelPassword },
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            });
    
            console.log('Email account created:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating email account:', error);
        }
    },
    cPanelDeleteEmailAccount: async function(cPanelAccount, emailAccount) {
        try {
            const response = await axios.post(`https://${cPanelAccount.ipAddress}:2083/execute/Email/delete_pop`, {
                email: `${emailAccount}`,
            }, {
                auth: {
                    username: cPanelAccount.cPanelUsername,
                    password: cPanelAccount.cPanelPassword
                },
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            });
    
            console.log('Email account deleted:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error deleting email account:', error);
            return null;
        }
    },
    cPanelDNSFetchZoneRecords: async function (cPanelAccount, domainName) {
        try {
            const response = await axios.get(`https://${cPanelAccount.ipAddress}:2087/json-api/cpanel`, {
                params: {
                    cpanel_jsonapi_user: cPanelAccount.cPanelUsername,
                    cpanel_jsonapi_apiversion: 2,
                    cpanel_jsonapi_module: 'ZoneEdit',
                    cpanel_jsonapi_func: 'fetchzone_records',
                    domain: domainName
                },
                headers: {
                    Authorization: `whm ${cPanelAccount.whmUsername}:${cPanelAccount.whmApiKey}`
                },
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            });
            // console.log("response.data", response.data.cpanelresult.data);
    
            return response.data.cpanelresult.data;
        } catch (error) {
            console.error('Error fetching zone records:', error);
            return [];
        }
    },
    cPanelDNSDeleteZoneRecord: async function (cPanelAccount, domainName, recordId) {
        try {
            const response = await axios.get(`https://${cPanelAccount.ipAddress}:2087/json-api/cpanel`, {
                params: {
                    cpanel_jsonapi_user: cPanelAccount.cPanelUsername,
                    cpanel_jsonapi_apiversion: 2,
                    cpanel_jsonapi_module: 'ZoneEdit',
                    cpanel_jsonapi_func: 'remove_zone_record',
                    domain: domainName,
                    line: recordId
                },
                headers: {
                    Authorization: `whm ${cPanelAccount.whmUsername}:${cPanelAccount.whmApiKey}`
                },
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            });
    
            console.log("Response data:", response.data.cpanelresult.data);
            return response.data;
        } catch (error) {
            console.error('Error deleting zone record:', error);
            return null;
        }
    },
    cPanelDNSDeleteMXRecord: async function (cPanelAccount, domainName) {
        try {
            const response = await axios.get(`https://${cPanelAccount.ipAddress}:2083/execute/Email/delete_mx`, {
                params: {
                    domain: domainName,
                    exchanger: domainName // For UAPI, use 'exchanger' instead of 'exchange'
                },
                headers: {
                    Authorization: `cpanel ${cPanelAccount.cPanelUsername}:${cPanelAccount.cPanelApiKey}`
                },
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            });
    
            console.log("Response data:", response.data);
            return response.data;
        } catch (error) {
            console.error('Error deleting mx record:', error);
            return null;
        }
    },
    cPanelDNSAddMXRecord: async function (cPanelAccount, domainName) {
        try {
            const response = await axios.get(`https://${cPanelAccount.ipAddress}:2083/execute/Email/add_mx`, {
                params: {
                    domain: domainName,
                    exchanger: "mail."+domainName,
                    priority: 1
                },
                headers: {
                    Authorization: `cpanel ${cPanelAccount.cPanelUsername}:${cPanelAccount.cPanelApiKey}`
                },
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            });
    
            console.log("Response data:", response.data);
            return response.data;
        } catch (error) {
            console.error('Error deleting mx record:', error);
            return null;
        }
    },
    cPanelDNSAddZoneRecord: async function (cPanelAccount, domainName, recordType, recordDetails) {
        try {
            const response = await axios.get(`https://${cPanelAccount.ipAddress}:2087/json-api/cpanel`, {
                params: {
                    cpanel_jsonapi_user: cPanelAccount.cPanelUsername,
                    cpanel_jsonapi_apiversion: 2,
                    cpanel_jsonapi_module: 'ZoneEdit',
                    cpanel_jsonapi_func: 'add_zone_record',
                    domain: domainName,
                    type: recordType,
                    ...recordDetails
                },
                headers: {
                    Authorization: `whm ${cPanelAccount.whmUsername}:${cPanelAccount.whmApiKey}`
                },
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            });
            console.log("response.data", response.data.cpanelresult.data);
    
            return response.data.cpanelresult.data;
        } catch (error) {
            console.error('Error fetching zone records:', error);
            return [];
        }
    },
    namecheapCheckDomainAvailability: async function (domainName, namecheapUsername, namecheapApiKey){
        let response = await axios({ 
            method: NAMECHEAP_CHECK_DOMAIN_AVAILABILITY.method,
            timeout: 60000, //optional
            httpsAgent: new https.Agent({ keepAlive: true }),
            url: NAMECHEAP_CHECK_DOMAIN_AVAILABILITY.url(domainName, namecheapUsername, namecheapApiKey),
        }).catch(function(err) {
            console.log("err2", err);
            return 
        });
        return response;
    },
    namecheapPurchaseDomain: async function (domainName, namecheapUsername, namecheapApiKey){
        let response = await axios({ 
            method: NAMECHEAP_PURCHASE_DOMAIN.method,
            timeout: 60000, //optional
            httpsAgent: new https.Agent({ keepAlive: true }),
            url: NAMECHEAP_PURCHASE_DOMAIN.url(domainName, namecheapUsername, namecheapApiKey),
        }).catch(function(err) {
            console.log("err2", err);
            return 
        });
        return response;
    },

    namecheapGetExistingDNSRecordsForDomain: async function(domainName){
        let sld = domainName.split(".")[0];
        let tld = domainName.split(".")[1];
        let response = await axios({ 
            method: NAMECHEAP_GET_EXISTING_DNS_RECORDS_FOR_DOMAIN.method,
            timeout: 60000, //optional
            httpsAgent: new https.Agent({ keepAlive: true }),
            url: NAMECHEAP_GET_EXISTING_DNS_RECORDS_FOR_DOMAIN.url(sld,tld),
        }).catch(function(err) {
            console.log("err2", err);
            return 
        });
    
        console.log("re", response.data);
    
        return response;
    },
    namecheapUpdateDNSNameserversForDomain: async function(domainId, domainName, cPanelId, namecheapUsername, namecheapApiKey){
        let sld = domainName.split(".")[0];
        let tld = domainName.split(".")[1];

        let cPanelObject = await CPanelAccount.findOne({_id: cPanelId});
        let response = await axios({ 
            method: NAMECHEAP_UPDATE_DNS_NAMESERVERS.method,
            timeout: 60000, //optional
            httpsAgent: new https.Agent({ keepAlive: true }),
            url: NAMECHEAP_UPDATE_DNS_NAMESERVERS.url(namecheapUsername, namecheapApiKey, sld,tld, cPanelObject.primaryDomainName),
        }).catch(function(err) {
            console.log("err2", err);
            return 
        });
    
        console.log("re", response.data);
        await Domain.updateOne({
            _id: domainId
        }, 
        { 
            $set: { 
                isDNSNameserversComplete: true 
            } 
        });
        return;
        // return response;
    },
    namecheapSetBasicDNSForDomain: async function(domainId, domainName, namecheapUsername, namecheapApiKey){
        let sld = domainName.split(".")[0];
        let tld = domainName.split(".")[1];
        let response = await axios({
            method: NAMECHEAP_SET_DEFAULT_DNS.method,
            timeout: 60000, //optional
            httpsAgent: new https.Agent({ keepAlive: true }),
            url: NAMECHEAP_SET_DEFAULT_DNS.url(namecheapUsername, namecheapApiKey, sld, tld),
        }).catch(function(err) {
            console.log("Error setting default DNS:", err);
            return;
        });
    
        console.log("Response setting default DNS:", response.data);
        // Assuming you have a Domain model and you want to update its status
        await Domain.updateOne({
            _id: domainId
        }, 
        { 
            $set: { 
                isBasicDNSComplete: true 
            } 
        });
        return response.data;
    },
    namecheapUpdateDNSRecordsForDomain: async function(domainId, domainName, cPanelId, namecheapUsername, namecheapApiKey){
        let sld = domainName.split(".")[0];
        let tld = domainName.split(".")[1];
        let cPanelObject = await CPanelAccount.findOne({_id: cPanelId});
        let records = [
            { hostName: '@', type: 'A', address: cPanelObject.ipAddress, ttl: 1800 },
            { hostName: 'www', type: 'A', address: cPanelObject.ipAddress, ttl: 1800 },
            // Add other records if necessary
        ];
        
        try {
            let response = await axios({
                method: NAMECHEAP_UPDATE_DNS_RECORDS.method,
                timeout: 60000, //optional
                httpsAgent: new https.Agent({ keepAlive: true }),
                url: NAMECHEAP_UPDATE_DNS_RECORDS.url(namecheapUsername, namecheapApiKey, sld, tld, records),
            });
    
            console.log("DNS records updated successfully:", response.data);
            await Domain.updateOne({ _id: domainId }, { $set: { isBasicDNSRecordsComplete: true } });
            return response.data;
        } catch (err) {
            console.log("Error updating DNS records:", err);
            throw err;
        }
    },
    constructEmail: function(accountName, domainName) {
        let name = accountName.firstName;
        if (accountName.lastName) {
            name += "." + accountName.lastName;
        }
        let email = name += "@" + domainName;
        return email.toLowerCase();
    },
    addIssuedDomains: async function() {
        const exists = await WarmUpGroup.findOne({ priority: true });
        if(!exists) {
            const group = new WarmUpGroup({
                name: "Issued domains",
                domains: [],
                priority: true,
            });
    
            await group.save();
        }
    }
}