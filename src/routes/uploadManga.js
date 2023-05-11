const api = require("express")();
const controller = require("../controllers/uploadManga");

api.route("/").get(controller.uploadManga);

module.exports = api;