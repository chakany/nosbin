<script>
    import { nostrInstance } from "$lib/store";
    import {page} from "$app/stores";
    let filename = "Fetching Filename...";
    let content = "Fetching Content...";

    // fetch
    async function fetch() {
        console.log($page.params.event)
        const event = await $nostrInstance.getEvent($page.params.event)
        filename = event.tags[0][1]
        content = event.content
    }
    $nostrInstance.relay.on("connect", () => {
        fetch()
    })
</script>

<h1>{filename}</h1>
<p>{content}</p>