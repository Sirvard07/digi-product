const cron = require("node-cron");
const { updateRecoveryMode, checkWarmUpDay } = require("../controllers/domainController");

const api_key = process.env.API_KEY;

cron.schedule("0 10 * * *", () => {
  updateRecoveryMode();
});

cron.schedule("0 10 * * *", () => {
  checkWarmUpDay();
});

// cron.schedule("* * * * *", async () => {
//   console.log("001");
//   const x = await axios.post("https://api.instantly.ai/api/v1/account/update", {
//     warmup_limit: 20,
//     email: "ro.za@marketsignals10.info",
//     api_key,
//   });
// });

// url: function () {
//   return `https://api.instantly.ai/api/v1/account/update`
// },
// method: "post",
// body: function(emailAccount) {
//   return {
//       "api_key": process.env.INSTANTLY_API_KEY,
//       "email": emailAccount.email,
//       "daily_limit": emailAccount.payload.daily_limit,
//       "sending_gap_minutes": 1,
//       "warmup_increment": "disabled",
//       "warmup_limit": 40,
//       "warmup_reply_rate_percent": 30,
//       "name": {
//           "first": emailAccount.payload.name.first,
//           "last": emailAccount.payload.name.last,
//       },
//       "reply_to": null,
//       "c_t_domain": "inst.emailyapp.com",
//       "warmup_advanced": {
//           "important_rate": 100,
//           "open_rate": 100,
//           "random_range": {
//               "min": 10,
//               "max": 20
//           },
//           "read_emulation": true,
//           "spam_save_rate": 100,
//           "warm_ctd": true,
//           "weekday_only": false
//       }
//     }
// }
