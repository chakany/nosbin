<script>
    import { nostrInstance } from "$lib/store";
    import { page } from "$app/stores";
    import { HighlightAuto, LineNumbers } from "svelte-highlight";
    import github from "svelte-highlight/styles/github-dark";
    let event;
    let hasData = false;

    // fetch
    async function fetch() {
        console.log($page.params.event)
        const gevent = await $nostrInstance.getEvent($page.params.event)
        event = gevent
        hasData = true
    }
    $nostrInstance.relay.on("connect", () => {
        fetch()
    })
</script>
<svelte:head>
  {@html github}
</svelte:head>

{#if !hasData}
  <h2>Fetching...</h2>
  {:else}
  <h2>{event?.tags[0][1]}</h2>
  Posted by: {event.pubkey} <br />
  Posted on: {new Date(event.created_at * 1000)}
  <HighlightAuto langtag={true} code={event.content} let:highlighted>
    <LineNumbers {highlighted} hideBorder wrapLines />
  </HighlightAuto>
{/if}
