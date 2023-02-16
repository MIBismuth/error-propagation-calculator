<script>
	import { onMount } from 'svelte';
	import { fly, slide } from 'svelte/transition';
	import katex from 'katex';
	import Dropdown from '$lib/dropdown.svelte';
	import DisplayResults from '$lib/display_results.svelte';
	import Box from '$lib/box.svelte';
	import VariableMenu from '$lib/variable_menu.svelte';
	import WarningBox from '$lib/warningBox.svelte';
	import ErrorBox from '$lib/errorBox.svelte';
	import {get_variables, get_latex_exp, get_error_propagation_exp} from '$lib/ErrorPropagation.js'
	//import math from 'mathjs';

	let api_adress = 'http://localhost:8000/';
	let exp_string = 'x+y';
	let variables = ['x', 'y'];
	let ErrPro = '';
	let Ltx = 'log(x)';
	let selectedOption = 'Option 1';
	let expabs = '\\sum_{i=1}^n | \\frac{\\partial F}{\\partial x_i}| \\cdot \\delta_i';
	let expquad = '\\sqrt{ \\sum_{i=1}^n  (\\frac{\\partial F}{\\partial x_i} \\cdot \\delta_i)^2}';
	let err_pro_latex = '';
	let expM = '';
	let expQ = '';
	let erro = false;
	let latex_string = '';
	let aviso = false;

	class Variable {
		// @ts-ignore
		constructor(name, alias = '', error = '', usable = true) {
			this.name = name;
			this.alias = alias;
			this.error = error;
			this.usable = usable;
		}
	}

	let VariableList = [];
	//Removes old variables and adds new ones
	function update_variable_list() {
		for (let Var of VariableList) {
			if (!variables.includes(Var.name)) {
				VariableList = VariableList.filter((item) => item !== Var);
			}
		}

		for (let value of variables) {
			if (!VariableList.map((variable) => variable.name).includes(value)) {
				VariableList = VariableList.concat(new Variable(value));
			}
		}
	}

	function toggle(i) {
		VariableList[i].usable = !VariableList[i].usable;
		VariableList = VariableList;
	}

	update_variable_list();

	function updateSelectedOption(event) {
		selectedOption = event.target.value;
	}

	onMount(async () => {

		variables = get_variables(exp_string);
		expM = katex.renderToString(expabs, {
			throwOnError: false,
			output: 'mathml'
		});
		expQ = katex.renderToString(expquad, {
			throwOnError: false,
			output: 'mathml'
		});
	});

	
	async function get_vars() {
		try {
			variables = get_variables(exp_string);
			update_variable_list();
			erro = false;
		} catch (error) {
			// handle the error and display a custom error message
			console.error(error);
			erro = true;
		}
	}

	async function get_error_propagation() {
		get_vars();

		ErrPro = get_error_propagation_exp(exp_string, VariableList, DisplayOption, ErrorOption);
		if (DisplayOption == 'Latex') {
			err_pro_latex = ErrPro;
			ErrPro = katex.renderToString(ErrPro, {
				throwOnError: false,
				output: 'mathml'
			});
		}
	}

	async function get_latex() {
		try {
			
			Ltx = get_latex_exp(exp_string, VariableList)

			latex_string = katex.renderToString(Ltx, {
				throwOnError: false,
				output: 'mathml'
			});
			erro = false;
			if (Ltx.includes('mathrm')) {
				aviso=true;
				}
			else{
				aviso=false;
			}	
		} catch (error) {
			// handle the error and display a custom error message
			console.error(error);
			erro = true;
		}
	}

	//DROPDOWN BUTTONS LIST
	let DisplayOptionList = ['Python', 'Excel', 'Latex'];
	let DisplayOption = 'Python';

	let ErrorOptionList = ['Absolute', 'Quadratic'];
	let ErrorOption = 'Absolute';

	export const snapshot = {
		capture: () => [
			VariableList,
			ErrPro,
			exp_string,
			DisplayOption,
			ErrorOption,
			Ltx,
			latex_string
		],
		restore: (value) => (
			(VariableList = value[0]),
			(ErrPro = value[1]),
			(exp_string = value[2]),
			(DisplayOption = value[3]),
			(ErrorOption = value[4]),
			(Ltx = value[5]),
			(latex_string = value[6])
		)
	};


	function clear() {
		DisplayOption = 'Python';
		ErrorOption = 'Absolute';
		erro = false;
		aviso = false;
		exp_string = '';
		variables = [];
		ErrPro = '';
		err_pro_latex = '';
		latex_string = '';
		update_variable_list()

	}

</script>

<h1 class="text-center font-bold font-mono text-2xl p-4">Error Propagation Calculator</h1>

<div class="flex flex-initial">
	<div class="w-full max-w-4xl">
		<div class="flex gap-2 p-4">
			<input class="bg-inputs p-3 rounded border transition-all" bind:value={exp_string} />
			<button
				class="bg-secondary shadow rounded-lg p-0.5 hover:bg-accent-engage hover:bg-opacity-50 hover:rounded transition-all"
				on:click={get_vars}>Get Variables</button
			>
			<button
				id="get-equation "
				class="bg-secondary shadow rounded-lg hover:bg-accent-engage hover:bg-opacity-50 hover:rounded transition-all"
				on:click={get_latex}>Get Expression</button
			>
			<button
				class="bg-secondary shadow rounded-lg hover:bg-red hover:bg-opacity-50 p-2 hover:rounded transition-all"
				on:click={clear}>Clear</button
			>
		</div>

		{#if erro}
			<ErrorBox />
		{/if}

		{#if aviso}
			<WarningBox />
		{/if}

		<DisplayResults exp={latex_string} exp_latex={Ltx} flag_latex={1} />

		<VariableMenu bind:VariableList />

		<div class="flex m-3 gap-2">
			<Dropdown OptionList={DisplayOptionList} bind:Option={DisplayOption} />
			<Dropdown OptionList={ErrorOptionList} bind:Option={ErrorOption} />
			<button
				class="shadow bg-secondary rounded-lg p-0.5 hover:bg-accent-engage 
				hover:bg-opacity-50 hover:rounded hover:m-0.5 transition-all"
				on:click={get_error_propagation}>Get Error Propagation</button
			>
		</div>

		<DisplayResults exp={ErrPro} exp_latex={err_pro_latex} flag_latex={DisplayOption == 'Latex'} />

		<Box {expM} {expQ} />
	</div>
	<div class=" bg-primary md:w-1/4" />
</div>

<style lang="postcss">
	:global(html) {
		background-color: theme(colors.primary);
		@apply text-white;
	}
</style>