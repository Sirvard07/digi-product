

module.exports = {
    CPANEL_URL_ADD_DOMAIN: {
        url: function (cPanelObject, newDomain) {
            return `https://${cPanelObject.ipAddress}:2087/json-api/cpanel?cpanel_jsonapi_user=${cPanelObject.cPanelUsername}&cpanel_jsonapi_apiversion=2&cpanel_jsonapi_module=AddonDomain&cpanel_jsonapi_func=addaddondomain&dir=${encodeURIComponent(`/${newDomain}`)}&newdomain=${encodeURIComponent(newDomain)}&subdomain=${encodeURIComponent(newDomain)}`;
        },
        method: "get",
        headers: function(cPanelObject) {
            return {
                Authorization: `whm ${cPanelObject.whmUsername}:${cPanelObject.whmApiKey}`
            }
        },
    },
    CPANEL_URL_DELETE_DOMAIN: {
        url: function (cPanelObject, domainName) {
            return `https://${cPanelObject.ipAddress}:2087/json-api/cpanel?cpanel_jsonapi_user=${cPanelObject.cPanelUsername}&cpanel_jsonapi_apiversion=2&cpanel_jsonapi_module=AddonDomain&cpanel_jsonapi_func=deladdondomain&domain=${domainName}&subdomain=${domainName}.${cPanelObject.primaryDomainName}`;
        },
        method: "get",
        headers: function(cPanelObject) {
            return {
                Authorization: `whm ${cPanelObject.whmUsername}:${cPanelObject.whmApiKey}`
            }
        },
    },
    CPANEL_URL_DELETE_SUBDOMAIN: {
        url: function (cPanelObject, domainName) {
            return `https://${cPanelObject.ipAddress}:2087/json-api/cpanel?cpanel_jsonapi_user=${cPanelObject.cPanelUsername}&cpanel_jsonapi_apiversion=2&cpanel_jsonapi_module=SubDomain&cpanel_jsonapi_func=delsubdomain&domain=${domainName}.${cPanelObject.primaryDomainName}`;
        },
        method: "get",
        headers: function(cPanelObject) {
            return {
                Authorization: `whm ${cPanelObject.whmUsername}:${cPanelObject.whmApiKey}`
            }
        },
    },
    CPANEL_URL_UNPARK_DOMAIN: {
        url: function (cPanelObject, domainName) {
            return `https://${cPanelObject.ipAddress}:2087/json-api/cpanel?cpanel_jsonapi_user=${cPanelObject.cPanelUsername}&cpanel_jsonapi_apiversion=2&cpanel_jsonapi_module=Park&cpanel_jsonapi_func=unpark&domain=${domainName}.${cPanelObject.primaryDomainName}`;
        },
        method: "get",
        headers: function(cPanelObject) {
            return {
                Authorization: `whm ${cPanelObject.whmUsername}:${cPanelObject.whmApiKey}`
            }
        },
    },
    CPANEL_URL_DELETE_DOMAIN_REDIRECT: {
        url: function (cPanelObject, domainName) {
            return `https://${cPanelObject.ipAddress}:2083/execute/Mime/delete_redirect?domain=${domainName}`;
        },
        method: "get",
        auth: function(cPanelObject) { 
            return {
                username: cPanelObject.cPanelUsername, 
                password: cPanelObject.cPanelPassword 
            }
        },
    },
    CPANEL_FETCH_DNS_RECORDS_FOR_DOMAIN: {
        url: function (cPanelObject, domainName) {
            return `https://${cPanelObject.ipAddress}:2087/json-api/dumpzone?api.version=1&domain=${domainName}`;
        },
        method: "get",
        headers: function(cPanelObject) {
            return {
                Authorization: `whm ${cPanelObject.whmUsername}:${cPanelObject.whmApiKey}`
            }
        },
    },
    NAMECHEAP_CHECK_DOMAIN_AVAILABILITY: {
        url: function (domainName, namecheapUsername, namecheapApiKey) {
            return `https://api.namecheap.com/xml.response?ApiUser=${namecheapUsername}&ApiKey=${namecheapApiKey}&UserName=${namecheapUsername}&Command=namecheap.domains.check&ClientIp=${process.env.SERVER_IP_ADDRESS}&DomainList=${domainName}`
        },
        method: "get"
    },
    NAMECHEAP_PURCHASE_DOMAIN: {
        url: function (domainName, namecheapUsername, namecheapApiKey) {
            return `https://api.namecheap.com/xml.response?ApiUser=${namecheapUsername}&ApiKey=${namecheapApiKey}&UserName=${namecheapUsername}&Command=namecheap.domains.create&ClientIp=${process.env.SERVER_IP_ADDRESS}&DomainName=${domainName}&Years=1&AuxBillingFirstName=Greg&AuxBillingLastName=Weitzman&AuxBillingAddress1=90%20North%20Church%20St&AuxBillingStateProvince=NA&AuxBillingPostalCode=KY1-1102&AuxBillingCountry=KY&AuxBillingPhone=+1.3056868087&AuxBillingEmailAddress=greg@digiclicks.ky&AuxBillingCity=George%20Town&TechFirstName=Greg&TechLastName=Weitzman&TechAddress1=90%20North%20Church%20St&TechStateProvince=NA&TechPostalCode=KY1-1102&TechCountry=KY&TechPhone=+1.3056868087&TechEmailAddress=greg@digiclicks.ky&TechCity=George%20Town&AdminFirstName=Greg&AdminLastName=Weitzman&AdminAddress1=90%20North%20Church%20St&AdminStateProvince=NA&AdminPostalCode=KY1-1102&AdminCountry=KY&AdminPhone=+1.3056868087&AdminEmailAddress=greg@digiclicks.ky&AdminCity=George%20Town&RegistrantFirstName=Greg&RegistrantLastName=Weitzman&RegistrantAddress1=90%20North%20Church%20St&RegistrantStateProvince=NA&RegistrantPostalCode=KY1-1102&RegistrantCountry=KY&RegistrantPhone=+1.3056868087&RegistrantEmailAddress=greg@digiclicks.ky&RegistrantCity=George%20Town&AddFreeWhoisguard=yes&WGEnabled=yes&GenerateAdminOrderRefId=False&PromotionCode=HONEY`
        },
        method: "get"
    },
    NAMECHEAP_GET_EXISTING_DNS_RECORDS_FOR_DOMAIN: {
        url: function (namecheapUsername, namecheapApiKey, sld, tld) {
            return `https://api.namecheap.com/xml.response?ApiUser=${namecheapUsername}&ApiKey=${namecheapApiKey}&UserName=${namecheapUsername}&Command=namecheap.domains.dns.getHosts&ClientIp=${process.env.SERVER_IP_ADDRESS}&SLD=${sld}&TLD=${tld}`
        },
        method: "get"
    },
    NAMECHEAP_UPDATE_DNS_NAMESERVERS: {
        url: function (namecheapUsername, namecheapApiKey, sld, tld, cPanelPrimaryDomain) {
            return `https://api.namecheap.com/xml.response?ApiUser=${namecheapUsername}&ApiKey=${namecheapApiKey}&UserName=${namecheapUsername}&ClientIp=${process.env.SERVER_IP_ADDRESS}&Command=namecheap.domains.dns.setCustom&SLD=${sld}&TLD=${tld}&Nameservers=ns1.${cPanelPrimaryDomain},ns2.${cPanelPrimaryDomain}`;
        },
        method: "get"
    },
    NAMECHEAP_UPDATE_DNS_RECORDS: {
        url: function (namecheapUsername, namecheapApiKey, sld, tld, records) {
            let url = `https://api.namecheap.com/xml.response?ApiUser=${namecheapUsername}&ApiKey=${namecheapApiKey}&UserName=${namecheapUsername}&ClientIp=${process.env.SERVER_IP_ADDRESS}&Command=namecheap.domains.dns.setHosts&SLD=${sld}&TLD=${tld}`;
            // Add record parameters to the URL
            records.forEach((record, index) => {
                url += `&HostName${index + 1}=${record.hostName}&RecordType${index + 1}=${record.type}&Address${index + 1}=${record.address}&TTL${index + 1}=${record.ttl}`;
            });
            return url;
        },
        method: "get"
    },
    NAMECHEAP_SET_DEFAULT_DNS: {
        url: function (namecheapUsername, namecheapApiKey, sld, tld) {
            return `https://api.namecheap.com/xml.response?ApiUser=${namecheapUsername}&ApiKey=${namecheapApiKey}&UserName=${namecheapUsername}&ClientIp=${process.env.SERVER_IP_ADDRESS}&Command=namecheap.domains.dns.setDefault&SLD=${sld}&TLD=${tld}`;
        },
        method: "get"
    }
};