export type GitHubInfo = {
	serverUrl: string;
	repo: string;
	runId: string;
	actionUrl: string;
	workflow: string;
	runnerOS: string;
	actor: string;
	attempt: number;
	ref: string;
	sha: string;
};

export function getGitHubInfo(): GitHubInfo {
	const serverUrl = process.env.GITHUB_SERVER_URL || "";
	const repo = process.env.GITHUB_REPOSITORY || "";
	const runId = process.env.GITHUB_RUN_ID || "";
	const actionUrl = `${serverUrl}/${repo}/actions/runs/${runId}`;
	const workflow = process.env.GITHUB_WORKFLOW || "";
	const runnerOS = process.env.RUNNER_OS || "";
	const actor = process.env.GITHUB_ACTOR || "";
	const attempt = Number.parseInt(process.env.GITHUB_RUN_ATTEMPT || "0");
	const ref = process.env.GITHUB_REF || "";
	const sha = process.env.GITHUB_SHA || "";

	return {
		serverUrl,
		repo,
		runId,
		actionUrl,
		workflow,
		runnerOS,
		actor,
		attempt,
		ref,
		sha,
	};
}
