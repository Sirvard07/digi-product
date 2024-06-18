const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");

const {
  // Warmup Schedule
  warmupScheduleGET,
  warmupScheduleEDIT,

  // Default Settings
  defaultSettingsGET,
  defaultSettingsEDIT,
  // Domains
  domainsGET,
  domainLock,
  recoveryMode,
  endRecoveryMode,
  getAnalyticsForDomainAccounts,
  domainsLock,
  updateAnalyticsForDomainAccounts,
  addToProd,
  removeFromProd,
  domainsGETALL,
  getInstantlyChanges,
  getDisconnectedAccounts,
  updateAccountStatus,
  pullFromInstantly,
  getReputations,
  updateAccountOpenRate,
} = require("../controllers/warmupController");
const {
  createWarmUpGroup,
  getWarmUpGroups,
  deleteWarmUpGroup,
  updateWarmUpGroup,
  getWarmUpGroupsByIds,
} = require("../controllers/warmupGroupController");

// Warmup Schedule
router.route("/warmup-schedule/get").post(authenticateToken, warmupScheduleGET);

router
  .route("/warmup-schedule/edit")
  .post(authenticateToken, warmupScheduleEDIT);

// Default Settings
router
  .route("/default-settings/get")
  .post(authenticateToken, defaultSettingsGET);

router
  .route("/default-settings/edit")
  .post(authenticateToken, defaultSettingsEDIT);

// Domains
router.route("/domains/get").post(authenticateToken, domainsGET);
router.route("/domains/getAll").get(authenticateToken, domainsGETALL);
router.route("/domains/lock").post(authenticateToken, domainLock);
router.route("/domains/add-to-prod").post(authenticateToken, addToProd);
router
  .route("/domains/remove-from-prod")
  .post(authenticateToken, removeFromProd);
router.route("/domains/lock-domenis").post(authenticateToken, domainsLock);
router.route("/domains/recovery-mode").post(authenticateToken, recoveryMode);
router
  .route("/domains/end-recovery-mode")
  .post(authenticateToken, endRecoveryMode);
router
  .route("/domains/get-analytics-for-domain-account")
  .post(authenticateToken, getAnalyticsForDomainAccounts);

router
  .route("/domains/update_Analytics")
  .post(authenticateToken, updateAnalyticsForDomainAccounts);

router.route("/warmup-group/get").post(authenticateToken, getWarmUpGroups);
router
  .route("/warmup-group/getByIds")
  .post(authenticateToken, getWarmUpGroupsByIds);
router.route("/warmup-group/create").post(authenticateToken, createWarmUpGroup);
router.route("/warmup-group/update").post(authenticateToken, updateWarmUpGroup);
router.route("/warmup-group/delete").post(authenticateToken, deleteWarmUpGroup);

// Reports
router
  .route("/reports/getInstantlyChanges")
  .get(authenticateToken, getInstantlyChanges);
router
  .route("/reports/getDisconnectedAccounts")
  .get(authenticateToken, getDisconnectedAccounts);
router
  .route("/reports/pullFromInstantly")
  .get(authenticateToken, pullFromInstantly);
router.route("/reports/getReputations").get(authenticateToken, getReputations);
router
  .route("/reports/updateAccountStatus")
  .post(authenticateToken, updateAccountStatus);
router
  .route("/reports/updateAccountOpenRate")
  .post(authenticateToken, updateAccountOpenRate);

module.exports = router;
