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

<button class="bg-white text-black rounded border-solid border cursor-pointer w-32 text-xl px-2 outline-0 transition-colors hover:bg-black hover:text-white" on:click>
  <slot></slot>
</button>

<style>
    .button {
        background-color: white;
        color: black;
        border-radius: 4px;
        border-style: solid;
        border-width: 1px;
        cursor: pointer;
        width: 8rem;
        font-size: 1.5em;
        padding: 0.2em 0;
        transition: background-color 0.15s, color 0.15s;
    }
    .button:hover {
        transition: background-color 0.2s, color 0.2s;
        background-color: black;
        color: white;
        outline: none;
    }
</style>