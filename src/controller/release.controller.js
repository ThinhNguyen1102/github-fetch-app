const {
  fetchCommitFromRelease,
  fetchReleaseFromUrl,
} = require("./releaseHandle");

const releaseController = {
  getReleases: async (req, res, next) => {
    const releaseUrl = req.body.releaseUrl;

    if (!releaseUrl) {
      throw new Error("Release url invalid.");
    }

    try {
      const releases = await fetchReleaseFromUrl(releaseUrl);
      res.status(200).json({
        success: true,
        message: "get releases successfully.",
        data: releases,
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },

  getCommits: async (req, res, next) => {
    const release = req.body.release;

    if (!release) {
      throw new Error("Release invalid.");
    }

    try {
      const commits = await fetchCommitFromRelease(release);
      res.status(200).json({
        success: true,
        message: "get commits successfully.",
        data: commits,
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },
};

module.exports = releaseController;
