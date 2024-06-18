const mongoose = require("mongoose");

const DisconnectedAccountsSchema = new mongoose.Schema(
  {
    account: String,
    status: String,
    dates: [],
  },
  {
    collection: "DisconnectedAccounts",
    timestamps: true,
  }
);

const DisconnectedAccounts = mongoose.model(
  "DisconnectedAccounts",
  DisconnectedAccountsSchema
);
module.exports = DisconnectedAccounts;
