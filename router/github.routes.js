const express = require("express");
const githutbController = require("../controller/githubApiController")

const githubRoute = express.Router();


githubRoute.post("/github",githutbController.saveGitHubData);
githubRoute.get("/github/:id",githutbController.getGitHubDataById);


module.exports = {githubRoute}