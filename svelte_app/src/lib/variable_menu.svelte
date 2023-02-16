<script>
	import { fly, slide } from 'svelte/transition';
	function toggle(i) {
		VariableList[i].usable = !VariableList[i].usable;
		VariableList = VariableList;
	}

	export let VariableList;
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 m-3">
	{#each VariableList as variable, index}
		<div class="" in:slide|local={{ delay: index * 50 }}>
			{#if VariableList[index].usable}
				<div class="flex flex-row justify-around gap-2 bg-metal rounded-sm p-3 bg-opacity-100">
					<div class="w-1/6 text-center bg-bubble-gum bg-opacity-10 round overflow-scroll">
						{variable.name}
					</div>
					<input
						class="bg-inputs hover:border-2 transition-all text-center w-1/4
						text-sm shadow-md"
						bind:value={VariableList[index].alias}
						placeholder="Alias: {variable.name}"
					/>
					<input
						class="bg-inputs hover:border-2 transition-all text-center w-1/4
						 text-sm shadow-md"
						bind:value={VariableList[index].error}
						placeholder="Error: δ{variable.name}"
					/>
					<button
						class=" bg-secondary rounded-lg shadow-md bg-opacity-100 p-0.5 
						hover:bg-accent-engage hover:bg-opacity-10 hover:rounded transition-all w-1/6"
						on:click={() => toggle(index)}
					>
						Usable!
					</button>
				</div>
			{:else}
				<div class="flex flex-row justify-around gap-2 bg-metal bg-opacity-30 rounded-sm p-3">
					<div class="w-1/6 text-center bg-bubble-gum bg-opacity-10 round overflow-scroll">
						{variable.name}
					</div>
					<input
						class="bg-inputs hover:border-2 transition-all text-center w-1/4
						text-sm"
						bind:value={VariableList[index].alias}
						placeholder="Alias: {variable.name}"
					/>
					<input
						class="bg-inputs hover:border-2 transition-all text-center w-1/4
						text-sm"
						bind:value={VariableList[index].error}
						placeholder="Error: δ{variable.name}"
					/>
					<button
						class=" bg-secondary rounded-lg shadow bg-opacity-100 p-0.5 hover:bg-accent-engage
						 hover:bg-opacity-10 hover:rounded transition-all w-1/6"
						on:click={() => toggle(index)}
					>
						Unusable!
					</button>
				</div>
			{/if}
		</div>
	{/each}
</div>
