const { Octokit } = require("octokit");

const octokit = new Octokit({
  auth: "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",
});

const fetchReleaseFromUrl = async (url, page = 1, releaseList = []) => {
  const urlSplit = url.split("https://github.com/")[1].split("/");
  const owner = urlSplit[0];
  const repo = urlSplit[1];

  try {
    const result = await octokit.request("GET /repos/{owner}/{repo}/releases", {
      owner: owner,
      repo: repo,
      per_page: 5,
      page: page,
    });

    if (result.data.length === 0) {
      return releaseList;
    }

    const releasesFetch = handleReleasesData(result.data, owner, repo);
    releaseList = [...releaseList, ...releasesFetch];
    return fetchReleaseFromUrl(url, page + 1, releaseList);
  } catch (err) {
    throw err;
  }
};

const handleReleasesData = (dataRaw, owner, repo) => {
  const data = dataRaw.map((val, index) => {
    const release = {
      url: val.url,
      htmlUrl: val.html_url,
      author: {
        name: val.author.login,
        url: val.author.html_url,
      },
      tagName: val.tag_name,
      name: val.name,
      changelog: val.body,
      id: val.id,
      owner: owner,
      repo: repo,
      createdAt: val.created_at,
      publishedAt: val.published_at,
    };
    if (index < dataRaw.length - 1) {
      return {
        ...release,
        prevReleaseTagName: dataRaw[index + 1].tag_name,
      };
    } else {
      return { ...release, prevReleaseTagName: null };
    }
  });

  return data;
};

const handleCommitsData = (dataRaw) => {
  const data = dataRaw.map((val) => {
    return {
      sha: val.sha,
      url: val.url,
      htmlUrl: val.html_url,
      committer: val.commit.committer.name,
      commitedDate: val.commit.committer.date,
      message: val.commit.message,
    };
  });
  return data;
};

const fetchCommitFromRelease = async (release, page = 1, commitList = []) => {
  const { owner, repo, prevReleaseTagName, tagName } = release;

  if (!prevReleaseTagName) {
    try {
      const result = await fetchCommitFirstRelease(release);
      return result;
    } catch (err) {
      throw err;
    }
  }

  try {
    const result = await octokit.request(
      `GET /repos/{owner}/{repo}/compare/${prevReleaseTagName}...${tagName}`,
      {
        owner: owner,
        repo: repo,
        per_page: 5,
        page: page,
      }
    );

    if (result.data.commits.length === 0) {
      return commitList;
    }

    const commitFetch = handleCommitsData(result.data.commits);
    commitList = [...commitList, ...commitFetch];
    console.log(commitList.length);
    return fetchCommitFromRelease(release, page + 1, commitList);
  } catch (err) {
    throw err;
  }
};

const fetchCommitsRepo = async (owner, repo, page = 1, commitList = []) => {
  try {
    const result = await octokit.request("GET /repos/{owner}/{repo}/commits", {
      owner: owner,
      repo: repo,
      per_page: 100,
      page: page,
    });

    if (result.data.length === 0) {
      return commitList;
    }

    const commitFetch = handleCommitsData(result.data);
    commitList = [...commitList, ...commitFetch];
    console.log(commitList.length);
    return fetchCommitsRepo(owner, repo, page + 1, commitList);
  } catch (err) {
    throw err;
  }
};

const fetchCommitFirstRelease = async (release) => {
  let commitsFirstRelease = [];
  const { tagName, owner, repo } = release;

  try {
    const result = await octokit.request(
      `GET /repos/{owner}/{repo}/commits/${tagName}`,
      {
        owner: owner,
        repo: repo,
      }
    );

    const commitSha = result.data.sha;

    const commitsRepo = await fetchCommitsRepo(owner, repo);

    if (commitsRepo && commitSha) {
      let commitIndex = commitsRepo.findIndex((val) => {
        return val.sha === commitSha;
      });

      commitsFirstRelease = commitsRepo.slice(
        commitIndex,
        commitsRepo.length - 1
      );
    }

    return commitsFirstRelease;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  fetchCommitFromRelease: fetchCommitFromRelease,
  fetchReleaseFromUrl: fetchReleaseFromUrl,
};
