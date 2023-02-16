<script>
	import { fly, slide } from 'svelte/transition';
	export let OptionList = ['default'];
	export let Option = 'default';
</script>


<div class = 'flex'>
	<select class="bg-metal rounded p-3 hover:cursor-pointer
	    transition-all" bind:value={Option}>
		{#each OptionList as option, index}
			<option class="rounded bg-secondary" value={option} >{option}</option>
		{/each}
	</select>
</div>
