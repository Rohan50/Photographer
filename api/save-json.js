export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { fileName, content } = req.body;

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;

  console.log("TOKEN EXISTS:", !!token);
  console.log(owner, repo, token?.slice(0,10));

  const path = `frontend/public/data/${fileName}`;

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  try {

    const current = await fetch(url, {
  headers: {
    Authorization: `token ${token}`,
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  }
});

    const data = await current.json();

    if (!data.sha) {
      return res.status(400).json({ error: "File not found in repo", github: data });
    }

    const sha = data.sha;

const response = await fetch(url, {
  method: "PUT",
  headers: {
    Authorization: `token ${token}`,
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json"
  },
      body: JSON.stringify({
        message: `Update ${fileName} from admin panel`,
        content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
        sha: sha
      })
    });

    const result = await response.json();

    return res.status(200).json(result);

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }

}
