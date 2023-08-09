const emoji = require('node-emoji');
const { formatListDataFromNotion, updateMangaNro } = require('../libs/notion');
const { createDriveClient, createFolder, uploadFile, searchFolder } = require('../libs/googleDrive');
const { timeZoneDate, uploadNewManga, getUrlImagesList } = require('../utils');
const { activeLogs, MANGA_UPLOAD_CONFIG, REJECTED } = require('../utils/constants');
const { getUploadManga, getMangaLinks, getMangaImage } = require('../clients/welovemanga');
const { sendMessageTelegram } = require('../libs/telegram');



exports.uploadManga = async (req, res, next) => {
    try {
        res.status = 200;
        res.json({ message: 'ok!' });
        if (activeLogs) console.log('************START***************');
        if (activeLogs) console.log(timeZoneDate());
        const { mangaUpdateFlag } = await formatListDataFromNotion();
        if (JSON.parse(mangaUpdateFlag[1].value)) {
            const gDriveClient = createDriveClient();
            MANGA_UPLOAD_CONFIG.chapter_upload = mangaUpdateFlag[0].value;

            const responseMangaUpload = await getUploadManga();
            if (uploadNewManga(responseMangaUpload, MANGA_UPLOAD_CONFIG.chapter_upload)) {
                const responseMangaList = await getMangaLinks(MANGA_UPLOAD_CONFIG.chapter_upload);
                const linksList = getUrlImagesList(responseMangaList);
                const folderRoot = await searchFolder(MANGA_UPLOAD_CONFIG.mangaFolder, gDriveClient);
                const folderChapter = await createFolder(`Chapter - ${MANGA_UPLOAD_CONFIG.chapter_upload}`, folderRoot.id, gDriveClient);
                if (folderChapter.status === 200) {
                    const { data } = folderChapter;
                    uploadAllImages(linksList, data.id, gDriveClient).then(results => {
                        const rejected = results.filter(result => result.status === REJECTED);
                        if (rejected.length) {
                            rejected.forEach(reject => {
                                console.log('----------------------------------');
                                console.log(`Page Nro ${reject.reason.index}`)
                                console.log(reject.reason);
                                console.log('----------------------------------');
                            });
                        } else {
                            sendMessageTelegram(`Manga Succesful upload to Google Drive! ${emoji.get('punch')}${emoji.get('bald_person')}`);
                            sendMessageTelegram(process.env.GOOGLE_DRIVE_FOLDER_URL);
                            mangaUpdateFlag[1].value = 'false';
                            updateMangaNro(mangaUpdateFlag);
                            console.log('Successful upload chapter!')
                        }
                    }).catch(error => {
                        if (activeLogs) console.log('We have a problem!');
                        if (activeLogs) console.error(error);
                    });
                } else {
                    if (activeLogs) console.log('We have a problem with create the folder!');
                    if (activeLogs) console.log(folderChapter);

                }

            } else {
                if (activeLogs) console.log('No upload Chapter yet!')
            }
        } else {
            if (activeLogs) console.log('No have Chapter yet!')
        }


    } catch (e) {
        console.log(e)
        next(e);
    }
};

const uploadAllImages = async (urlList, id, driveClient) => {
    const promises = urlList.map(async (url, index) => {
        try {
            if (activeLogs) console.log(`Call Page nro ${index}`, timeZoneDate());
            const responseImage = await getMangaImage(url);
            await uploadFile(`${index}`, responseImage, MANGA_UPLOAD_CONFIG.imageType, id, driveClient);
        } catch (err) {
            if (activeLogs) console.log(`Page nro ${index} have error!: `);
            if (activeLogs) console.error(err);
        }
        return Promise.resolve();
    });
    return Promise.allSettled(promises);
}