const btns = Array.from(document.querySelectorAll(".button"));
const input = document.querySelector(".input");
const expression = document.querySelector(".expression");
const errorsList = document.querySelector(".errors");

let a = "";
let b = "";
let symbol = null;
let disabledBtnsClass = ["btn-plus", "btn-multiply", "btn-divide", "btn-equal"];
let result = "";

const DIGITS = ["btn-0", "btn-1","btn-2", "btn-3", "btn-4", "btn-5", "btn-6", "btn-7","btn-8","btn-9"];
const SYMBOLS_WITHOUT_MINUS = ["btn-plus", "btn-divide", "btn-multiply"];
const SYMBOL_MINUS = ["btn-minus"];
const SYMBOL_EQUAL = ["btn-equal"];
const DOT = ["btn-dot"];

const regDigit = /\d/;
const regNotDigit = /\D/;
const regDivideByZero = /\/0+\D?0*$/;
const regEndWithZero = /0$/;
const regDoubleSymbols = /\D-/;

const errors = {
  NoMoreDigits: "нельзя добавлять больше цифр, числа должны состоять не более чем из 6 цифр",
  NoMoreDot: "нельзя больше добавить точку, числа могут иметь только одну",
  NoEqual: "введены не все данные или введены некорректные данные, нельзя нажать 'равно'",
  NoMoreSymbols: "нельзя добавлять больше математических знаков",
  NoMoreSymbolsButMinus: "нельзя ввести никакой математический знак, кроме минуса",
};

function clear() {
  a = "";
  b = "";
  symbol = null;
  input.value = "";
}

function pressButton(btn) {
  const btnClass = btn.classList[2];
  expression.textContent = result ? `= ${result}` : "";

  switch (btnClass) {
    case "clear":
      clear();
      break;

    case "equal":
      mathResolve(a, b, symbol);
      break;

    case "dot":
      addDot();
      break;

    case "symbol":
      addSymbol(btn.textContent);
      break;

    default:
      addToInput(btn.textContent);
  }

  checkInputValue(btn.textContent);
  showErrors();
}

function addToInput(btn) {
  input.value += btn;

  if (!symbol) {
    a += btn;
  } else {
    b += btn;
  }
}

function addSymbol(btn) {
  if (!symbol && a) {
    symbol = btn;
    input.value += btn;
  } else {
    addToInput(btn);
  }
}

function addDot() {
  if (regDigit.test(input.value.slice(-1))) {
    addToInput(".");
  } else {
    addToInput("0.");
  }
}

function checkInputValue(btn) {
  const testArray = [
    {
      test: btn === "C" || symbol,
      block: SYMBOLS_WITHOUT_MINUS,
    },
    {
      test: input.value === "-",
      block: [].concat(SYMBOLS_WITHOUT_MINUS, SYMBOL_MINUS, SYMBOL_EQUAL),
    },
    {
      test: !symbol && a.replace(regNotDigit, "").length >= 6,
      block: [].concat(DIGITS, DOT),
    },
    {
      test: symbol && b.replace(regNotDigit, "").length === 6,
      block: [].concat(DIGITS, DOT),
    },
    {
      test: regDoubleSymbols.test(input.value) || b,
      block: SYMBOL_MINUS,
    },
    {
      test: !symbol && a.includes("."),
      block: DOT,
    },
    {
      test: symbol && b.includes("."),
      block: DOT,
    },
    {
      test: regDivideByZero.test(input.value),
      block: SYMBOL_EQUAL,
    },
    {
      test: b === "" || b === "-",
      block: SYMBOL_EQUAL,
    },
  ];

  disabledBtnsClass = [];

  for (let i in testArray) {
    if (testArray[i].test) {
      disabledBtnsClass = disabledBtnsClass.concat(testArray[i].block);
    }
  }

  toggleDisableBtns();
}

function toggleDisableBtns() {
  btns.forEach((btn) => {
    btn.removeAttribute("disabled");
  });

  if (disabledBtnsClass.length > 0) {
    disabledBtnsClass.forEach((btnClass) => {
      const btn = btns.find((btn) => btn.classList.contains(btnClass));
      btn.setAttribute("disabled", "disabled");
    });
  }
}

function mathResolve(a, b, symbol) {
  a = Number(a);
  b = Number(b);

  switch (symbol) {
    case "-":
      result = a - b;
      break;
    case "+":
      result = a + b;
      break;
    case "*":
      result = a * b;
      break;
    case "/":
      result = a / b;
      break;
  }

  result = Number.isInteger(result) ? result : Number(result.toFixed(2));
  expression.textContent = `${a} ${symbol} ${b} =`;

  clear();
  addToInput(result);
}

function includeClass(cl) {
  return disabledBtnsClass.includes(cl);
}

function addError(message) {
  const element = document.createElement("li");
  element.textContent = message;
  element.classList.add("error");

  errorsList.appendChild(element);
}

function showErrors() {
  while (errorsList.firstChild) {
    errorsList.firstChild.remove();
  }

  if (disabledBtnsClass.length > 0) {
    errorsList.parentElement.classList.remove("hide");

    includeClass("btn-0") && addError(errors.NoMoreDigits);

    includeClass("btn-dot") && addError(errors.NoMoreDot);

    includeClass("btn-equal") && addError(errors.NoEqual);

    includeClass("btn-minus") && addError(errors.NoMoreSymbols);

    includeClass("btn-divide") && !includeClass("btn-minus") && addError(errors.NoMoreSymbolsButMinus);

  } else {
    errorsList.parentElement.classList.add("hide");
  }
}

showErrors();

btns.forEach((btn) => {
  btn.addEventListener("click", () => pressButton(btn));
});

