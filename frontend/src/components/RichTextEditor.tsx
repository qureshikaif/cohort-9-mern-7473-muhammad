import { useEffect } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface Tool {
  label: string;
  title: string;
  isActive: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
}

const tools: Tool[] = [
  {
    label: 'B',
    title: 'Bold',
    isActive: (e) => e.isActive('bold'),
    run: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    label: 'I',
    title: 'Italic',
    isActive: (e) => e.isActive('italic'),
    run: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    label: 'H1',
    title: 'Heading 1',
    isActive: (e) => e.isActive('heading', { level: 1 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    label: 'H2',
    title: 'Heading 2',
    isActive: (e) => e.isActive('heading', { level: 2 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: 'List',
    title: 'Bullet list',
    isActive: (e) => e.isActive('bulletList'),
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    label: '1.',
    title: 'Numbered list',
    isActive: (e) => e.isActive('orderedList'),
    run: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    label: 'Quote',
    title: 'Quote',
    isActive: (e) => e.isActive('blockquote'),
    run: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    label: 'Code',
    title: 'Inline code',
    isActive: (e) => e.isActive('code'),
    run: (e) => e.chain().focus().toggleCode().run(),
  },
];

interface Props {
  value: string;
  onChange: (html: string) => void;
}

export function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: 'Start writing...' })],
    content: value,
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
    editorProps: {
      attributes: { class: 'note-prose ruled min-h-[45vh]' },
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return <div className="min-h-[45vh]" />;
  }

  return (
    <>
      <div className="mb-2.5 flex flex-wrap gap-1 border-y border-edge py-2">
        {tools.map((tool) => (
          <button
            key={tool.title}
            type="button"
            title={tool.title}
            aria-pressed={tool.isActive(editor)}
            onClick={() => tool.run(editor)}
            className="min-w-9 cursor-pointer rounded-md px-2.5 py-1 text-sm text-ink-soft transition-colors duration-150 hover:bg-ink/10 hover:text-ink aria-pressed:bg-accent-soft aria-pressed:text-accent"
          >
            {tool.label}
          </button>
        ))}
      </div>

      <EditorContent editor={editor} />
    </>
  );
}
