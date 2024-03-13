import * as core from "@actions/core";

export type SlackApprovalInputs = {
	botToken: string;
	signingSecret: string;
	appToken: string;
	channelId: string;
};

export function getInputs(): SlackApprovalInputs {
	const botToken = core.getInput("bot-token");
	const signingSecret = core.getInput("signing-secret");
	const appToken = core.getInput("app-token");
	const channelId = core.getInput("channel-id");

	return {
		botToken,
		signingSecret,
		appToken,
		channelId,
	};
}
