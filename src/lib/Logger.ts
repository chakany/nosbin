/*
 * Logger.ts
 * Copyright (c) 2023 Jack Chakany <jack@chaker.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

export default class Logger {
	private readonly name: string;
	constructor(name: string) {
		this.name = name;
	}

	public info(...data) {
		console.info(`[${this.name}]`, ...data)
	}

	public debug(...data) {
		console.debug(`[${this.name}]`, ...data);
	}

	public warn(...data) {
		console.warn(`[${this.name}]`, ...data)
	}

	public error(...data) {
		console.error(`[${this.name}]`, ...data);
	}
}
