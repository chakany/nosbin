<!--
  - Reaction.svelte
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
<script lang="ts">
    import { type Event } from "nostr-tools"
    export let pubkey: string = "";
    export let events: Event[] = [];
    export let emoji: string = "";

    // Check if that pubkey is inside our arrays.
    $: votedOn = !!events.find((v) => v.pubkey === pubkey);
</script>

<span class={"flex py-1 px-4 rounded border border-solid border-black dark:border-white cursor-pointer" + (votedOn ? " border-2" : "")}>
    <span class="mr-2">{events.length}</span>
    <span>{emoji}</span>
</span>