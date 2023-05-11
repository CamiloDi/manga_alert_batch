const { formatListDataFromNotion, updateMangaNro } = require('../libs/notion');
const { getMangaPage } = require('../clients/tonarinoyj');
const { formatUrlManga, timeZoneDate } = require('../utils');
const { activeLogs } = require('../utils/constants');
const { sendMessageTelegram } = require('../libs/telegram');
const { sendMessageDiscord } = require('../libs/discord');

const canSendDiscordMessage = JSON.parse(process.env.SEND_MESSAGE_DISCORD);

exports.haveManga = async (req, res, next) => {
    try {
        res.status = 200;
        res.json({ message: 'ok!' });
        if (activeLogs) console.log('************START***************');
        if (activeLogs) console.log(timeZoneDate());
        const { mangaDataForNotionUpdate, mangaListRequest } = await formatListDataFromNotion();
        const { html } = await getMangaPage(mangaListRequest);
        if (html) {
            console.log('good!, We have a new episode!');
            const newMessage = formatUrlManga(html);
            if (canSendDiscordMessage) sendMessageDiscord(newMessage)
            sendMessageTelegram(newMessage);
            updateMangaNro(mangaDataForNotionUpdate);
            if (activeLogs) console.log('************END*****************');
            return;
        }
    } catch (e) {
        next(e);
    }
};