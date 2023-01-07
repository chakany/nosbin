<button on:click><slot></slot></button>

<style>
    button {
        background: none;
        color: white;
        border-radius: 6px;
        border-style: solid;
        border-color: #bbbbbb;
        border-width: thin;
        cursor: pointer;
        width:85px;
        height: 35px;
        transition: border-color 0.2s;
    }
    button:hover {
        transition: border-color 0.2s;
        border-color: white;
        outline: none;
    }
</style>