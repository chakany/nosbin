<!--
  - Textbox.svelte
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
<script>
	export let value = "";
	let disabled = false;
</script>

{#if $$props.type === "textarea"}
	<textarea bind:value class="input" style={$$props.style} placeholder={$$props.placeholder} />
{:else}
	<input
		bind:value
		class="input"
		type="text"
		{disabled}
		style={$$props.style}
		placeholder={$$props.placeholder}
	/>
{/if}

<style>
	.input {
		border-radius: 0.25rem;
		border-style: solid;
		border-color: #bbbbbb;
		border-width: thin;
		background: #171717;
		color: white;
		padding: 10px;
		transition: border-color 0.2s;
	}
	.input:focus {
		transition: border-color 0.2s;
		border-color: white;
		outline: none;
	}
</style>
