// controllers/githubController.js
const axios = require("axios");
const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");
require("dotenv").config();

const mongoUri = process.env.URL;
const dbName = "Github";
const collectionName = "repositories";

async function saveGitHubData(req, res) {
  const { url } = req.body;

  if (!url) {
    return res
      .status(400)
      .json({ error: 'Missing "url" field in the request body.' });
  }

  try {
    const response = await axios.get(
      `https://api.github.com/users/${url}/repos`
    );

    if (response.status !== 200) {
      throw new Error("Failed to fetch data from GitHub API");
    }

    const repos = response.data;

    const client = new MongoClient(mongoUri);
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    for (const repo of repos) {
      const {
        id,
        name,
        html_url,
        description,
        created_at,
        open_issues,
        watchers,
        owner,
      } = repo;

      await collection.updateOne(
        { id },
        {
          $set: {
            id,
            name,
            html_url,
            description,
            created_at,
            open_issues,
            watchers,
            owner: {
              id: owner.id,
              avatar_url: owner.avatar_url,
              html_url: owner.html_url,
              type: owner.type,
              site_admin: owner.site_admin,
            },
          },
        },
        { upsert: true }
      );
    }

    await client.close();
    res.status(200).json({ message: "Data saved successfully" });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res
        .status(404)
        .json({ error: "GitHub user or repository not found" });
    } else {
      console.error("Error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

async function getGitHubDataById(req, res) {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ error: 'Missing "id" parameter in the request.' });
  }

  try {
    const client = new MongoClient(mongoUri);
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const repository = await collection.findOne({ id: parseInt(id) });

    if (!repository) {
      return res.status(404).json({ error: "GitHub repository not found" });
    }

    await client.close();

    return res.status(200).json(repository);
  } catch (err) {
    console.error("Error fetching data from MongoDB:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


module.exports = {
  saveGitHubData,
  getGitHubDataById,
};
