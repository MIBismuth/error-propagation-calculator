<script>
  import { fly, slide, scale } from "svelte/transition";
  export let expanded = false;
  import DisplayResults from "$lib/display_results.svelte";
  import VariableMenu from "$lib/variable_menu.svelte";
  import Dropdown from "$lib/dropdown.svelte";
  let ltxstring =
    '<span class="katex"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ln</mi><mo>⁡</mo><mrow><mo fence="true">(</mo><mi>π</mi><mo>⋅</mo><mi>sin</mi><mo>⁡</mo><mrow><mo fence="true">(</mo><msup><mi>x</mi><mn>2</mn></msup><mo fence="true">)</mo></mrow><mo fence="true">)</mo></mrow><mo>+</mo><mi>exp</mi><mo>⁡</mo><mrow><mo fence="true">(</mo><mfrac><mi>y</mi><mi>a</mi></mfrac><mo fence="true">)</mo></mrow></mrow><annotation encoding="application/x-tex">lnleft(picdotsinleft({ x}^{2}\right)\right)+expleft(\frac{ y}{ a}\right)</annotation></semantics></math></span>';
  let Ltxx =
    "\\ln\\left(\\pi\\cdot\\sin\\left({ x}^{2}\\right)\\right)+\\exp\\left(\\frac{ y}{ a}\\right)";
  let VariableList = [];
  let ErrPro =
    '<span class="katex"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mrow><mo fence="true">(</mo><mfrac><mrow><mn>4</mn><mo>⋅</mo><msup><mi>x</mi><mn>2</mn></msup><mo>⋅</mo><msup><mrow><mi>cos</mi><mo>⁡</mo><mrow><mo fence="true">(</mo><msup><mi>x</mi><mn>2</mn></msup><mo fence="true">)</mo></mrow></mrow><mn>2</mn></msup><mo>⋅</mo><msup><mrow><mi>δ</mi><mi>x</mi></mrow><mn>2</mn></msup></mrow><msup><mrow><mi>sin</mi><mo>⁡</mo><mrow><mo fence="true">(</mo><msup><mi>x</mi><mn>2</mn></msup><mo fence="true">)</mo></mrow></mrow><mn>2</mn></msup></mfrac><mo>+</mo><mfrac><mrow><msup><mrow><mi>exp</mi><mo>⁡</mo><mrow><mo fence="true">(</mo><mfrac><mi>y</mi><mi>a</mi></mfrac><mo fence="true">)</mo></mrow></mrow><mn>2</mn></msup><mo>⋅</mo><msup><mrow><mi>δ</mi><mi>y</mi></mrow><mn>2</mn></msup></mrow><msup><mi>a</mi><mn>2</mn></msup></mfrac><mo fence="true">)</mo></mrow><mfrac><mn>1</mn><mn>2</mn></mfrac></msup></mrow><annotation encoding="application/x-tex">{left(\frac{4cdot{ x}^{2}cdot{cosleft({ x}^{2}\right)}^{2}cdot{ δx}^{2}}{{sinleft({ x}^{2}\right)}^{2}}+\frac{{expleft(\frac{ y}{ a}\right)}^{2}cdot{ δy}^{2}}{{ a}^{2}}\right)}^{\frac{1}{2}}</annotation></semantics></math></span>';
  let err_pro_latex =
    "{\\left(\\frac{4\\cdot{ x}^{2}\\cdot{\\cos\\left({ x}^{2}\\right)}^{2}\\cdot{ δx}^{2}}{{\\sin\\left({ x}^{2}\\right)}^{2}}+\\frac{{\\expleft(\\frac{ y}{ a}\\right)}^{2}\\cdot{ δy}^{2}}{{ a}^{2}}\\right)}^{\\frac{1}{2}}";
  let ErrProE =
    "(4 * x ^ 2 * COS(x ^ 2) ^ 2 * δx ^ 2 / SIN(x ^ 2) ^ 2 + EXP(y / a) ^ 2 * δy ^ 2 / a ^ 2) ^ (1 / 2)";
  class Variabl {
    // @ts-ignore
    constructor(name, alias = "", error = "", usable = true) {
      this.name = name;
      this.alias = alias;
      this.error = error;
      this.usable = usable;
    }
  }

  let variable1 = new Variabl("x", "B5", "C5", true);
  let variable2 = new Variabl("y", "A2", "$A$2", true);
  let variable3 = new Variabl("a", "", "", false);

  VariableList = VariableList.concat(variable1, variable2, variable3);

  let DisplayOptionList = ["Python", "Excel", "Latex"];
  let DisplayOption = "Python";

  let ErrorOptionList = ["Absolute", "Quadratic"];
  let ErrorOption = "Absolute";

  function toggleExpanded() {
    expanded = !expanded;
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      // do something when Enter key is pressed
    }
  }
</script>

<button
  on:click={toggleExpanded}
  id="expand-button"
  class="bg-red text-white px-4 py-2 rounded-full hover:bg-blue-700"
>
  <span>{expanded ? "Close" : "Help"}</span>
</button>

