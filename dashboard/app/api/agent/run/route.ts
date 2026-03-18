import { NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || "";
const REPO_NAME = process.env.GITHUB_REPO_NAME || "";
const WORKFLOW_FILE = "run-agent.yml";

export async function POST() {
  if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
    return NextResponse.json(
      { error: "GitHub config missing. Set GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME in .env.local" },
      { status: 500 }
    );
  }

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_FILE}/dispatches`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
    body: JSON.stringify({ ref: "main" }),
  });

  if (res.status === 204) {
    return NextResponse.json({ ok: true, message: "Agent workflow triggered" });
  }

  const body = await res.text();
  return NextResponse.json(
    { error: `GitHub API error: ${res.status} ${body}` },
    { status: res.status }
  );
}
