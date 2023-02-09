<!--
  - Modal.svelte
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
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { blur, scale } from "svelte/transition"
  import Button from "$lib/Button.svelte"

  const dispatch = createEventDispatcher();
  const close = () => dispatch('close');

  let modal;

  const handle_keydown = e => {
    if (e.key === 'Escape') {
      close();
      return;
    }

    if (e.key === 'Tab') {
      // trap focus
      const nodes = modal.querySelectorAll('*');
      const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0);

      let index = tabbable.indexOf(document.activeElement);
      if (index === -1 && e.shiftKey) index = 0;

      index += tabbable.length + (e.shiftKey ? -1 : 1);
      index %= tabbable.length;

      tabbable[index].focus();
      e.preventDefault();
    }
  };

  const previously_focused = typeof document !== 'undefined' && document.activeElement;

  if (previously_focused) {
    onDestroy(() => {
      previously_focused.focus();
    });
  }
</script>

<svelte:window on:keydown={handle_keydown}/>

<div transition:blur={{ duration: 250 }} class="fixed top-0 left-0 w-full h-full backdrop-blur z-30" on:click|self={close}>
  <div transition:scale={{ duration: 250 }} class="modaltest drop-shadow-2xl z-40" role="dialog" aria-modal="true" bind:this={modal}>
    <slot name="header"></slot>
    <hr class="my-2">
    <slot></slot>
    <hr class="my-2">

    <!-- svelte-ignore a11y-autofocus -->
    <Button on:click={close}>Done</Button>
  </div>

</div>


<style>
    .modaltest {
        position: absolute;
        left: 50%;
        top: 50%;
        width: calc(100vw - 4em);
        max-width: 32em;
        max-height: calc(100vh - 4em);
        overflow: auto;
        transform: translate(-50%,-50%);
        padding: 1em;
        border-radius: 0.2em;
      outline: white solid 2px;
        background: black;
    }
</style>