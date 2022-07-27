const releaseController = require("../controller/release.controller");

const router = require("express").Router();

router.post("/releases", releaseController.getReleases);

router.post("/commits", releaseController.getCommits);

module.exports = router;
