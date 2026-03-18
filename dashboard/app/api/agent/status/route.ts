import { NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || "";
const REPO_NAME = process.env.GITHUB_REPO_NAME || "";
const WORKFLOW_FILE = "run-agent.yml";

export async function GET() {
  if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
    return NextResponse.json(
      { error: "GitHub config missing" },
      { status: 500 }
    );
  }

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=1`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `GitHub API error: ${res.status}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  const run = data.workflow_runs?.[0];

  if (!run) {
    return NextResponse.json({ status: "none", message: "No runs found" });
  }

  return NextResponse.json({
    status: run.status,
    conclusion: run.conclusion,
    started_at: run.run_started_at,
    html_url: run.html_url,
  });
}
