<script>
    export let value = ""
</script>

{#if $$props.type == "textarea"}
    <textarea bind:value class="input" style={$$props.style} placeholder={$$props.placeholder} />
{:else}
    <input bind:value class="input" type="text" style={$$props.style} placeholder={$$props.placeholder} />
{/if}
<style>
    .input {
        border-radius: 10px;
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