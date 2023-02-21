//import { parse, simplify, derivative } from "mathjs";
import {
  create,
  parseDependencies,
  simplifyDependencies,
  derivativeDependencies,
} from "mathjs";

const config = {
  // optionally, you can specify configuration
};

const { parse, simplify, derivative } = create(
  {
    parseDependencies,
    simplifyDependencies,
    derivativeDependencies,
  },
  config
);

const trigFunctions = [
  "sin",
  "cos",
  "tan",
  "sec",
  "csc",
  "cot",
  "asin",
  "acos",
  "atan",
  "asec",
  "acsc",
  "acot",
  "sinh",
  "cosh",
  "tanh",
  "sech",
  "csch",
  "coth",
  "asinh",
  "acosh",
  "atanh",
  "asech",
  "acsch",
  "acoth",
  "abs",
  "add",
  "asin",
  "acos",
  "atan",
  "acot",
  "asec",
  "acsc",
  "acosh",
  "asinh",
  "atanh",
  "acoth",
  "atan2",
  "bellNumbers",
  "bitAnd",
  "bitNot",
  "bitOr",
  "bitXor",
  "boolean",
  "cbrt",
  "ceil",
  "column",
  "compare",
  "concat",
  "cos",
  "cosh",
  "cross",
  "det",
  "diag",
  "divide",
  "dot",
  "equal",
  "erf",
  "erfc",
  "exp",
  "expm1",
  "eye",
  "filter",
  "floor",
  "forEach",
  "gamma",
  "get",
  "identity",
  "inv",
  "larger",
  "largest",
  "lcm",
  "log",
  "log10",
  "log1p",
  "log2",
  "map",
  "matrix",
  "max",
  "mean",
  "median",
  "min",
  "mod",
  "multiply",
  "norm",
  "not",
  "nthRoot",
  "number",
  "ones",
  "or",
  "parse",
  "permutations",
  "pickRandom",
  "pivot",
  "pow",
  "prod",
  "qr",
  "quantileSeq",
  "random",
  "range",
  "reshape",
  "resize",
  "round",
  "row",
  "set",
  "sign",
  "sin",
  "sinh",
  "size",
  "slice",
  "sort",
  "sparse",
  "squeeze",
  "sqrt",
  "sqrtm",
  "subtract",
  "sum",
  "tan",
  "tanh",
  "trace",
  "transpose",
  "trunc",
  "typeof",
  "unaryMinus",
  "unaryPlus",
  "unique",
  "update",
  "variance",
  "zeros",
  "pi",
];

const Excel_to_mathjs = {
  "CEILING(": "ceiling(",
  "DEGREES(": "degrees(",
  "RADIANS(": "radians(",
  "ACOSH(": "acosh(",
  "ASINH(": "asinh(",
  "ATAN2(": "atan2(",
  "ATANH(": "atanh(",
  "FLOOR(": "floor(",
  "LOG10(": "log10(",
  "POWER(": "pow(",
  "ROUND(": "round(",
  "ACOS(": "acos(",
  "ASIN(": "asin(",
  "ATAN(": "atan(",
  "COSH(": "cosh(",
  "FACT(": "factorial(",
  "SIGN(": "sign(",
  "SINH(": "sinh(",
  "SQRT(": "sqrt(",
  "TANH(": "tanh(",
  "COS(": "cos(",
  "EXP(": "exp(",
  "LOG(": "log(",
  "MOD(": "mod(",
  "SIN(": "sin(",
  "TAN(": "tan(",
  "ABS(": "abs(",
  "MAX(": "max(",
  "MIN(": "min(",
  "CSC(": "csc(",
  "LN(": "ln(",
  "PI()": "pi",
};

const rules_simp = [
  "n1/n2/n3 -> n1/(n2*n3)",
  "n1^(1/2) -> sqrt(n1)",
  "n1^(-1/2) -> 1/sqrt(n1)",
  'sqrt(n)^2 -> abs(n)',
  "sqrt(n1^2) -> abs(n1)",
  "abs(n1)*abs(n2) -> abs(n1*n2)",
];

const custom_rules = simplify.rules.concat(rules_simp);

function replaceExcelFunctions(input) {
  for (let [key, value] of Object.entries(Excel_to_mathjs)) {
    key = key.replace(/[()]/g, "\\$&");
    const regex = new RegExp(`${key}`, "g");
    input = input.replace(regex, value);
  }
  return input;
}

function replaceMathjsFunctions(input) {
  for (let [key, value] of Object.entries(Excel_to_mathjs)) {
    value = value.replace(/[()]/g, "\\$&");
    const regex = new RegExp(`${value}`, "g");
    input = input.replace(regex, key);
  }
  return input;
}

