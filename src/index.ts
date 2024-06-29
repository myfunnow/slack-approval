import * as core from "@actions/core";
import { App, LogLevel, type BlockAction } from "@slack/bolt";
import { WebClient } from "@slack/web-api";
import { isNone, isSome, type Option } from "fp-ts/lib/Option";
import { getGitHubInfo } from "./helper/github_info_helper";
import { getInputs, type SlackApprovalInputs } from "./helper/input_helper";

async function run(inputs: SlackApprovalInputs, app: App): Promise<void> {
	try {
		const web = new WebClient(inputs.botToken);

		const githubInfo = getGitHubInfo();

		let title = "";
		if (isSome(inputs.mentionToUser)) {
			title += `<@${inputs.mentionToUser.value}>\n`;
		}
		if (isSome(inputs.mentionToGroup)) {
			title += `<!subteam^${inputs.mentionToGroup.value}>\n`;
		}
		title += "*GitHub Action Approval request*";

		(async () => {
			await web.chat.postMessage({
				channel: inputs.channelId,
				blocks: [
					{
						type: "section",
						text: {
							type: "mrkdwn",
							text: title,
						},
					},
					{
						type: "section",
						fields: [
							{
								type: "mrkdwn",
								text: `*GitHub Actor:*\n${githubInfo.actor}`,
							},
							{
								type: "mrkdwn",
								text: `*Repos:*\n${githubInfo.serverUrl}/${githubInfo.repo}`,
							},
							{
								type: "mrkdwn",
								text: `*Actions URL:*\n${githubInfo.actionUrl}`,
							},
							{
								type: "mrkdwn",
								text: `*GITHUB_RUN_ID:*\n${githubInfo.runId}`,
							},
							{
								type: "mrkdwn",
								text: `*Workflow:*\n${githubInfo.workflow}`,
							},
							{
								type: "mrkdwn",
								text: `*RunnerOS:*\n${githubInfo.runnerOS}`,
							},
						],
					},
					{
						type: "actions",
						elements: [
							{
								type: "button",
								text: {
									type: "plain_text",
									emoji: true,
									text: "Approve",
								},
								style: "primary",
								value: "approve",
								action_id: "slack-approval-approve",
							},
							{
								type: "button",
								text: {
									type: "plain_text",
									emoji: true,
									text: "Reject",
								},
								style: "danger",
								value: "reject",
								action_id: "slack-approval-reject",
							},
						],
					},
				],
			});
		})();

		app.action(
			"slack-approval-approve",
			async ({ ack, client, body, logger }) => {
				await ack();

				const blockAction = <BlockAction>body;
				const userId = blockAction.user.id;
				const ts = blockAction.message?.ts || "";

				if (!isAuthorizedUser(userId, inputs.authorizedUsers)) {
					await client.chat.postMessage({
						channel: inputs.channelId,
						thread_ts: ts,
						text: `You are not authorized to approve this action: <@${userId}>`,
					});
					return;
				}

				try {
					const response_blocks = blockAction.message?.blocks;
					response_blocks.pop();
					response_blocks.push({
						type: "section",
						text: {
							type: "mrkdwn",
							text: `Approved by <@${userId}> `,
						},
					});

					await client.chat.update({
						channel: inputs.channelId,
						ts: ts,
						blocks: response_blocks,
					});
				} catch (error) {
					logger.error(error);
				}

				process.exit(0);
			},
		);

		app.action(
			"slack-approval-reject",
			async ({ ack, client, body, logger }) => {
				await ack();

				const blockAction = <BlockAction>body;
				const userId = blockAction.user.id;
				const ts = blockAction.message?.ts || "";

				if (!isAuthorizedUser(userId, inputs.authorizedUsers)) {
					await client.chat.postMessage({
						channel: inputs.channelId,
						thread_ts: ts,
						text: `You are not authorized to reject this action: <@${userId}>`,
					});
					return;
				}

				try {
					const response_blocks = blockAction.message?.blocks;
					response_blocks.pop();
					response_blocks.push({
						type: "section",
						text: {
							type: "mrkdwn",
							text: `Rejected by <@${userId}>`,
						},
					});

					await client.chat.update({
						channel: inputs.channelId,
						ts: ts,
						blocks: response_blocks,
					});
				} catch (error) {
					logger.error(error);
				}

				process.exit(1);
			},
		);

		(async () => {
			await app.start(3000);
			console.log("Waiting Approval reaction.....");
		})();
	} catch (error) {
		if (error instanceof Error) core.setFailed(error.message);
	}
}

function isAuthorizedUser(
	userId: string,
	authorizedUsers: Option<string[]>,
): boolean {
	if (isNone(authorizedUsers)) {
		return true;
	}

	return authorizedUsers.value.includes(userId);
}

async function main() {
	const inputs = getInputs();

	const app = new App({
		token: inputs.botToken,
		signingSecret: inputs.signingSecret,
		appToken: inputs.appToken,
		socketMode: true,
		port: 3000,
		logLevel: LogLevel.DEBUG,
	});

	run(inputs, app);
}

main();
