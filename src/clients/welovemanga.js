const axios = require('axios');
const { activeLogs, METHOD_GET, MANGA_UPLOAD_CONFIG } = require('../utils/constants');


exports.getUploadManga = async () => {
    try {
        const { URL_MANGA_WELOVE, PATH_LIST } = process.env;
        const axiosConfigListChapter = {
            url: `${URL_MANGA_WELOVE}${PATH_LIST}`,
            method: METHOD_GET,
        };
        const response = await axios(axiosConfigListChapter);
        return response.data;
    } catch (ex) {
        if (activeLogs) console.log(ex);
        throw new Error(ex);
    }
}

exports.getMangaLinks = async (chapter_upload) => {
    try {
        const { URL_MANGA_WELOVE, PATH_CHAPTER, REPLACE_CHAPTER } = process.env;
        const axiosConfigChapter = {
            url: `${URL_MANGA_WELOVE}${PATH_CHAPTER.replace(REPLACE_CHAPTER, chapter_upload)}`,
            method: METHOD_GET,
        };
        const response = await axios(axiosConfigChapter);
        return response.data;
    } catch (ex) {
        if (activeLogs) console.log(ex);
        throw new Error(ex);
    }
};

exports.getMangaImage = async (urlMangaImage) => {
    try {
        const axiosMangaImage = {
            url: urlMangaImage,
            method: METHOD_GET,
            responseType: MANGA_UPLOAD_CONFIG.mangaSaveDrive
        };
        const response = await axios(axiosMangaImage);
        return response.data;
    } catch (ex) {
        if (activeLogs) console.log(ex);
        throw new Error(ex);
    }
}