export function get_variables(exp_string) {
  exp_string = exp_string.replace(/\s/g, "").replace(/\,/g, ".");
  exp_string = replaceExcelFunctions(exp_string);
  const node = parse(exp_string);
  let variables = node
    .filter(function (node) {
      return node.isSymbolNode & !trigFunctions.includes(node.name);
    })
    .map(function (node) {
      return node.name;
    });
  return variables;
}

export function get_latex_exp(exp_string, VariableList) {
  exp_string = exp_string.toString().replace(/\s/g, "").replace(/\,/g, ".");
  exp_string = replaceExcelFunctions(exp_string);
  //console.log(custom_rules)
  let exp = simplify(exp_string, custom_rules);
  return exp.toTex().replace(/ȵ/g, '\\');
}

export function get_error_propagation_exp(
  exp_string,
  VariableList,
  DisplayOption,
  ErrorOption
) {
  let name_list = VariableList.map((variable) => variable.name);
  let alias_list = VariableList.map((variable) =>
    variable.alias == "" ? variable.name : variable.alias.replace(/\\/g, 'ȵ').replace(/\,/g, ".")
  );
  let error_list = VariableList.map((variable) =>
    variable.error == "" ? `δ${variable.name}` : variable.error.replace(/\\/g, 'ȵ').replace(/\,/g, ".")
  );
  let usable_list = VariableList.map((variable) => variable.usable);

  const allFalse = usable_list.every((element) => element === false);
  if (!name_list.length || allFalse) {
    return "0";
  }

  exp_string = exp_string.replace(/\s/g, "").replace(/\,/g, ".");
  exp_string = replaceExcelFunctions(exp_string);

  switch (ErrorOption) {
    case "Absolute":
      exp_string = get_ep_absolute(
        exp_string,
        name_list,
        alias_list,
        error_list,
        usable_list
      );
      break;
    case "Quadratic":
      exp_string = get_ep_quad(
        exp_string,
        name_list,
        alias_list,
        error_list,
        usable_list
      );
      break;
  }

  switch (DisplayOption) {
    case "Python":
      return simplify(exp_string).toString().replace(/\^/g, "**").replace(/ȵ/g, '\\');
      break;

    case "Excel":
      return replaceMathjsFunctions(simplify(exp_string).toString()).replace(/ȵ/g, '\\');
      break;

    case "Latex":
      return get_latex_exp(exp_string);
      break;
  }
}

function get_ep_absolute(
  exp_string,
  name_list,
  alias_list,
  error_list,
  usable_list
) {
  let final = "";
  var i,
    vari,
    len = name_list.length;
  for (i = 0; i < len; ++i) {
    vari = name_list[i];
    if (usable_list[i]) {
      final =
        final +
        ` + abs(${derivative(exp_string, parse(vari)).toString()})*δ${vari}`;
    }
  }

  // Create an object with key-value pairs for variable substitution -> aliases
  let substitutions = name_list.reduce((obj, varName, index) => {
    if (varName != alias_list[index]) {
      obj[varName] = parse(alias_list[index]);
    }
    return obj;
  }, {});

  if (substitutions) {
    final = simplify(final, substitutions);
  }

  //for error subsitution
  substitutions = name_list.reduce((obj, varName, index) => {
    if (`δ${varName}` != error_list[index]) {
      obj[`δ${varName}`] = parse(error_list[index]);
    }
    return obj;
  }, {});

  if (substitutions) {
    final = simplify(final, substitutions);
  }

  return final;
}

function get_ep_quad(
  exp_string,
  name_list,
  alias_list,
  error_list,
  usable_list
) {
  let final = "";
  var i,
    vari,
    len = name_list.length;
  for (i = 0; i < len; ++i) {
    vari = name_list[i];
    if (usable_list[i]) {
      final =
        final +
        ` + (${derivative(exp_string, parse(vari)).toString()})^2*(δ${vari})^2`;
    }
  }

  // Create an object with key-value pairs for variable substitution -> aliases
  let substitutions = name_list.reduce((obj, varName, index) => {
    if (varName != alias_list[index]) {
      obj[varName] = parse(alias_list[index]);
    }
    return obj;
  }, {});

  if (substitutions) {
    final = simplify(final, substitutions);
  }

  //for error subsitution
  substitutions = name_list.reduce((obj, varName, index) => {
    if (`δ${varName}` != error_list[index]) {
      obj[`δ${varName}`] = parse(error_list[index]);
    }
    return obj;
  }, {});

  if (substitutions) {
    final = simplify(final, substitutions);
  }

  return `(${final.toString()})^(1/2)`;
}
