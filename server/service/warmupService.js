const axios = require("axios");

const instance = axios.create({
  baseURL: "https://api.instantly.ai/api/v1/account",
  timeout: 30000,
});

class WarmupService {
  async getInstantlyAccountsList(api_key, limit, skip) {
    const apiUrl = `/list?api_key=${api_key}&limit=${limit}&skip=${skip}`;
    const headers = {
      "Content-Type": "application/json",
    };

    return await instance.get(apiUrl, { headers });
  }

  async pauseWarmup(api_key, email) {
    const apiUrl = `/warmup/pause`;
    const headers = {
      "Content-Type": "application/json",
    };

    return await instance.post(
      apiUrl,
      {
        api_key: api_key,
        email: email,
      },
      { headers }
    );
  }

  async enableWarmup(api_key, email) {
    const apiUrl = `/warmup/enable`;
    const headers = {
      "Content-Type": "application/json",
    };

    return await instance.post(
      apiUrl,
      {
        api_key: api_key,
        email: email,
      },
      { headers }
    );
  }
}

module.exports = new WarmupService();
