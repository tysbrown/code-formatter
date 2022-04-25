/* eslint-disable no-template-curly-in-string */
import React, { useState } from "react";
import "./App.css";
import { keywords } from "./keywords";

/**
 * I used template literals, string interpolation, RegEx, and several string methods (namely match and replaceAll) to solve this challenge
 *
 * @author Tyler Brown
 */

function App() {
  const [showFormatted, setShowFormatted] = useState(false);
  const [activeCodeblock, setActiveCodeblock] = useState(0);

  // Add 3-line codeblocks here and cycle through them with the "change codeblock" button
  const codeblocks = [
    [
      `for (let i = 1; i <= 10; i++) {`,
      "console.log(`Pass number ${i}`);",
      "}",
    ],
    [
      `for (let i = 1; i <= 10; i++) {`,
      "console.log(`Pass i let number 10 ${i}`);",
      "}",
    ],
    ["const myFunction = (x, y) => {", "return x + y", "}"],
  ];

  const formatCode = () => {
    setShowFormatted((prev) => !prev);
  };

  const changeCodeblock = () => {
    setActiveCodeblock((prev) =>
      prev === codeblocks.length - 1 ? 0 : prev + 1
    );
  };

  /**
   * Function to identify declared variables in the active codeblock, extract them, then format them all into a string that can be injected into a RegExp
   *
   * @returns {string} "var1|var2|var3|var4"
   */

  const extractVariablesFromLines = () => {
    // Positive lookbehind for let, const, and var (?<=let|const|var), pulls all non-newline characters(.*) until it hits whitespace (\S)
    // Target only those that are not between backticks (?=([^`]*`[^`]*`)*[^`]*$)
    const findVariablesRegex: RegExp = new RegExp(
      String.raw`(?<=let|const|var)(?=([^\`]*\`[^\`]*\`)*[^\`]*$).\S*`,
      "g"
    );

    // Find all variables declared in each line, store the returned array
    const variablesArr: string[] = codeblocks[activeCodeblock].map(
      (node: any) => node.match(findVariablesRegex)
    );

    // Flatten array and convert it to a string
    const flattenedVariablesArr: string = variablesArr.flat().toString();

    // Prepare string to be injected into a RegExp
    return flattenedVariablesArr
      .replaceAll(", ", "|")
      .replaceAll(",", "")
      .trim();
  };

  /**
   * The main format function. Consumes a string from the active codeblock and highlights ES6 syntax.
   *
   * @param {string} line A single string from the active codeblock
   */

  const format = (line: string) => {
    // Target one or more digit(s) and only those that are standalone numbers
    const numberRegex: RegExp = /\b\d+(?=([^`]*`[^`]*`)*[^`]*$)\b/g;

    // Target these specific words that are standalone and not between backticks (keywords imported from keywords.tsx)
    const keywordRegex: RegExp = new RegExp(
      String.raw`\b(${keywords})(?=([^\`]*\`[^\`]*\`)*[^\`]*$)\b`,
      "g"
    );

    // Target string literals, including the backticks
    const stringRegex: RegExp = /`.*?`/g;

    // Target these specific words that are standalone (declared variable names are extracted and injected with string interpolation),
    // and not between backticks (?=([^\`]*\`[^\`]*\`)*[^\`]*$), unless it's between curly braces (?<=\{)(.*?)(?=\})
    const variableRegex = new RegExp(
      String.raw`\b(${extractVariablesFromLines()})(?=([^\`]*\`[^\`]*\`)*[^\`]*$)|(?<=\{)(.*?)(?=\})\b`,
      "g"
    );

    // REPLACER CALLBACKS FOR REPLACEALL() METHODS
    // NOTE: I wouldn't normally use inline styles, just as a general best practice, but as 'class' is a reserved word I'd either have to account for
    // its use in the keyword regular expression or just use inline styles here. If I had more time to polish I'd do the former.
    const numberReplacer = (x: string) => {
      return `<span style='color: red;'>${x}</span>`;
    };

    const keywordReplacer = (x: string) => {
      return `<span style='font-weight: 700;'>${x}</span>`;
    };

    const stringReplacer = (x: string) => {
      return `<span style='color: green;'>${x}</span>`;
    };

    const variableReplacer = (x: string) => {
      return `<span style='color: blue; font-weight: 700;'>${x}</span>`;
    };

    // Format the string
    const formatString: string = line
      .replaceAll(numberRegex, numberReplacer)
      .replaceAll(keywordRegex, keywordReplacer)
      .replaceAll(variableRegex, variableReplacer)
      .replaceAll(stringRegex, stringReplacer);

    // Inject into the DOM
    return <div dangerouslySetInnerHTML={{ __html: formatString }}></div>;
  };

  // Iterates over the 'lines' array, formats each line, and wraps each line in a div.
  const renderFormattedCode = () => {
    return codeblocks[activeCodeblock].map((line: string, i: number) => (
      <div key={i} className="line">
        {format(line)}
      </div>
    ));
  };

  const renderUnformattedCode = () => {
    return codeblocks[activeCodeblock].map((line: string, i: number) => (
      <div key={i} className="line">
        {line}
      </div>
    ));
  };

  return (
    <div className="App">
      <div className="code-wrap">
        <div className="column">
          <h1>Code</h1>
          {renderUnformattedCode()}
        </div>
        <div className="column">
          <button onClick={formatCode}>
            {showFormatted ? "Remove Formatting" : "Format Code"}
          </button>
          <button onClick={changeCodeblock} style={{ marginTop: "10px" }}>
            Change Codeblock
          </button>
        </div>
        <div className="column">
          <h1>{showFormatted ? "Formatted" : "Unformatted"}</h1>
          {showFormatted ? renderFormattedCode() : renderUnformattedCode()}
        </div>
      </div>
    </div>
  );
}

export default App;
