import * as core from "@actions/core";
import { Option, none, some } from "fp-ts/lib/Option";

export type SlackApprovalInputs = {
	botToken: string;
	signingSecret: string;
	appToken: string;
	channelId: string;
	mentionTo: Option<string>;
};

export function getInputs(): SlackApprovalInputs {
	const botToken = getRequiredInput("bot-token");
	const signingSecret = getRequiredInput("signing-secret");
	const appToken = getRequiredInput("app-token");
	const channelId = getRequiredInput("channel-id");
	const mentionTo = getOptionalInput("mention-to");

	return {
		botToken,
		signingSecret,
		appToken,
		channelId,
		mentionTo,
	};
}

function getRequiredInput(name: string): string {
	return core.getInput(name, { required: true });
}

function getOptionalInput(name: string): Option<string> {
	const value = core.getInput(name);
	if (value === "") {
		return none;
	}

	return some(value);
}
