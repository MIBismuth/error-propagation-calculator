<script>
	import { fly, slide } from 'svelte/transition';
	export let exp = "Your Expression Will Appear Here";
	export let exp_latex = "";
    export let flag_latex = 0;
</script>
<div class=" w-full  text-white" >

    <div class="flex flex-col  bg-inputs m-3 rounded border">
        <div class="flex flex-row justify-between flex-wrap gap-2 bg-metal ">
            <p class=" text-left text-sm m-1">
                Expression Result:
            </p>
            <button
            class="shadow bg-secondary rounded-lg hover:bg-accent-engage 
                hover:bg-opacity-50 hover:rounded  transition-all m-1 w-10"
            on:click={()=> {navigator.clipboard.writeText((flag_latex ? exp_latex : exp))}}>📋</button
        >
        </div>
        <div class="overflow-scroll p-4 text-lg">
            {@html exp}
        </div>
        
    </div>
</div>