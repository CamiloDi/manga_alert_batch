const axios = require('axios');
const { activeLogs,METHOD_GET } = require('../utils/constants');


exports.getMangaPage = async (mangaListConfig) => {
    try {
        const { URL_MANGA_BASE_TONARINOYJ, PATH_MANGA_TONARINOYJ } = process.env;
        const axiosConfigTonarinoyj = {
            url: `${URL_MANGA_BASE_TONARINOYJ}${PATH_MANGA_TONARINOYJ}`,
            method: METHOD_GET,
            params: mangaListConfig
        }
        const response = await axios(axiosConfigTonarinoyj);
        if (response.status === 200) {
            return response.data;
        }
        throw Error(response);
    } catch (ex) {
        if (ex.response?.status === 404) {
            console.log('sorry, try later');
            if (activeLogs) console.log('************END*****************');
            return {};
        }
        else {
            console.log('sorry, we have a error', ex);
            if (activeLogs) console.log('************END*****************');
            return {};
        }
    }
}