<script>
	import { fly, slide } from 'svelte/transition';
	export let expM = '';
	export let expQ = '';
</script>

<div class="flex flex-col  bg-inputs m-3  w-3/5 rounded border-2">
	<div class=" p-1  bg-inputs m-2 w-12/13 rounded border-2">
		<div style="float:left; width: 50%">
			<p class=" text-center text-m m-1">"Absolute"</p>
		</div>
		<div style="float: right; width: 50%">
			<p class=" text-center text-m m-1">"Quadratic"</p>
		</div>
	</div>
	<div class=" p-1 text-md">
		<div style="float: left; width: 50%">
			<p class=" text-center text-m m-1">
				{@html expM}
			</p>
		</div>
		<div style="float: right; width: 50%">
			<p class=" text-center text-m m-1">
				{@html expQ}
			</p>
		</div>
	</div>
</div>
