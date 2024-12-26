import type { AckFn, BlockAction, BlockButtonAction } from "@slack/bolt"
import type { Logger } from "@slack/logger"
import type { WebClient } from "@slack/web-api"
import { type Option, isNone } from "fp-ts/lib/Option"
import type { SlackApprovalInputs } from "./helper/input_helper"

export async function approve(
	inputs: SlackApprovalInputs,
	ack: AckFn<void>,
	client: WebClient,
	body: BlockButtonAction,
	logger: Logger,
) {
	await ack()

	const blockAction = <BlockAction>body
	const userId = blockAction.user.id
	const ts = blockAction.message?.ts || ""

	if (!isAuthorizedUser(userId, inputs.authorizedUsers)) {
		await client.chat.postMessage({
			channel: inputs.channelId,
			thread_ts: ts,
			text: `You are not authorized to approve this action: <@${userId}>`,
		})
		return
	}

	try {
		const response_blocks = blockAction.message?.blocks
		response_blocks.pop()
		response_blocks.push({
			type: "section",
			text: {
				type: "mrkdwn",
				text: `Approved by <@${userId}> `,
			},
		})

		await client.chat.update({
			channel: inputs.channelId,
			ts: ts,
			blocks: response_blocks,
		})
	} catch (error) {
		logger.error(error)
	}

	process.exit(0)
}

export async function reject(
	inputs: SlackApprovalInputs,
	ack: AckFn<void>,
	client: WebClient,
	body: BlockButtonAction,
	logger: Logger,
) {
	await ack()

	const blockAction = <BlockAction>body
	const userId = blockAction.user.id
	const ts = blockAction.message?.ts || ""

	if (!isAuthorizedUser(userId, inputs.authorizedUsers)) {
		await client.chat.postMessage({
			channel: inputs.channelId,
			thread_ts: ts,
			text: `You are not authorized to reject this action: <@${userId}>`,
		})
		return
	}

	try {
		const response_blocks = blockAction.message?.blocks
		response_blocks.pop()
		response_blocks.push({
			type: "section",
			text: {
				type: "mrkdwn",
				text: `Rejected by <@${userId}>`,
			},
		})

		await client.chat.update({
			channel: inputs.channelId,
			ts: ts,
			blocks: response_blocks,
		})
	} catch (error) {
		logger.error(error)
	}

	process.exit(1)
}

function isAuthorizedUser(
	userId: string,
	authorizedUsers: Option<string[]>,
): boolean {
	if (isNone(authorizedUsers)) {
		return true
	}

	return authorizedUsers.value.includes(userId)
}
