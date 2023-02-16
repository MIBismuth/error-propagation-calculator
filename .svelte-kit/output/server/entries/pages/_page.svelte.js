import { c as create_ssr_component, d as each, f as add_attribute, e as escape, v as validate_component } from "../../chunks/index.js";
import "katex";
import { simplify } from "mathjs";
const Dropdown = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { OptionList = ["default"] } = $$props;
  let { Option = "default" } = $$props;
  if ($$props.OptionList === void 0 && $$bindings.OptionList && OptionList !== void 0)
    $$bindings.OptionList(OptionList);
  if ($$props.Option === void 0 && $$bindings.Option && Option !== void 0)
    $$bindings.Option(Option);
  return `<div class="${"flex"}"><select class="${"bg-metal rounded p-3 hover:cursor-pointer transition-all"}">${each(OptionList, (option, index) => {
    return `<option class="${"rounded bg-secondary"}"${add_attribute("value", option, 0)}>${escape(option)}</option>`;
  })}</select></div>`;
});
const Display_results = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { exp = "" } = $$props;
  let { exp_latex = "" } = $$props;
  let { flag_latex = 0 } = $$props;
  if ($$props.exp === void 0 && $$bindings.exp && exp !== void 0)
    $$bindings.exp(exp);
  if ($$props.exp_latex === void 0 && $$bindings.exp_latex && exp_latex !== void 0)
    $$bindings.exp_latex(exp_latex);
  if ($$props.flag_latex === void 0 && $$bindings.flag_latex && flag_latex !== void 0)
    $$bindings.flag_latex(flag_latex);
  return `<div class="${"w-full"}"><div class="${"flex flex-col bg-inputs m-3 rounded border"}"><div class="${"flex flex-row justify-between flex-wrap gap-2 bg-metal "}"><p class="${"text-left text-sm m-1"}">Expression Result:
            </p>
            <button class="${"shadow bg-secondary rounded-lg hover:bg-accent-engage hover:bg-opacity-50 hover:rounded transition-all m-1 w-10"}">📋</button></div>
        <div class="${"overflow-scroll p-4 text-lg"}"><!-- HTML_TAG_START -->${exp}<!-- HTML_TAG_END --></div></div></div>`;
});
const Box = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { expM = "" } = $$props;
  let { expQ = "" } = $$props;
  if ($$props.expM === void 0 && $$bindings.expM && expM !== void 0)
    $$bindings.expM(expM);
  if ($$props.expQ === void 0 && $$bindings.expQ && expQ !== void 0)
    $$bindings.expQ(expQ);
  return `<div class="${"flex flex-col bg-inputs m-3 w-3/5 rounded border-2"}"><div class="${"p-1 bg-inputs m-2 w-12/13 rounded border-2"}"><div style="${"float:left; width: 50%"}"><p class="${"text-center text-m m-1"}">&quot;Absolute&quot;</p></div>
		<div style="${"float: right; width: 50%"}"><p class="${"text-center text-m m-1"}">&quot;Quadratic&quot;</p></div></div>
	<div class="${"p-1 text-md"}"><div style="${"float: left; width: 50%"}"><p class="${"text-center text-m m-1"}"><!-- HTML_TAG_START -->${expM}<!-- HTML_TAG_END --></p></div>
		<div style="${"float: right; width: 50%"}"><p class="${"text-center text-m m-1"}"><!-- HTML_TAG_START -->${expQ}<!-- HTML_TAG_END --></p></div></div></div>`;
});
const Variable_menu = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { VariableList } = $$props;
  if ($$props.VariableList === void 0 && $$bindings.VariableList && VariableList !== void 0)
    $$bindings.VariableList(VariableList);
  return `<div class="${"grid grid-cols-1 sm:grid-cols-2 gap-3 m-3"}">${each(VariableList, (variable, index) => {
    return `<div class="${""}">${VariableList[index].usable ? `<div class="${"flex flex-row justify-around gap-2 bg-metal rounded-sm p-3 bg-opacity-100"}"><div class="${"w-1/6 text-center bg-bubble-gum bg-opacity-10 round overflow-scroll"}">${escape(variable.name)}</div>
					<input class="${"bg-inputs hover:border-2 transition-all text-center w-1/4 text-sm shadow-md"}" placeholder="${"Alias: " + escape(variable.name, true)}"${add_attribute("value", VariableList[index].alias, 0)}>
					<input class="${"bg-inputs hover:border-2 transition-all text-center w-1/4 text-sm shadow-md"}" placeholder="${"Error: δ" + escape(variable.name, true)}"${add_attribute("value", VariableList[index].error, 0)}>
					<button class="${"bg-secondary rounded-lg shadow-md bg-opacity-100 p-0.5 hover:bg-accent-engage hover:bg-opacity-10 hover:rounded transition-all w-1/6"}">Usable!
					</button>
				</div>` : `<div class="${"flex flex-row justify-around gap-2 bg-metal bg-opacity-30 rounded-sm p-3"}"><div class="${"w-1/6 text-center bg-bubble-gum bg-opacity-10 round overflow-scroll"}">${escape(variable.name)}</div>
					<input class="${"bg-inputs hover:border-2 transition-all text-center w-1/4 text-sm"}" placeholder="${"Alias: " + escape(variable.name, true)}"${add_attribute("value", VariableList[index].alias, 0)}>
					<input class="${"bg-inputs hover:border-2 transition-all text-center w-1/4 text-sm"}" placeholder="${"Error: δ" + escape(variable.name, true)}"${add_attribute("value", VariableList[index].error, 0)}>
					<button class="${"bg-secondary rounded-lg shadow bg-opacity-100 p-0.5 hover:bg-accent-engage hover:bg-opacity-10 hover:rounded transition-all w-1/6"}">Unusable!
					</button>
				</div>`}
		</div>`;
  })}</div>`;
});
const rules_simp = [
  "n1/n2/n3 -> n1/(n2*n3)",
  "n1^(1/2) -> sqrt(n1)",
  "n1^(-1/2) -> 1/sqrt(n1)",
  "sqrt(n1^2*n2^2) -> n1*n2"
];
simplify.rules.concat(rules_simp);
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: "html{background-color:#23272a;--tw-text-opacity:1;color:rgb(255 255 255 / var(--tw-text-opacity))}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let exp_string = "x+y";
  let variables = ["x", "y"];
  let ErrPro = "";
  let Ltx = "log(x)";
  let err_pro_latex = "";
  let expM = "";
  let expQ = "";
  let latex_string = "";
  class Variable {
    // @ts-ignore
    constructor(name, alias = "", error = "", usable = true) {
      this.name = name;
      this.alias = alias;
      this.error = error;
      this.usable = usable;
    }
  }
  let VariableList = [];
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
  update_variable_list();
  let DisplayOptionList = ["Python", "Excel", "Latex"];
  let DisplayOption = "Python";
  let ErrorOptionList = ["Absolute", "Quadratic"];
  let ErrorOption = "Absolute";
  const snapshot = {
    capture: () => [
      VariableList,
      ErrPro,
      exp_string,
      DisplayOption,
      ErrorOption,
      Ltx,
      latex_string
    ],
    restore: (value) => (VariableList = value[0], ErrPro = value[1], exp_string = value[2], DisplayOption = value[3], ErrorOption = value[4], Ltx = value[5], latex_string = value[6])
  };
  if ($$props.snapshot === void 0 && $$bindings.snapshot && snapshot !== void 0)
    $$bindings.snapshot(snapshot);
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `<h1 class="${"text-center font-bold font-mono text-2xl p-4"}">Error Propagation Calculator</h1>

<div class="${"flex flex-initial"}"><div class="${"w-full max-w-4xl"}"><div class="${"flex gap-2 p-4"}"><input class="${"bg-inputs p-3 rounded border transition-all"}"${add_attribute("value", exp_string, 0)}>
			<button class="${"bg-secondary shadow rounded-lg p-0.5 hover:bg-accent-engage hover:bg-opacity-50 hover:rounded transition-all"}">Get Variables</button>
			<button id="${"get-equation "}" class="${"bg-secondary shadow rounded-lg hover:bg-accent-engage hover:bg-opacity-50 hover:rounded transition-all"}">Get Expression</button>
			<button class="${"bg-secondary shadow rounded-lg hover:bg-red hover:bg-opacity-50 p-2 hover:rounded transition-all"}">Clear</button></div>

		${``}

		${``}

		${validate_component(Display_results, "DisplayResults").$$render(
      $$result,
      {
        exp: latex_string,
        exp_latex: Ltx,
        flag_latex: 1
      },
      {},
      {}
    )}

		${validate_component(Variable_menu, "VariableMenu").$$render(
      $$result,
      { VariableList },
      {
        VariableList: ($$value) => {
          VariableList = $$value;
          $$settled = false;
        }
      },
      {}
    )}

		<div class="${"flex m-3 gap-2"}">${validate_component(Dropdown, "Dropdown").$$render(
      $$result,
      {
        OptionList: DisplayOptionList,
        Option: DisplayOption
      },
      {
        Option: ($$value) => {
          DisplayOption = $$value;
          $$settled = false;
        }
      },
      {}
    )}
			${validate_component(Dropdown, "Dropdown").$$render(
      $$result,
      {
        OptionList: ErrorOptionList,
        Option: ErrorOption
      },
      {
        Option: ($$value) => {
          ErrorOption = $$value;
          $$settled = false;
        }
      },
      {}
    )}
			<button class="${"shadow bg-secondary rounded-lg p-0.5 hover:bg-accent-engage hover:bg-opacity-50 hover:rounded hover:m-0.5 transition-all"}">Get Error Propagation</button></div>

		${validate_component(Display_results, "DisplayResults").$$render(
      $$result,
      {
        exp: ErrPro,
        exp_latex: err_pro_latex,
        flag_latex: DisplayOption == "Latex"
      },
      {},
      {}
    )}

		${validate_component(Box, "Box").$$render($$result, { expM, expQ }, {}, {})}</div>
	<div class="${"bg-primary md:w-1/4"}"></div>
</div>`;
  } while (!$$settled);
  return $$rendered;
});
export {
  Page as default
};
