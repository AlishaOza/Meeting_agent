import { useEffect } from "react";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

interface Props {
  initialContent: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
  ariaLabel: string;
}

function setLink(editor: Editor) {
  const previous = editor.getAttributes("link").href as string | undefined;
  const input = window.prompt("Enter link URL (leave empty to remove the link)", previous ?? "https://");
  if (input === null) return; // cancelled

  const url = input.trim();
  if (url === "" || url === "https://") {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  const href = /^(https?:\/\/|mailto:)/i.test(url) ? url : `https://${url}`;
  editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
}

function Toolbar({ editor, disabled }: { editor: Editor; disabled: boolean }) {
  const buttons = [
    {
      key: "h2", label: "H2", title: "Heading 2",
      active: editor.isActive("heading", { level: 2 }),
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      key: "h3", label: "H3", title: "Heading 3",
      active: editor.isActive("heading", { level: 3 }),
      run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      key: "bold", label: "B", title: "Bold",
      active: editor.isActive("bold"),
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      key: "italic", label: "I", title: "Italic",
      active: editor.isActive("italic"),
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      key: "ul", label: "• List", title: "Bulleted list",
      active: editor.isActive("bulletList"),
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      key: "ol", label: "1. List", title: "Numbered list",
      active: editor.isActive("orderedList"),
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      key: "link", label: "Link", title: "Add or edit link",
      active: editor.isActive("link"),
      run: () => setLink(editor),
    },
  ];

  return (
    <div className="rte-toolbar" role="toolbar" aria-label="Formatting options">
      {buttons.map((b) => (
        <button
          key={b.key}
          type="button"
          className={`rte-btn rte-btn-${b.key}`}
          title={b.title}
          aria-label={b.title}
          aria-pressed={b.active}
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()} 
          onClick={b.run}
        >
          {b.label}
        </button>
      ))}
      <span className="rte-sep" aria-hidden="true" />
      <button
        type="button"
        className="rte-btn"
        title="Undo"
        aria-label="Undo"
        disabled={disabled || !editor.can().undo()}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        ↶
      </button>
      <button
        type="button"
        className="rte-btn"
        title="Redo"
        aria-label="Redo"
        disabled={disabled || !editor.can().redo()}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        ↷
      </button>
    </div>
  );
}

export default function RichTextEditor({
  initialContent,
  onChange,
  disabled = false,
  placeholder = "Start typing...",
  ariaLabel,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: initialContent,
    autofocus: "end",
    editorProps: {
      attributes: { "aria-label": ariaLabel, role: "textbox", "aria-multiline": "true" },
    },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) return null;

  return (
    <div className={`rte ${disabled ? "rte-disabled" : ""}`}>
      <Toolbar editor={editor} disabled={disabled} />
      <EditorContent editor={editor} />
    </div>
  );
}