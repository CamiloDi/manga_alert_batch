
const axios = require('axios');


//Discord message
exports.sendMessageDiscord = async (message) => {
    try {
        const axiosDiscord = {
            url: process.env.URL_WEBHOOK,
            method: 'post',
            data: {
                embeds: [{
                    title: 'ALERT!!',
                    description: message,
                    color: '45973'
                }]
            }
        }
        await axios(axiosDiscord);
    } catch (ex) {
        throw ex;
    }
};