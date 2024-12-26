import * as core from "@actions/core"
import { App, type BlockButtonAction } from "@slack/bolt"
import { type Block, WebClient } from "@slack/web-api"
import { isSome } from "fp-ts/lib/Option"
import { approve, reject } from "./actions"
import { buttonBlock, infoBlock, mentionBlock, titleBlock } from "./blocks"
import { getGitHubInfo } from "./helper/github_info_helper"
import { type SlackApprovalInputs, getInputs } from "./helper/input_helper"
import { GitHubActionsLogger } from "./logger"

async function run(inputs: SlackApprovalInputs, app: App): Promise<void> {
	try {
		const web = new WebClient(inputs.botToken)
		const githubInfo = getGitHubInfo()
		const blocks: Block[] = [titleBlock(inputs.title), infoBlock(githubInfo)]
		const block = mentionBlock(inputs)
		if (isSome(block)) blocks.push(block.value)
		blocks.push(buttonBlock())
		;(async () => {
			await web.chat.postMessage({
				channel: inputs.channelId,
				text: inputs.title,
				blocks,
			})
		})()

		app.action<BlockButtonAction>(
			"slack-approval-approve",
			async ({ ack, client, body, logger }) => {
				await approve(inputs, ack, client, body, logger)
			},
		)
		app.action<BlockButtonAction>(
			"slack-approval-reject",
			async ({ ack, client, body, logger }) => {
				await reject(inputs, ack, client, body, logger)
			},
		)
		;(async () => {
			await app.start(3000)
			console.log("Waiting Approval reaction.....")
		})()
	} catch (error) {
		if (error instanceof Error) core.setFailed(error.message)
	}
}

async function main() {
	const inputs = getInputs()
	const logger = new GitHubActionsLogger()

	const app = new App({
		token: inputs.botToken,
		signingSecret: inputs.signingSecret,
		appToken: inputs.appToken,
		socketMode: true,
		port: 3000,
		logger: logger,
	})

	run(inputs, app)
}

main()
