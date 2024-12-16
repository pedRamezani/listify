import "./index.css";

import {
  EditorView,
  lineNumbers,
  highlightActiveLineGutter,
  // highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  // highlightActiveLine,
  keymap,
  placeholder,
} from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import {
  // foldGutter,
  indentOnInput,
  // syntaxHighlighting,
  // defaultHighlightStyle,
  // bracketMatching,
  foldKeymap,
} from "@codemirror/language";
import {
  history,
  defaultKeymap,
  emacsStyleKeymap,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import {
  // closeBrackets,
  // autocompletion,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
import { lintKeymap } from "@codemirror/lint";

const darkTheme = EditorView.theme(
  {
    // Reset
    "&.cm-focused": {
      outline: "none",
    },
    // Container Height and Overflow
    "&": {
      color: "var(--pico-color)",
      backgroundColor: "var(--pico-background-color)",
      transition:
        "background-color var(--pico-transition),color var(--pico-transition)",
      maxHeight: "60vh",
    },
    ".cm-scroller": { overflow: "auto" },
    ".cm-content, .cm-gutter": { minHeight: "5ch" },
    // Caret
    // ".cm-content": {
    //   caretColor: "var(--pico-primary)",
    // },
    "&.cm-focused .cm-cursor": {
      borderWidth: "2px",
      borderLeftColor: "var(--pico-primary)",
    },
    // Selection
    // "::selection": {
    //   backgroundColor: "var(--pico-text-selection-color)",
    // },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
      backgroundColor: "var(--pico-text-selection-color) !important",
    },
    ".cm-selectionMatch": {
      backgroundColor: "var(--pico-form-element-active-border-color)",
    },
    // Gutter
    ".cm-gutters": {
      fontSize: ".9em",
      backgroundColor: "var(--pico-card-background-color)",
      color: "var(--pico-muted-color)",
      borderRight: "3px solid var(--pico-muted-border-color)",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "var(--pico-muted-border-color)",
    },
    // Placeholder
    ".cm-placeholder": {
      color: "var(--pico-form-element-placeholder-color)",
    },
  }
  //   { dark: true }
);

const baseExtensions = [
  darkTheme,
  lineNumbers({
    formatNumber: (lineNo, _) => lineNo.toString().padStart(2, "\u00A0"),
  }),
  highlightActiveLineGutter(),
  // highlightSpecialChars({
  //     specialChars: /,/g
  // }),
  history({
    minDepth: 150,
    newGroupDelay: 1000,
  }),
  // foldGutter(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  // syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  // bracketMatching(),
  // closeBrackets(),
  // autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  // highlightActiveLine(),
  highlightSelectionMatches(),
  placeholder("Enter your text here"),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...emacsStyleKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
    indentWithTab,
  ]),
];

// Input Seperator
const defaultInputSeperator = "\n";

const inputSeperatorElement = document.querySelector<HTMLInputElement>(
  "input[name='input-seperator']"
);

let inputSeperator: RegExp | string = inputSeperatorElement?.value
  ? new RegExp(inputSeperatorElement.value)
  : defaultInputSeperator;

inputSeperatorElement?.addEventListener("input", (event) => {
  const target = event.target as HTMLInputElement | null;

  if (!target?.value) {
    inputSeperator = defaultInputSeperator;
    target?.removeAttribute("aria-invalid");
    return;
  }

  try {
    inputSeperator = new RegExp(target.value);
    target.setAttribute("aria-invalid", "false");
  } catch (error) {
    console.error(error);
    inputSeperator = defaultInputSeperator;
    target.setAttribute("aria-invalid", "true");
  }
});

// Output Seperator
function replaceSpecialCharacters(text: string) {
  return text.replace(
    /\\n/g, "\n"
  ).replace(
    /\\t/g, "\t"
  );
}

const defaultOutputSeperator = ", ";

const outputSeperatorElement = document.querySelector<HTMLInputElement>(
  "input[name='output-seperator']"
);

let outputSeperator: string = outputSeperatorElement?.value
  ? replaceSpecialCharacters(outputSeperatorElement.value)
  : defaultOutputSeperator;

