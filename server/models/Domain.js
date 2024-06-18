const mongoose = require("mongoose");

const DomainSchema = new mongoose.Schema(
  {
    domainName: String,
    dateAdded: Date,
    cPanelAccountId: String,
    cPanelAccountName: String,
    ipAddress: String,
    sendingIpAddress: String,
    numberOfEmailAccounts: Number,
    currentWarmupDay: Number,
    openRate: Number,
    replyRate: Number,
    warmupLimitDaily: Number,
    productionLimitDaily: Number,
    DKIMValue: String,
    mtaApiKey: String,
    isPurchased: Boolean,
    isConnectedToCPanel: Boolean,
    dateConnectedToCPanel: Date,
    hasWebsite: Boolean,
    isConnectedToInstantly: Boolean,
    dateConnectedToInstantly: Date,
    emailAccountsCreated: Boolean,
    isConnectedToMTA: Boolean,
    isMTAApiKeySet: Boolean,
    isDKIMComplete: Boolean,
    isSendingIpAddressComplete: Boolean,
    isDNSComplete: Boolean,
    isDNSNameserversComplete: Boolean,
    groupId: String,
    isLocked: Boolean,
    setupComplete: Boolean,
    inRecoveryMode: Boolean,
    recoveryModeDayLimit: Number,
    recoveryDone: Boolean,
    recoveryStartDate: Date,
    inProd: Boolean,
    group: { type: mongoose.Types.ObjectId, ref: "WarmUpGroup" },
  },
  {
    collection: "Domain",
    timestamps: true,
  }
);

const Domain = mongoose.model("Domain", DomainSchema);
module.exports = Domain;
