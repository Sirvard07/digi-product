const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { parse } = require("csv-parse");
var fs = require("fs");
const path = require("path");

const WarmupSchedule = require("../models/WarmupSchedule");
const WarmUpDefaultSettings = require("../models/WarmUpDefaultSettings");
const Domain = require("../models/Domain");
const CPanelAccount = require("../models/CPanelAccount");
const WarmupService = require("../service/warmupService");
const axios = require("axios");
const DisconnectedAccounts = require("../models/DisconnectedAccounts");

const api_key = process.env.API_KEY;

const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise((res) => setTimeout(res, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
};

// START Warmup Schedule

exports.warmupScheduleGET = async (req, res, next) => {
  try {
    let warmupSchedule = await WarmupSchedule.find({});

    return res.status(200).send({
      message: "Success",
      success: true,
      data: warmupSchedule,
    });
  } catch (error) {
    console.error("Error fetching Warmup Schedule:", error);
    return res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

exports.warmupScheduleEDIT = async (req, res, next) => {
  const { warmupSchedule } = req.body;

  try {
    await WarmupSchedule.deleteMany({});

    const newSchedules = warmupSchedule.map(({ _id, ...schedule }) => schedule);

    await WarmupSchedule.insertMany(newSchedules);

    return res.status(200).send({
      message: "Successfully edited Warmup Schedule",
      success: true,
      data: null,
    });
  } catch (err) {
    console.error("Error in warmupScheduleEDIT:", err);
    return res.status(500).send({
      // Internal Server Error
      message: "Error editing Warmup Schedule",
      success: false,
      data: null,
    });
  }
};

// END Warmup Settings

// START Default Settings

exports.defaultSettingsGET = async (req, res, next) => {
  try {
    let defaultSettings = await WarmUpDefaultSettings.findOne({});

    return res.status(200).send({
      message: "Success",
      success: true,
      data: defaultSettings,
    });
  } catch (error) {
    console.error("Error fetching Warmup Default Settings:", error);
    return res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

exports.defaultSettingsEDIT = async (req, res, next) => {
  const {
    increasePerDay,
    dailyWarmupLimit,
    disableSlowWarmup,
    replyRate,
    weekdaysOnly,
    readEmulation,
    warmCustomTrackingDomain,
    openRate,
    spamProtection,
    markImportant,
  } = req.body;

  try {
    // Check for existing combination excluding the current object
    const existingDefaultSettings = await WarmUpDefaultSettings.findOne({});

    if (existingDefaultSettings) {
      // If exists, update existing
      existingDefaultSettings.increasePerDay = increasePerDay;
      existingDefaultSettings.dailyWarmupLimit = dailyWarmupLimit;
      existingDefaultSettings.disableSlowWarmup = disableSlowWarmup;
      existingDefaultSettings.replyRate = replyRate;
      existingDefaultSettings.weekdaysOnly = weekdaysOnly;
      existingDefaultSettings.readEmulation = readEmulation;
      existingDefaultSettings.warmCustomTrackingDomain =
        warmCustomTrackingDomain;
      existingDefaultSettings.openRate = openRate;
      existingDefaultSettings.spamProtection = spamProtection;
      existingDefaultSettings.markImportant = markImportant;

      await existingDefaultSettings.save();
    } else {
      // If it doesn't exist, create a new one
      let newDefaultSettings = new WarmUpDefaultSettings({
        increasePerDay,
        dailyWarmupLimit,
        disableSlowWarmup,
        replyRate,
        weekdaysOnly,
        readEmulation,
        warmCustomTrackingDomain,
        openRate,
        spamProtection,
        markImportant,
      });
      await newDefaultSettings.save();
    }

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
        $or: [
          { domainName: regex },
          { cPanelAccountName: regex },
          { isPurchased: true },
          { isDNSNameserversComplete: true },
          { isConnectedToCPanel: true },
          { hasWebsite: true },
          { emailAccountsCreated: true },
          { isConnectedToMTA: true },
          { isMTAApiKeySet: true },
          { isDKIMComplete: true },
          { isSendingIpAddressComplete: true },
          { isDNSComplete: true },
          { isConnectedToInstantly: true },
        ],
      };

      if (isObjectId) {
        query.$or.push({ _id: searchTerm });
      }
    }
    query = Object.assign(query, {
      isPurchased: true,
      isDNSNameserversComplete: true,
      isConnectedToCPanel: true,
      hasWebsite: true,
      emailAccountsCreated: true,
      isConnectedToMTA: true,
      isMTAApiKeySet: true,
      isDKIMComplete: true,
      isSendingIpAddressComplete: true,
      isDNSComplete: true,
      isConnectedToInstantly: true,
    });
    let allDomains = await Domain.find(query)
      .collation({ locale: "en", strength: 2 })
      .populate("group")
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

exports.domainsGETALL = async (req, res, next) => {
  try {
    let allDomains = await Domain.find()
      .collation({ locale: "en", strength: 2 })
      .populate("group");

    let totalDomains = await Domain.countDocuments();
    return res.status(200).send({
      message: "Success",
      success: true,
      total: totalDomains,
      data: allDomains,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

exports.domainLock = async (req, res, next) => {
  let { id } = req.body;
  try {
    const existingDefaultSettings = await Domain.findOne({
      _id: id,
    });
    existingDefaultSettings.isLocked = true;
    existingDefaultSettings.recoveryDone = false;
    existingDefaultSettings.recoveryStartDate = null;
    await existingDefaultSettings.save();

    // let skip = 0;
    // let limit = 50;
    // let accountExists = true;
    // do {
    //   const data = await WarmupService.getInstantlyAccountsList(
    //     api_key,
    //     limit,
    //     skip
    //   );
    //   skip += limit;
    //   if (data?.data?.accounts.length) {
    //     for await (let account of data?.data?.accounts) {
    //       let domain = account.email.split("@");
    //       if (domain[1] === existingDefaultSettings.domainName) {
    //         await WarmupService.pauseWarmup(api_key, account.email);
    //       }
    //     }
    //   } else {
    //     accountExists = false;
    //   }
    // } while (accountExists);

    return res.status(200).send({
      message: "Success",
      success: true,
    });
  } catch (error) {
    console.error("Error fetching domains:", error);
    return res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

exports.domainsLock = async (req, res, next) => {
  let { newArray } = req.body;
  try {
    for await (let item of newArray) {
      const existingDefaultSettings = await Domain.findOne({
        _id: item,
      });
      existingDefaultSettings.isLocked = true;
      existingDefaultSettings.recoveryDone = false;
      existingDefaultSettings.recoveryStartDate = null;
      await existingDefaultSettings.save();
    }
    return res.status(200).send({
      message: "Success",
      success: true,
    });
  } catch (error) {
    console.error("Error fetching domains:", error);
    return res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

exports.recoveryMode = async (req, res, next) => {
  let { id, recoveryModeDay, recoveryModeDayLimitDay } = req.body;
  try {
    const existingDefaultSettings = await Domain.findOne({
      _id: id,
    });

    existingDefaultSettings.isLocked = false;
    existingDefaultSettings.recoveryDone = false;
    existingDefaultSettings.inRecoveryMode = true;
    existingDefaultSettings.inProd = false;
    existingDefaultSettings.currentWarmupDay = recoveryModeDay;
    existingDefaultSettings.recoveryModeDayLimit = recoveryModeDayLimitDay;
    existingDefaultSettings.recoveryStartDate = new Date();
    await existingDefaultSettings.save();

    // let skip = 0;
    // let limit = 50;
    // let accountExists = true;
    // do {
    //   const data = await WarmupService.getInstantlyAccountsList(
    //     api_key,
    //     limit,
    //     skip
    //   );
    //   skip += limit;
    //   if (data?.data?.accounts.length) {
    //     for await (let account of data?.data?.accounts) {
    //       let domain = account.email.split("@");
    //       if (domain[1] === existingDefaultSettings.domainName) {
    //         await WarmupService.enableWarmup(api_key, account.email);
    //       }
    //     }
    //   } else {
    //     accountExists = false;
    //   }
    // } while (accountExists);

    return res.status(200).send({
      message: "Success",
      success: true,
    });
  } catch (error) {
    console.error("Error fetching domains:", error);
    return res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

exports.endRecoveryMode = async (req, res, next) => {
  let { id } = req.body;
  try {
    const existingDefaultSettings = await Domain.findOne({
      _id: id,
    });

    existingDefaultSettings.inRecoveryMode = false;
    existingDefaultSettings.recoveryDone = true;
    existingDefaultSettings.recoveryModeDayLimit = 0;
    existingDefaultSettings.recoveryStartDate = null;
    await existingDefaultSettings.save();

    return res.status(200).send({
      message: "Success",
      success: true,
    });
  } catch (error) {
    console.error("Error fetching domains:", error);
    return res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

exports.getInstantlyChanges = async (req, res, next) => {
  try {
    let query = {};
    query = Object.assign(query, {
      isPurchased: true,
      isDNSNameserversComplete: true,
      isConnectedToCPanel: true,
      hasWebsite: true,
      emailAccountsCreated: true,
      isConnectedToMTA: true,
      isMTAApiKeySet: true,
      isDKIMComplete: true,
      isSendingIpAddressComplete: true,
      isDNSComplete: true,
      isConnectedToInstantly: true,
      isLocked: false,
    });
    let allDomains = await Domain.find(query).collation({
      locale: "en",
      strength: 2,
    });

    const instantlyChangedObj = {};

    if (allDomains.length) {
      for await (let domain of allDomains) {
        const existingDefaultSettings = await Domain.findOne({
          _id: domain.id,
        });
        if (!instantlyChangedObj[existingDefaultSettings.domainName]) {
          instantlyChangedObj[existingDefaultSettings.domainName] = [];
        }

        let warmupSchedule = {};
        warmupSchedule = Object.assign(warmupSchedule, {
          day: domain?.currentWarmupDay,
        });

        let skip = 0;
        let limit = 50;
        let accountExists = true;

        do {
          const data = await retryRequest(() =>
            WarmupService.getInstantlyAccountsList(api_key, limit, skip)
          );
          skip += limit;
          if (data?.data?.accounts.length) {
            for await (let account of data?.data?.accounts) {
              let domainFromEmail = account.email.split("@");
              if (domainFromEmail[1] === existingDefaultSettings.domainName) {
                accountExists = false;
                const replyRate = account.payload.warmup?.reply_rate;
                const replyRateAcc = instantlyChangedObj[
                  existingDefaultSettings.domainName
                ].find((item) => item.account === account.email);
                if (!replyRateAcc) {
                  instantlyChangedObj[existingDefaultSettings.domainName].push({
                    id: existingDefaultSettings._id,
                    account: account.email,
                    currentReplyRate: Number(existingDefaultSettings.replyRate),
                    changedReplyRate:
                      Number(existingDefaultSettings.replyRate) !==
                      Number(replyRate)
                        ? Number(replyRate)
                        : null,
                  });
                } else {
                  replyRateAcc.currentReplyRate = Number(
                    existingDefaultSettings.replyRate
                  );
                  replyRateAcc.changedReplyRate =
                    Number(existingDefaultSettings.replyRate) !==
                    Number(replyRate)
                      ? Number(replyRate)
                      : null;
                }

                const openRate = account.payload.warmup?.advanced?.open_rate;
                const openRateAcc = instantlyChangedObj[
                  existingDefaultSettings.domainName
                ].find((item) => item.account === account.email);
                if (!openRateAcc) {
                  instantlyChangedObj[existingDefaultSettings.domainName].push({
                    id: existingDefaultSettings._id,
                    account: account.email,
                    currentOpenRate: Number(existingDefaultSettings.openRate),
                    changedOpenRate:
                      Number(existingDefaultSettings.openRate) !==
                      Number(openRate)
                        ? Number(openRate)
                        : null,
                  });
                } else {
                  openRateAcc.currentOpenRate = Number(
                    existingDefaultSettings.openRate
                  );
                  openRateAcc.changedOpenRate =
                    Number(existingDefaultSettings.openRate) !==
                    Number(openRate)
                      ? Number(openRate)
                      : null;
                }

                const warmupLimitDaily = account.payload.warmup?.limit;
                const warmupLimitDailyAcc = instantlyChangedObj[
                  existingDefaultSettings.domainName
                ].find((item) => item.account === account.email);
                if (!warmupLimitDailyAcc) {
                  instantlyChangedObj[existingDefaultSettings.domainName].push({
                    id: existingDefaultSettings._id,
                    account: account.email,
                    currentWarmupLimitDaily: Number(
                      existingDefaultSettings.warmupLimitDaily
                    ),
                    changedWarmupLimitDaily:
                      Number(existingDefaultSettings.warmupLimitDaily) !==
                      Number(warmupLimitDaily)
                        ? Number(warmupLimitDaily)
                        : null,
                  });
                } else {
                  warmupLimitDailyAcc.currentWarmupLimitDaily = Number(
                    existingDefaultSettings.warmupLimitDaily
                  );
                  warmupLimitDailyAcc.changedWarmupLimitDaily =
                    Number(existingDefaultSettings.warmupLimitDaily) !==
                    Number(warmupLimitDaily)
                      ? Number(warmupLimitDaily)
                      : null;
                }
              }
            }
          } else {
            accountExists = false;
          }
        } while (accountExists);
        if (
          !instantlyChangedObj[existingDefaultSettings.domainName].length ||
          !instantlyChangedObj[existingDefaultSettings.domainName].find(
            (item) =>
              item.changedReplyRate ||
              item.changedOpenRate ||
              item.changedWarmupLimitDaily
          )
        ) {
          delete instantlyChangedObj[existingDefaultSettings.domainName];
        }
      }
    }

    return res.status(200).send({
      message: "Success",
      success: true,
      data: instantlyChangedObj,
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};

exports.getDisconnectedAccounts = async (req, res, next) => {
  try {
    let allDisconnectedAccounts = await DisconnectedAccounts.find();

    return res.status(200).send({
      message: "Success",
      success: true,
      data: allDisconnectedAccounts,
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};

exports.pullFromInstantly = async (req, res, next) => {
  try {
    let query = {};
    query = Object.assign(query, {
      isPurchased: true,
      isDNSNameserversComplete: true,
      isConnectedToCPanel: true,
      hasWebsite: true,
      emailAccountsCreated: true,
      isConnectedToMTA: true,
      isMTAApiKeySet: true,
      isDKIMComplete: true,
      isSendingIpAddressComplete: true,
      isDNSComplete: true,
      isConnectedToInstantly: true,
      isLocked: false,
    });
    let allDomains = await Domain.find(query);
    if (allDomains.length) {
      for await (let domain of allDomains) {
        const existingDefaultSettings = await Domain.findOne({
          _id: domain.id,
        });

        let skip = 0;
        let limit = 50;
        let accountExists = true;

        do {
          const data = await retryRequest(() =>
            WarmupService.getInstantlyAccountsList(api_key, limit, skip)
          );
          skip += limit;
          if (data?.data?.accounts.length) {
            for await (let account of data?.data?.accounts) {
              let domainFromEmail = account.email.split("@");
              if (domainFromEmail[1] === existingDefaultSettings.domainName) {
                const date = new Date().toLocaleDateString();
                const disconnectedAccount = await DisconnectedAccounts.findOne({
                  account: account.email,
                });
                if (
                  disconnectedAccount &&
                  account.status === "active" &&
                  disconnectedAccount.status !== "active"
                ) {
                  disconnectedAccount.status = "active";
                  await disconnectedAccount.save();
                }
                if (account.status !== "active") {
                  if (disconnectedAccount) {
                    const isExist = disconnectedAccount.dates.find(
                      (d) => d.date === date
                    );
                    if (!isExist) {
                      disconnectedAccount.dates.push({ date: date, count: 1 });
                    } else if (disconnectedAccount.status === "active") {
                      isExist.count += 1;
                      await DisconnectedAccounts.updateOne(
                        {
                          account: account.email,
                          "dates.date": date,
                        },
                        { $set: { "dates.$.count": isExist.count } }
                      );
                    }
                    disconnectedAccount.status = account.status;
                    await disconnectedAccount.save();
                  } else {
                    let newDisconnectedAccount = new DisconnectedAccounts({
                      account: account.email,
                      status: account.status,
                      dates: [{ date: date, count: 1 }],
                    });
                    await newDisconnectedAccount.save();
                  }
                }
              }
            }
          } else {
            accountExists = false;
          }
        } while (accountExists);
      }
    }

    return res.status(200).send({
      message: "Success",
      success: true,
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};

exports.getReputations = async (req, res, next) => {
  try {
    let query = {};
    query = Object.assign(query, {
      isPurchased: true,
      isDNSNameserversComplete: true,
      isConnectedToCPanel: true,
      hasWebsite: true,
      emailAccountsCreated: true,
      isConnectedToMTA: true,
      isMTAApiKeySet: true,
      isDKIMComplete: true,
      isSendingIpAddressComplete: true,
      isDNSComplete: true,
      isConnectedToInstantly: true,
      isLocked: false,
    });
    const reputationsData = [];
    let allDomains = await Domain.find(query);
    if (allDomains.length) {
      for await (let domain of allDomains) {
        const existingDefaultSettings = await Domain.findOne({
          _id: domain.id,
        });

        let skip = 0;
        let limit = 50;
        let accountExists = true;

        do {
          const data = await retryRequest(() =>
            WarmupService.getInstantlyAccountsList(api_key, limit, skip)
          );
          skip += limit;
          if (data?.data?.accounts.length) {
            for await (let account of data?.data?.accounts) {
              let domainFromEmail = account.email.split("@");
              if (domainFromEmail[1] === existingDefaultSettings.domainName) {
                const open_rate =
                  account.payload?.warmup?.advanced?.open_rate || 0;
                if (open_rate < 5) {
                  reputationsData.push({
                    account: account.email,
                    openRate: open_rate,
                  });
                }
              }
            }
          } else {
            accountExists = false;
          }
        } while (accountExists);
      }
    }

    return res.status(200).send({
      message: "Success",
      success: true,
      data: reputationsData,
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};

exports.updateAccountStatus = async (req, res) => {
  try {
    const { account } = req.body;
    await axios.post("https://api.instantly.ai/api/v1/account/update", {
      api_key,
      email: account,
      status: "active",
    });

    const disconnectedAccount = await DisconnectedAccounts.findOne({
      account,
    });
    disconnectedAccount.status = "active";
    disconnectedAccount.save();

    return res.status(200).send({
      message: "Account successfully updated.",
      success: true,
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};

exports.updateAccountOpenRate = async (req, res) => {
  try {
    const { account, open_rate } = req.body;

    await axios.post("https://api.instantly.ai/api/v1/account/update", {
      email: account,
      api_key,
      warmup_advanced: {
        open_rate: open_rate,
      },
    });

    return res.status(200).send({
      message: "Open rate successfully updated.",
      success: true,
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};

exports.getAnalyticsForDomainAccounts = async (req, res, next) => {
  let { id } = req.body;
  try {
    const existingDefaultSettings = await Domain.findOne({
      _id: id,
    });

    let skip = 0;
    let limit = 50;
    let accountExists = true;
    let firstAccount = null;

    do {
      const data = await retryRequest(() =>
        WarmupService.getInstantlyAccountsList(api_key, limit, skip)
      );
      skip += limit;
      if (data?.data?.accounts.length) {
        for await (let account of data?.data?.accounts) {
          let domain = account.email.split("@");
          if (domain[1] === existingDefaultSettings.domainName) {
            firstAccount = account;
            accountExists = false;
            return res.status(200).send({
              message: "Success",
              success: true,
              data: firstAccount,
            });
          }
        }
      } else {
        accountExists = false;
      }
    } while (accountExists);
    return res.status(200).send({
      message: "Success",
      success: true,
    });
  } catch (error) {
    console.error("Error fetching domains:", error);
    return res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

exports.updateAnalyticsForDomainAccounts = async (req, res, next) => {
  let { id, openRate, replyRate, dailyLimit } = req.body;
  try {
    const existingDefaultSettings = await Domain.findOne({
      _id: id,
    });

    let skip = 0;
    let limit = 50;
    let accountExists = true;

    do {
      const data = await retryRequest(() =>
        WarmupService.getInstantlyAccountsList(api_key, limit, skip)
      );
      skip += limit;
      if (data?.data?.accounts.length) {
        for await (let account of data?.data?.accounts) {
          let domain = account.email.split("@");
          if (domain[1] === existingDefaultSettings.domainName) {
            await axios.post("https://api.instantly.ai/api/v1/account/update", {
              warmup_limit: dailyLimit,
              email: account.email,
              api_key,
              warmup_reply_rate_percent: replyRate,
              warmup_advanced: {
                open_rate: openRate,
              },
            });

            let warmupSchedule = {};
            warmupSchedule = Object.assign(warmupSchedule, {
              day: existingDefaultSettings?.currentWarmupDay,
            });

            let warmupScheduleData = await WarmupSchedule.findOne(
              warmupSchedule
            ).collation({
              locale: "en",
              strength: 2,
            });

            warmupScheduleData.numberOfEmails = dailyLimit;
            await warmupScheduleData.save();
          }
        }
      } else {
        accountExists = false;
      }
    } while (accountExists);
    return res.status(200).send({
      message: "Success",
      success: true,
    });
  } catch (error) {
    console.error("Error fetching domains:", error);
    return res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

exports.addToProd = async (req, res, next) => {
  try {
    let { id } = req.body;
    const domain = await Domain.findOne({
      _id: id,
    });
    domain.inProd = true;
    domain.recoveryDone = false;
    await domain.save();

    return res.status(200).send({
      message: "Domain successfully added to prod",
      success: true,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

exports.removeFromProd = async (req, res, next) => {
  try {
    let { id } = req.body;
    const domain = await Domain.findOne({
      _id: id,
    });
    domain.inProd = false;
    await domain.save();

    return res.status(200).send({
      message: "Domain successfully removed from prod",
      success: true,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// END Domains
