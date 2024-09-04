import * as core from "@actions/core"
import { LogLevel, type Logger } from "@slack/logger"

export class GitHubActionsLogger implements Logger {
	public getLevel(): LogLevel {
		return LogLevel.INFO
	}

	/**
	 * Sets the instance's log level so that only messages which are equal or more severe are output to the console.
	 */
	public setLevel(level: LogLevel): void {}

	/**
	 * Set the instance's name, which will appear on each log line before the message.
	 */
	public setName(name: string): void {}

	/**
	 * Log a debug message
	 */
	// biome-ignore lint/suspicious/noExplicitAny: upstream
	public debug(...msg: any[]): void {
		core.debug(msg.join(" "))
	}

	/**
	 * Log an info message
	 */
	// biome-ignore lint/suspicious/noExplicitAny: upstream
	public info(...msg: any[]): void {
		core.info(msg.join(" "))
	}

	/**
	 * Log a warning message
	 */
	// biome-ignore lint/suspicious/noExplicitAny: upstream
	public warn(...msg: any[]): void {
		core.warning(msg.join(" "))
	}

	/**
	 * Log an error message
	 */
	// biome-ignore lint/suspicious/noExplicitAny: upstream
	public error(...msg: any[]): void {
		core.error(msg.join(" "))
	}
}
