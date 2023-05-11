const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_AUTH })
const notionDatabaseId = process.env.NOTION_DB_ID;

const mangaListRequest = {
    aggregate_id: '13932016480028984490',
    number_since: 0,
    number_until: 0,
    read_more_num: 1,
    type: 'episode'
};
const mangaDataForNotionUpdate = [{
    id: '',
    key: 'number_since',
    value: ''
},
{
    id: '',
    key: 'number_until',
    value: ''
},
{
    id: '',
    key: 'search_chapter',
    value: 'true'
}];

const mangaUpdateFlag = [
    {
        id: '',
        key: 'chapter_upload',
        value: ''
    },
    {
        id: '',
        key: 'search_chapter',
        value: 'false'
    }
]


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
};

const updatePostsToNotionDatabase = async (page) => {
    await notion.pages.update({
        page_id: page.id,
        properties: {
            value: { rich_text: [{ type: "text", text: { content: page.value } }] },
        }
    })
};

//Update data for Notion
exports.updateMangaNro = async (mangaForNotionUpdate) => {
    await mangaForNotionUpdate.forEach(page => {
        if (page.key !== 'search_chapter') {
            page.value = (parseInt(page.value) + 1).toString();
        }
        updatePostsToNotionDatabase(page);
    });
    console.log(`Nro Manga changed`);
};

exports.formatListDataFromNotion = async () => {
    const listConfigNotion = await getPostsFromNotionDatabase();
    await listConfigNotion.forEach(async page => {
        mangaListRequest[page.key] = page.value;
        await mangaDataForNotionUpdate.forEach(mangaData => {
            if (mangaData.key === page.key) {
                //Logic for request
                mangaData.id = page.id
                //Logic For haveManga
                mangaData.value = page.key !== 'search_chapter' ? page.value : mangaData.value;
            }
        });
        //Logic for UploadManga
        mangaUpdateFlag[0].id = page.key === 'chapter_upload' ? page.id : mangaUpdateFlag[0].id;
        mangaUpdateFlag[0].value = page.key === 'chapter_upload' ? page.value : mangaUpdateFlag[0].value;
        mangaUpdateFlag[1].id = page.key === 'search_chapter' ? page.id : mangaUpdateFlag[1].id;
        mangaUpdateFlag[1].value = page.key === 'search_chapter' ? 'true' : mangaUpdateFlag[1].value;
    });
    return { mangaDataForNotionUpdate, mangaListRequest, mangaUpdateFlag };
}