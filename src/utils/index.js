const momentTZ = require('moment-timezone');
const emoji = require('node-emoji');
const HTMLParser = require('node-html-parser');
const { HTML} = require('./constants');

const dateConfig = {
    timeZone: process.env.TIME_ZONE,
    format: 'DD-MM-YYYY HH:mm:ss'
};

//formatMessage
exports.formatUrlManga = (html) => {
    const { URL_MANGA_BASE_TONARINOYJ, PATH_MANGA_TONARINOYJ_MESSAGE } = process.env;
    const removeN = html.replace(/\n/g, '');
    const removeHref = removeN.split('href="')[1];
    let urlManga = removeHref.split('"')[0];
    urlManga = urlManga ? urlManga : `${URL_MANGA_BASE_TONARINOYJ}${PATH_MANGA_TONARINOYJ_MESSAGE}`;
    return `Good!!!!, We have a new episode! ${emoji.get('punch')}${emoji.get('bald_person')}
                ${urlManga}`
};

// TimeZone Date
exports.timeZoneDate = () => {
    return momentTZ().tz(dateConfig.timeZone).format(dateConfig.format);
}

// Upload new manga
exports.uploadNewManga = (html, chapter) => {
    return html.toString().includes(`chapter ${chapter}`)
};

exports.getUrlImagesList = (htmlPage) => {
    const root = HTMLParser.parse(htmlPage);
    const urlList = [];
    root.querySelectorAll(HTML.class).forEach(html => {
        urlList.push(html.attrs[HTML.dataSrc]);
    });
    return urlList;
};

