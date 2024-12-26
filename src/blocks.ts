import { isSome, none, some } from "fp-ts/lib/Option"
import type { GitHubInfo } from "./helper/github_info_helper"
import type { SlackApprovalInputs } from "./helper/input_helper"

export function titleBlock(title: string) {
	return {
		type: "section",
		text: {
			type: "mrkdwn",
			text: `*${title}*`,
		},
	}
}

export function infoBlock(githubInfo: GitHubInfo) {
	return {
		type: "section",
		fields: [
			{
				type: "mrkdwn",
				text: `*ID*\n${githubInfo.runId}`,
			},
			{
				type: "mrkdwn",
				text: `*Attempt*\n${githubInfo.attempt}`,
			},
			{
				type: "mrkdwn",
				text: `*Repo*\n${githubInfo.repo}`,
			},
			{
				type: "mrkdwn",
				text: `*Workflow*\n${githubInfo.workflow}`,
			},
			{
				type: "mrkdwn",
				text: `*Actor:*\n${githubInfo.actor}`,
			},
			{
				type: "mrkdwn",
				text: `*Ref*\n${githubInfo.ref}`,
			},
			{
				type: "mrkdwn",
				text: `*SHA*\n${githubInfo.sha}`,
			},
			{
				type: "mrkdwn",
				text: `*URL*\n${githubInfo.actionUrl}`,
			},
		],
	}
}

export function mentionBlock(inputs: SlackApprovalInputs) {
	let mentions = ""

	if (isSome(inputs.mentionToUser)) {
		mentions += `<@${inputs.mentionToUser.value}> `
	}
	if (isSome(inputs.mentionToGroup)) {
		mentions += `<!subteam^${inputs.mentionToGroup.value}> `
	}

	return mentions.length === 0
		? none
		: some({
				type: "section",
				text: {
					type: "mrkdwn",
					text: mentions,
				},
			})
}

export function buttonBlock() {
	return {
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
	}
}
