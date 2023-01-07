<script>
    export const ssr = false;
    import "@fontsource/montserrat";
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome'
    import { faNoteSticky } from '@fortawesome/free-solid-svg-icons'
    import { config } from '@fortawesome/fontawesome-svg-core'
    import '@fortawesome/fontawesome-svg-core/styles.css' // Import the CSS
    config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

    // init connection
    import { nostrInstance } from "$lib/store";
    $nostrInstance.connect()
</script>

<div class="header">
    <a href="/"><FontAwesomeIcon style="margin-right: 6px" size="2xl" icon={faNoteSticky} /></a>
    <a id="name" href="/">nosbin</a>
</div>
<div class="container">
    <slot></slot>
</div>
Made by <a href="https://jacany.com">Jack Chakany</a>; Get in contact: npub1s8gvenj9j87yux0raa6j52cq8mer4xrvkv08sd020kxhektdgl4qu7ldqa; This website is licensed under the <a href="https://github.com/jacany/nosbin/blob/master/LICENSE">AGPL v3.0</a>

<style>
    :global(body) {
        font-family: "Montserrat", sans-serif;
        background-color: #111111;
        color: white;
    }
    :global(a) {
        color: white;
    }
    .header {
        display: flex;
        margin: 20px 5vw
    }
    #name {
        font-size: 1.5em;
    }
    .container {
        margin: 3vh 5vw;
    }
</style>