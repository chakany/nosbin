<script>
    import { nostrInstance } from "$lib/store";
    import { page } from "$app/stores";
    import { HighlightAuto, LineNumbers } from "svelte-highlight";
    import SvelteMarkdown from "svelte-markdown";
    import github from "svelte-highlight/styles/github-dark";
    let event;
    let hasData = false;
    let content = ""

    // fetch
    async function fetch() {
        console.debug($page.params.event)
        const gevent = await $nostrInstance.getEvent($page.params.event)
        event = gevent
        hasData = true
    }
    // only used if client has already loaded.
    if ($nostrInstance.relay.status == 1) {
      fetch()
    }
    // used if client has not been loaded.
    $nostrInstance.relay.on("connect", () => {
        fetch()
    })
</script>
<svelte:head>
  <title>paste {$page.params.event} - nosbin</title>
  <meta name="description" content="view this paste on nosbin, the decentralized pasting platform" />
  <meta property="og:description" content="view this paste on nosbin, the decentralized pasting platform" />
  <meta property="og:title" content="paste {$page.params.event}" />
  {@html github}
</svelte:head>

{#if hasData}
  <h2>{event?.tags[0][1]}</h2>
  Posted by: {event.pubkey} <br />
  Posted on: {new Date(event.created_at * 1000)}
  {#if event?.tags[0][1].endsWith(".md")}
    <SvelteMarkdown source={event.content} />
    {:else}
    <HighlightAuto code={event.content} let:highlighted>
      <LineNumbers {highlighted} hideBorder wrapLines />
    </HighlightAuto>
  {/if}
  {:else}
  <h2>Fetching...</h2>
  If data doesn't load, try refreshing.
{/if}