outputSeperatorElement?.addEventListener("input", (event) => {
  const target = event.target as HTMLInputElement | null;
  outputSeperator = target?.value
    ? replaceSpecialCharacters(outputSeperatorElement.value)
    : defaultOutputSeperator;
});

// Quote
const quoteElements =
  document.querySelectorAll<HTMLButtonElement>("button[data-quote]");

let quote =
  Array.from(quoteElements).find(
    (element) => element.getAttribute("aria-current") == "true"
  )?.dataset.quote ?? '"';

quoteElements.forEach((quoteEl) => {
  const otherElements = Array.from(quoteElements).filter(
    (element) => element.dataset.quote != quoteEl.dataset.quote
  );
  quoteEl.addEventListener("click", (_) => {
    quote = quoteEl.dataset.quote ?? '"';
    quoteEl.setAttribute("aria-current", "true");
    otherElements.forEach((otherEl) => {
      otherEl.setAttribute("aria-current", "false");
    });
  });
});

const numberRegex = RegExp(/^-?[0-9](?:[0-9.,]+)?/);

const quoteNumbersElement = document.querySelector<HTMLInputElement>(
  "input[name='quote-numbers']"
);

let quoteNumbers = quoteNumbersElement ? quoteNumbersElement.checked : true;

quoteNumbersElement?.addEventListener("input", (event) => {
  if (event.target != null) {
    const target = event.target as HTMLInputElement;
    quoteNumbers = target.checked;
  }
});

const convertSpecialElement = document.querySelector<HTMLInputElement>(
  "input[name='convert-special']"
);

let convertSpecial = convertSpecialElement ? convertSpecialElement.checked : true;

convertSpecialElement?.addEventListener("input", (event) => {
  if (event.target != null) {
    const target = event.target as HTMLInputElement;
    convertSpecial = target.checked;
  }
});

// Bracket
const bracketElements = document.querySelectorAll<HTMLButtonElement>(
  "button[data-bracket]"
);

const brackets = (function () {
  const activeBracketData =
    Array.from(bracketElements).find(
      (element) => element.getAttribute("aria-current") == "true"
    )?.dataset.bracket ?? "[]";
  return {
    left: activeBracketData.slice(0, 1),
    right: activeBracketData.slice(1, 2),
  };
})();

bracketElements.forEach((bracketEl) => {
  const otherElements = Array.from(bracketElements).filter(
    (element) => element.dataset.bracket != bracketEl.dataset.bracket
  );
  bracketEl.addEventListener("click", (_) => {
    brackets.left = (bracketEl.dataset.bracket ?? "[]").slice(0, 1);
    brackets.right = (bracketEl.dataset.bracket ?? "[]").slice(1, 2);
    bracketEl.setAttribute("aria-current", "true");
    otherElements.forEach((otherEl) => {
      otherEl.setAttribute("aria-current", "false");
    });
  });
});

// Sort
const sortElements =
  document.querySelectorAll<HTMLButtonElement>("button[data-sort]");

const sort = (function () {
  const activeSortData =
    Array.from(sortElements).find(
      (element) => element.getAttribute("aria-current") == "true"
    )?.dataset.sort ?? "";
  return {
    active: activeSortData == "asc" || activeSortData == "dsc",
    ascending: activeSortData == "asc",
  };
})();

sortElements.forEach((sortEl) => {
  const otherElements = Array.from(sortElements).filter(
    (element) => element.dataset.sort != sortEl.dataset.sort
  );
  sortEl.addEventListener("click", (_) => {
    sort.active = sortEl.dataset.sort == "asc" || sortEl.dataset.sort == "dsc";
    sort.ascending = sortEl.dataset.sort == "asc";
    sortEl.setAttribute("aria-current", "true");
    otherElements.forEach((otherEl) => {
      otherEl.setAttribute("aria-current", "false");
    });
  });
});

// Remove
const trimElement =
  document.querySelector<HTMLInputElement>("input[name='trim']");

let trim = trimElement ? trimElement.checked : true;

trimElement?.addEventListener("input", (event) => {
  if (event.target != null) {
    const target = event.target as HTMLInputElement;
    trim = target.checked;
  }
});

