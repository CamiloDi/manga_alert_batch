const api = require("express")();


const controller = require("../controllers/haveManga");
api.route("/").get(controller.haveManga);
module.exports = api;
