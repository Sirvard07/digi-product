const DisconnectedAccounts = require("../models/DisconnectedAccounts");
const Domain = require("../models/Domain");

const WarmupSchedule = require("../models/WarmupSchedule");
const WarmupService = require("../service/warmupService");
const axios = require("axios");

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

exports.updateRecoveryMode = async (req, res, next) => {
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
      inRecoveryMode: true,
    });
    let allDomains = await Domain.find(query).collation({
      locale: "en",
      strength: 2,
    });

    if (allDomains.length) {
      for await (let domain of allDomains) {
        const existingDefaultSettings = await Domain.findOne({
          _id: domain.id,
        });
        if (Number(existingDefaultSettings?.recoveryModeDayLimit) > 0) {
          existingDefaultSettings.recoveryModeDayLimit =
            Number(existingDefaultSettings.recoveryModeDayLimit) - 1;
          if (existingDefaultSettings.recoveryModeDayLimit === 0) {
            existingDefaultSettings.inRecoveryMode = false;
            existingDefaultSettings.recoveryDone = true;
          }
          await existingDefaultSettings.save();
        }
      }
    }
  } catch (error) {
    console.error("Error fetching email account names:", error);
    return res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

exports.checkWarmUpDay = async (req, res, next) => {
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
  if (allDomains.length) {
    const instantlyChangedObj = {};
    for await (let domain of allDomains) {
      const existingDefaultSettings = await Domain.findOne({
        _id: domain.id,
      });
      if (!instantlyChangedObj[existingDefaultSettings.domainName]) {
        instantlyChangedObj[existingDefaultSettings.domainName] = [];
      }
      if (Number(domain?.currentWarmupDay) === 45) {
        existingDefaultSettings.currentWarmupDay = 0;
        await existingDefaultSettings.save();
      } else {
        existingDefaultSettings.currentWarmupDay =
          Number(existingDefaultSettings.currentWarmupDay) + 1;
        await existingDefaultSettings.save();
      }

      let warmupSchedule = {};
      warmupSchedule = Object.assign(warmupSchedule, {
        day: domain?.currentWarmupDay,
      });

      let warmupScheduleData = await WarmupSchedule.findOne(
        warmupSchedule
      ).collation({
        locale: "en",
        strength: 2,
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
              await axios.post(
                "https://api.instantly.ai/api/v1/account/update",
                {
                  warmup_limit: warmupScheduleData.numberOfEmails,
                  email: account.email,
                  api_key,
                }
              );

              if (
                !existingDefaultSettings.replyRate &&
                existingDefaultSettings.replyRate !== 0
              ) {
                const replyRate = account.payload.warmup?.reply_rate || 0;
                existingDefaultSettings.replyRate = replyRate;
                await existingDefaultSettings.save();
              }

              if (
                !existingDefaultSettings.openRate &&
                existingDefaultSettings.openRate !== 0
              ) {
                const openRate =
                  account.payload.warmup?.advanced?.open_rate || 0;
                existingDefaultSettings.openRate = openRate;
                await existingDefaultSettings.save();
              }

              if (
                !existingDefaultSettings.warmupLimitDaily &&
                existingDefaultSettings.warmupLimitDaily !== 0
              ) {
                const warmupLimitDaily = account.payload.warmup?.limit || 0;
                existingDefaultSettings.warmupLimitDaily = warmupLimitDaily;
                await existingDefaultSettings.save();
              }
            }
          }
        } else {
          accountExists = false;
        }
      } while (accountExists);
    }
  }
};
