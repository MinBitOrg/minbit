import { useCallback, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { yaml } from '@codemirror/lang-yaml';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language: 'yaml' | 'markdown' | 'env';
  readOnly?: boolean;
  height?: string;
  className?: string;
}

// Custom theme extension for consistent styling
const customTheme = EditorView.theme({
  '&': {
    fontSize: '13px',
    fontFamily: 'JetBrains Mono, monospace',
  },
  '.cm-content': {
    padding: '12px 0',
  },
  '.cm-line': {
    padding: '0 12px',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    border: 'none',
    paddingLeft: '8px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
});

const CodeEditor = ({
  value,
  onChange,
  language,
  readOnly = false,
  height = '400px',
  className = '',
}: CodeEditorProps) => {
  const handleChange = useCallback(
    (val: string) => {
      if (onChange) {
        onChange(val);
      }
    },
    [onChange]
  );

  const extensions = useMemo(() => {
    const baseExtensions = [
      customTheme,
      EditorView.lineWrapping,
    ];

    switch (language) {
      case 'yaml':
        return [...baseExtensions, yaml()];
      case 'markdown':
        return [...baseExtensions, markdown()];
      case 'env':
        // Use basic setup for .env files (no specific language support needed)
        return baseExtensions;
      default:
        return baseExtensions;
    }
  }, [language]);

  return (
    <div className={`rounded-lg overflow-hidden border border-border ${className}`}>
      <CodeMirror
        value={value}
        height={height}
        theme={oneDark}
        extensions={extensions}
        onChange={handleChange}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
          rectangularSelection: true,
          crosshairCursor: false,
          highlightSelectionMatches: true,
          searchKeymap: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
