const axios = require('axios');
const { METHOD_GET } = require('../utils/constants');

const botTelegramConfig = {
    botId: process.env.BOT_ID,
    botToken: process.env.BOT_TOKEN,
    botGroup: process.env.BOT_GROUP
};

//Telegram message
exports.sendMessageTelegram = async (message) => {
    try {
        const axiosConfigTelegram = {
            url: `${process.env.URL_BASE_TELEGRAM}${botTelegramConfig.botId}:${botTelegramConfig.botToken}/sendMessage`,
            method: METHOD_GET,
            params: {
                chat_id: botTelegramConfig.botGroup,
                text: message
            }
        }
        await axios(axiosConfigTelegram);
    } catch (ex) {
        throw ex;
    }
};