{#if expanded}
  <div
    class=" text-primary text-justify fixed bottom-20 right-5 bg-white h-4/5 w-11/12 sm:w-3/5 md:w-1/2 lg:w-2/5 
	overflow-y-scroll rounded shadow-md transition-all"
    transition:slide
    on:click={(e) => e.stopPropagation()}
    on:keydown={handleKeyDown}
  >
    <nav>
      <h5 style="text-align: center; font-size: 2.5em;">Table of Contents</h5>
      <ul style="list-style-type: disc; margin-left: 30px;">
        <li>
          <a href="#checking-your-expression">Entering your expression</a>
        </li>
        <li>
          <a href="#getting-your-expression">Getting your Expression (LaTex)</a>
        </li>
        <li><a href="#Setting-your-variables">Setting your variables</a></li>
        <li>
          <a href="#Error-Propagation-Output">Error Propagation Output</a>
        </li>
      </ul>
    </nav>

    <h1
      style="text-align: center; font-size: 2em;"
      id="checking-your-expression"
    >
      Entering your expression
    </h1>
    <p class="flex flex-initial " style="margin:10px; pointer-events: none;">
      In order to start, you must enter your expression into the input box, like
      in the following example:
    </p>
    <div class="w-full max-w-4xl " style="pointer-events: none;">
      <div class="flex flex-wrap gap-2 p-4">
        <input
          class="bg-inputs p-3 rounded border transition-all"
          placeholder="log(pi*sin(x^2))+exp(y/a)"
        />
        <button
          class="bg-secondary shadow rounded-lg p-0.5  text-white hover:bg-accent-engage hover:bg-opacity-50 hover:rounded transition-all"
          >Get Variables</button
        >
        <button
          id="get-equation "
          class="bg-secondary shadow rounded-lg  text-white hover:bg-accent-engage hover:bg-opacity-50 hover:rounded transition-all"
          >Get Expression</button
        >
        <button
          class="bg-secondary shadow rounded-lg  text-white hover:bg-red hover:bg-opacity-50 p-2 hover:rounded transition-all"
          >Clear</button
        >
      </div>
    </div>

    <h2
      style="text-align: center; font-size: 2em;"
      id="getting-your-expression"
    >
      Getting your Expression (LaTex)
    </h2>
    <p style="margin:10px;">
      After entering your expression, in order to check whether it's the one you
      intended, you can click the "Get Expression" button, that converts the
      expression to LaTex and displays it. Clicking on the upper right corner's
      clipboard button, the LaTex code gets copied to your clipboard:
      <DisplayResults exp={ltxstring} exp_latex={Ltxx} flag_latex={1} />
    </p>
    <h3 style="text-align: center; font-size: 2em;" id="Setting-your-variables">
      Setting your variables
    </h3>
    <p style="margin:10px; pointer-events: none;">
      In order to get the Error Propagation, you must first click the "Get
      Variables" button, which displays the following menu:
      <VariableMenu bind:VariableList />
      In this menu, every variable detected from your original expression gets its
      box, with the following attributes:
    </p>
    <ul style="list-style-type: circle !important; color:black; margin:30px;">
      <li>
        "Alias", which is an (optional) different name for the variable, which
        will show up in the Error Propagation expressions, and particularly
        useful for specifying the Excel cell where that variable is present;
      </li>
      <li>
        "Error", which has δ(variablename) as its default value. You can leave
        it in its symbolic representation or set the error, for example, to its
        corresponding Excel cell. Note that, like in the example shown for
        variable "y", in order to specifiy a fixed Excell cell, you must use the
        syntax "column_letter$row_number";
      </li>
      <li>
        Toggleable "Usable" setting, which determines whether the identified
        element is in fact a variable (and therefore suscetiple to an
        uncertainty and its consequent propagation), or just a constant. In this
        example, "a" is a constant, so this attribute is set on "Unusable".
      </li>
    </ul>

    <h4
      style="text-align: center; font-size: 2em;"
      id="Error-Propagation-Output"
    >
      Error Propagation Output
    </h4>
    <p style="margin:10px;">
      Finally, you can select how you want your ErrorPropagation, and for that,
      you have 2 selectors:
    </p>
    <div class="flex m-3 gap-2 ">
      <Dropdown OptionList={DisplayOptionList} bind:Option={DisplayOption} />
      <Dropdown OptionList={ErrorOptionList} bind:Option={ErrorOption} />
      <button
        class="shadow bg-secondary rounded-lg p-0.5  text-white hover:bg-accent-engage 
				hover:bg-opacity-50 hover:rounded hover:m-0.5 transition-all"
        >Get Error Propagation</button
      >
    </div>
    <p style="margin:10px;" />
    <p style="margin:10px;">
      The first one selects the output format of your ErrorPropagation equation,
      which is set by default to "Python". This way, the equation will be
      converted to Python code that you can easily copy to your own project
      using the clipboard button, in the upper right corner. You also have the
      option to convert the ErrorPropagation expression to an Excel formula
      (that, again, you can easily copy to Excel and then use its
      functionalities to apply it to the cells of your choosing). Finally, you
      can display the expression in LaTex.
    </p>

    <p style="margin:10px;">
      The second one selects the type of Propagation of Uncertainty: "Absolute"
      or "Quadratic" (see the section at the bottom of the webpage for their
      general expressions). Note that all expressions are already simplified.
    </p>
    <p style="margin:10px;">
      After setting the selectors to your preference, clicking "Get Error
      Propagation" will display your output in the "Expression Result" box, like
      in the following example (in this case, the chosen options were "Excel"
      and "Quadratic"):
    </p>
    <DisplayResults exp={ErrProE} exp_latex={err_pro_latex} flag_latex={0} />

    <p style="margin:10px;">
      And if we choose "LaTex and Quadratic":
      <DisplayResults exp={ErrPro} exp_latex={err_pro_latex} flag_latex={1} />
    </p>
  </div>
{/if}

<style>
  #expand-button {
    position: fixed;
    bottom: 3%;
    right: 2%;
  }

  /* #expanded-content {
    position: fixed;
    bottom: 10%;
    right: 1%;
    background-color: white;
    color: black;
    border-radius: 5px;
    width: 35%;
    max-height: 80%;
    overflow-y: scroll;
    text-align: justify;
  } */
  #expanded-content:focus {
    outline: none;
  }
</style>