const emptyLineRegex = RegExp(/^\s*$(?:\r\n?|\n)/, "gm");

const whitespaceElement = document.querySelector<HTMLInputElement>(
  "input[name='whitespace']"
);

let removeWhitespace = whitespaceElement ? whitespaceElement.checked : true;

whitespaceElement?.addEventListener("input", (event) => {
  if (event.target != null) {
    const target = event.target as HTMLInputElement;
    removeWhitespace = target.checked;
  }
});

const duplicateElement = document.querySelector<HTMLInputElement>(
  "input[name='duplicate']"
);

let removeDuplicates = duplicateElement ? duplicateElement.checked : false;

duplicateElement?.addEventListener("input", (event) => {
  if (event.target != null) {
    const target = event.target as HTMLInputElement;
    removeDuplicates = target.checked;
  }
});

const diacriticRegex = RegExp(/[\u0300-\u036f]/, "g");

const diacriticElement = document.querySelector<HTMLInputElement>(
  "input[name='diacritic']"
);

let removeDiacritics = diacriticElement ? diacriticElement.checked : false;

diacriticElement?.addEventListener("input", (event) => {
  if (event.target != null) {
    const target = event.target as HTMLInputElement;
    removeDiacritics = target.checked;
  }
});

// Transform
const transformElements = document.querySelectorAll<HTMLInputElement>(
  "input[name='transform']"
);

let transform: string =
  Array.from(transformElements).find((element) => element.checked)?.value ??
  "none";

transformElements.forEach((element) => {
  element.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      transform = target.value;
    }
  });
});

// Input, Output
const outputElement = document.querySelector<HTMLTextAreaElement>(
  "textarea[name='output']"
);

function magic(text: string) {
  let result = text;

  if (trim) {
    result = result.trim();
  }

  if (removeWhitespace) {
    result = result.replace(emptyLineRegex, "");
  }

   if (removeDiacritics) {
    result = result.normalize("NFKD").replace(diacriticRegex, "")
  }

  let entries = result.split(inputSeperator);

  if (removeDuplicates && entries.length > 10_000) {
    // Hoping to reduce the size to make the next steps run faster?
    entries = [...new Set(entries)];
  }

  switch (transform) {
    case "lower":
      entries = entries.map((entry) => entry.toLowerCase());
      break;

    case "upper":
      entries = entries.map((entry) => entry.toUpperCase());
      break;

    case "capital":
      entries = entries.map((entry) =>
        entry.replace(/\b(?<firstChar>\w)/g, (_, firstChar) =>
          firstChar.toUpperCase()
        )
      );
      break;

    case "camel":
      entries = entries.map((entry) =>
        entry
          .replace(/\b\w/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
          })
          .replace(/\s+/g, "")
      );
      break;

    case "snake":
      entries = entries.map((entry) =>
        entry.trim()
          .replace(/(?<![A-Z]|\b)[A-Z]/g, (match) => ` ${match}`)
          .replace(/\s+/g, "_")
          .toLowerCase()
      );
      break;

    default:
      break;
  }

  if (convertSpecial) {
    entries = entries.map((entry) => entry.replace(/\n/g, '\\n').replace(/\t/g, '\\t'));
  }

  if (removeDuplicates) {
    entries = [...new Set(entries)];
  }

  if (sort.active) {
    if (sort.ascending) {
      entries.sort((a, b) => a.localeCompare(b));
    } else {
      entries.sort((a, b) => b.localeCompare(a));
    }
  }

  result = entries
    .map((entries) => {
      if (quoteNumbers) {
        return `${quote}${entries}${quote}`;
      } else {
        return numberRegex.test(entries)
          ? entries
          : `${quote}${entries}${quote}`;
      }
    })
    .join(outputSeperator);

  return `${brackets.left}${result}${brackets.right}`;
}

new EditorView({
  extensions: [
    ...baseExtensions,
    EditorView.updateListener.of((update) => {
      if (outputElement != null) {
        outputElement.value = magic(update.state.doc.toString());
      }
    }),
  ],
  parent: document.getElementById("input") as Element,
});
