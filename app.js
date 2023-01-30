const { Client } = require("@notionhq/client");
const emoji = require('node-emoji')
const axios = require('axios');
const moment = require('moment');
const momentTZ = require('moment-timezone');
const dotenv = require('dotenv');
dotenv.config();

const express = require("express");
const cors = require("cors");
const app = express();

const activeLogs = JSON.parse(process.env.LOGS)
const notion = new Client({ auth: process.env.NOTION_AUTH })
const notionDatabaseId = process.env.NOTION_DB_ID;
const botTelegramConfig = {
    botId: process.env.BOT_ID,
    botToken: process.env.BOT_TOKEN,
    botGroup: process.env.BOT_GROUP
};
const dateConfig = {
    day: parseInt(process.env.DAY),
    initHour: parseInt(process.env.INIT_HOUR),
    endHour: parseInt(process.env.END_HOUR),
    timeZone: process.env.TIME_ZONE,
};

const mangaListConfig = {
    aggregate_id: '13932016480028984490',
    number_since: 0,
    number_until: 0,
    read_more_num: 1,
    type: 'episode'
};
const mangaForNotionUpdate = [{
    id: '',
    key: 'number_since',
    value: ''
},
{
    id: '',
    key: 'number_until',
    value: ''
}];
const main = async () => {
    if (activeLogs) console.log('************START***************');
    try {
        const listConfigNotion = await getPostsFromNotionDatabase();
        listConfigNotion.forEach(page => {
            mangaListConfig[page.key] = page.value;
            if (mangaForNotionUpdate[0].key === page.key) {
                mangaForNotionUpdate[0].id = page.id
                mangaForNotionUpdate[0].value = page.value
            }
            else if (mangaForNotionUpdate[1].key === page.key) {
                mangaForNotionUpdate[1].id = page.id
                mangaForNotionUpdate[1].value = page.value
            }
        });
        const now = momentTZ().tz(dateConfig.timeZone);
        const initHour = moment(now).hour(dateConfig.initHour);
        const endHour = moment(now).hour(dateConfig.endHour);
        const range = now.isBetween(initHour, endHour);
        if (now.weekday() === dateConfig.day && range) {
            const axiosConfigTonarinoyj = {
                url: 'https://tonarinoyj.jp/api/viewer/readable_products',
                method: 'get',
                params: mangaListConfig
            }
            const response = await axios(axiosConfigTonarinoyj);
            if (response.status === 200) {
                console.log('good!, We have a new episode!');
                sendMessageTelegram(
                    `good!!!!, We have a new episode! ${emoji.get('punch')}${emoji.get('bald_person')}
                https://tonarinoyj.jp/episode/316190247133138894`)
                updateMangaNro();
                return;
            }
            throw Error(response);
        }
        if (activeLogs) console.log('Not yet!!!');
        if (activeLogs) console.log('************END*****************');
    } catch (ex) {
        if (ex.response?.status === 404) {
            console.log('sorry, try later');
        }
        else {
            console.log('sorry, we have a error', ex);
        }
    }
};



// Notion get and update
const getPostsFromNotionDatabase = async () => {
    try {
        const pages = []
        let cursor = undefined
        let next_cursor = undefined
        do {
            const { results, next_cursor } = await notion.databases.query({
                database_id: notionDatabaseId,
                start_cursor: cursor,
            });
            pages.push(...results);
            cursor = next_cursor;
        } while (next_cursor != undefined);
        return pages.map(page => {
            return {
                id: page.id,
                key: page.properties.key.title[0].text.content,
                value: page.properties.value.rich_text[0].plain_text
            }
        });
    }
    catch (ex) {
        throw new Error(ex);
    }
}

const updatePostsToNotionDatabase = async (page) => {
    await notion.pages.update({
        page_id: page.id,
        properties: {
            value: { rich_text: [{ type: "text", text: { content: page.value } }] },
        }
    })
}

//Telegram message
const sendMessageTelegram = async (message) => {
    try {
        const axiosConfigTelegram = {
            url: `https://api.telegram.org/${botTelegramConfig.botId}:${botTelegramConfig.botToken}/sendMessage`,
            method: 'get',
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

//Update data for Notion
const updateMangaNro = async () => {
    await mangaForNotionUpdate.forEach(page => {
        page.value = (parseInt(page.value) + 1).toString();
        updatePostsToNotionDatabase(page);
    });
    console.log(`Nro Manga changed`)
}

const allOptions = {
    method: ["GET"],
    credentials: true,
    allowedHeaders: "X-Requested-With,content-type, resources",
    exposedHeaders: "resources",
    origin: "*",
};

app.use('/health', cors(allOptions), (req, res) => {
    res.status = 200;
    res.json({ message: 'ok!' });
});

app.use('/haveManga', cors(allOptions), (req, res) => {
    main();
    res.json();
});


app.set('port', process.env.PORT);
app.listen(app.get('port'), () => {
    if (activeLogs) {
        console.log('----------------------------------');
        console.log(`|           PORT ${app.get("port")}           |`);
        console.log(`|           SERVICE UP!!         |`);
        console.log(`| UP FROM :${momentTZ().tz(dateConfig.timeZone).toString()} |`);
        console.log('----------------------------------');
    }
});


