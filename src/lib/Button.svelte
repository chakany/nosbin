<!--
  - Button.svelte
  - Copyright (c) 2023 Jack Chakany <jacany@chaker.net>
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as published by
  - the Free Software Foundation, either version 3 of the License, or
  - (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program.  If not, see <http://www.gnu.org/licenses/>.
  -->

<button
	class="w-24 md:w-32 h-10 md:h-12 cursor-pointer rounded border border-solid border-black dark:border-white bg-black dark:bg-white p-2 text-base md:text-xl text-white dark:text-black outline-0 transition-colors hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white"
	on:click
>
	<slot />
</button>
