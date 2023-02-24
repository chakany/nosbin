<!--
  - +error.svelte
  - Copyright (c) 2023 Jack Chakany <jack@chaker.net>
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
	import { page } from "$app/stores";
	import Button from "$lib/Button.svelte";
	import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
	import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
</script>

<div class="flex flex-col items-center gap-5">
	<h1 class="text-5xl">Oops...</h1>
	<span class="text-2xl">{$page.error.message}</span>
	<Button>
		<FontAwesomeIcon size="md" icon={faArrowLeft} />
		Go Back
	</Button>
</div>
