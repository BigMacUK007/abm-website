import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkNode } from '@lexical/link';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import type { EditorState } from 'lexical';

const theme = {
  ltr: 'ltr',
  rtl: 'rtl',
  paragraph: 'mb-2',
  quote: 'border-l-4 border-gray-300 pl-4 italic my-4',
  heading: {
    h1: 'text-4xl font-bold mb-4 mt-6',
    h2: 'text-3xl font-bold mb-3 mt-5',
    h3: 'text-2xl font-bold mb-2 mt-4',
    h4: 'text-xl font-bold mb-2 mt-3',
    h5: 'text-lg font-bold mb-1 mt-2',
  },
  list: {
    nested: {
      listitem: 'list-none',
    },
    ol: 'list-decimal ml-4 mb-2',
    ul: 'list-disc ml-4 mb-2',
    listitem: 'ml-4',
  },
  link: 'text-blue-600 hover:underline',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    code: 'bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded font-mono text-sm',
  },
  code: 'bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono text-sm block my-2',
};

function onError(error: Error) {
  console.error('Lexical error:', error);
}

// Toolbar Component
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatText = (format: 'bold' | 'italic' | 'underline' | 'code') => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editor.dispatchCommand({ type: `FORMAT_TEXT_COMMAND`, payload: format } as any, undefined);
  };

  const formatHeading = (tag: 'h1' | 'h2' | 'h3' | 'p') => {
    editor.update(() => {
      const selection = editor.getEditorState().read(() => {
        return editor.getEditorState()._selection;
      });
      if (selection) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        editor.dispatchCommand({ type: 'FORMAT_ELEMENT_COMMAND', payload: tag } as any, undefined);
      }
    });
  };

  return (
    <div className="flex items-center space-x-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <button
        onClick={() => formatHeading('h1')}
        className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        title="Heading 1"
      >
        H1
      </button>
      <button
        onClick={() => formatHeading('h2')}
        className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        title="Heading 2"
      >
        H2
      </button>
      <button
        onClick={() => formatHeading('h3')}
        className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        title="Heading 3"
      >
        H3
      </button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
      <button
        onClick={() => formatText('bold')}
        className="px-3 py-1 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        title="Bold"
      >
        B
      </button>
      <button
        onClick={() => formatText('italic')}
        className="px-3 py-1 text-sm italic text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        title="Italic"
      >
        I
      </button>
      <button
        onClick={() => formatText('underline')}
        className="px-3 py-1 text-sm underline text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        title="Underline"
      >
        U
      </button>
      <button
        onClick={() => formatText('code')}
        className="px-3 py-1 text-sm font-mono text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        title="Code"
      >
        {'<>'}
      </button>
    </div>
  );
}

interface LexicalEditorProps {
  initialContent?: string;
  onChange?: (editorState: EditorState) => void;
}

export default function LexicalEditor({ initialContent, onChange }: LexicalEditorProps) {
  const initialConfig = {
    namespace: 'ArticleEditor',
    theme,
    onError,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
    editorState: initialContent,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="min-h-[500px] p-4 outline-none prose dark:prose-invert max-w-none" />
          }
          placeholder={
            <div className="absolute top-16 left-4 text-gray-400 pointer-events-none">
              Start writing your article...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        {onChange && <OnChangePlugin onChange={onChange} />}
      </div>
    </LexicalComposer>
  );
}
