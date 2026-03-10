export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { fileName, content } = req.body;

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;

  const path = `frontend/public/data/${fileName}`;

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  try {

    const current = await fetch(url, {
      headers: {
        Authorization: `token ${token}`
      }
    });

    const data = await current.json();

    const sha = data.sha;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
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
