import React, { useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { EditorView, Decoration } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { RangeSetBuilder, StateField } from '@codemirror/state';

// Define inline styles for the highlight class
const highlightStyle = `
  .cm-highlight-variable {
    color: #007ACC; /* Change to the desired highlight color */
    font-weight: bold;
  }
`;

const createVariableHighlightStyle = (variableNames) => {
  return EditorView.decorations.compute(
    [
      EditorView.updateListener.of((update) => {
        if (update.docChanged || update.selectionSet) {
          return true;
        }
        return false;
      }),
    ],
    (state) => {
      const builder = new RangeSetBuilder();
      const tree = syntaxTree(state);

      tree.iterate({
        enter: (node) => {
          if (node.name === 'VariableName') {
            const from = node.from;
            const to = node.to;
            const variableName = state.doc.sliceString(from, to);
            if (variableNames.includes(variableName)) {
              builder.add(
                from,
                to,
                Decoration.mark({ class: 'cm-highlight-variable' })
              );
            }
          }
        },
      });

      return builder.finish();
    }
  );
};

function PythonEditor({ nodeCode, onValueChange, nodeVariables }) {
  // Create a list of variable names
  const variableNames = nodeVariables.map((variable) => variable.label);

  // Create a highlight style for the variables
  const variableHighlightStyle = createVariableHighlightStyle(variableNames);

  useEffect(() => {
    // Inject the highlight style into the document
    const style = document.createElement('style');
    style.textContent = highlightStyle;
    document.head.append(style);

    return () => {
      style.remove();
    };
  }, []);

  return (
    <div>
      <CodeMirror
        value={nodeCode}
        height="60px" // Adjust height as necessary
        extensions={[python(), variableHighlightStyle]}
        onChange={(value, viewUpdate) => {
          onValueChange(value);
        }}
        theme="light" // Choose the theme as necessary
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
        }}
      />
    </div>
  );
}

export default PythonEditor;
