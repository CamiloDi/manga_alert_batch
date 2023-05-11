

exports.activeLogs = JSON.parse(process.env.LOGS)
exports.METHOD_GET = 'GET';
exports.REJECTED = 'rejected';

exports.MANGA_UPLOAD_CONFIG = {
    chapter_upload: 0,
    imageType: 'image/jpg',
    mangaFolder: process.env.MANGA_FOLDER,
    mangaSaveDrive: 'stream'
};

exports.HTML = {
    class: '.chapter-img',
    dataSrc: 'data-src'
}