'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useState } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Image as ImageIcon,
  Undo,
  Redo,
} from 'lucide-react';
import { uploadInlineImage } from '../_actions';

export function TiptapEditor({
  name,
  defaultValue,
  placeholder,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const [html, setHtml] = useState(defaultValue ?? '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Write your article...',
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-2xl my-4 mx-auto block' },
      }),
    ],
    content: defaultValue ?? '',
    editorProps: {
      attributes: {
        class:
          'prose-editor min-h-80 max-w-none px-4 py-3 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      setHtml(editor.getHTML());
    },
  });

  if (!editor) {
    return (
      <div className="rounded-lg border border-border bg-bg">
        <div className="h-10 border-b border-border" />
        <div className="min-h-80 px-4 py-3 text-sm text-fg-muted">
          Loading editor...
        </div>
      </div>
    );
  }

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt(
      'URL (leave empty to remove the link):',
      previous ?? 'https://',
    );
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  function pickImage() {
    if (!editor) return;
    setUploadError(null);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append('image', file);
        const result = await uploadInlineImage(fd);
        if (result.error) {
          setUploadError(result.error);
          return;
        }
        if (result.url) {
          editor.chain().focus().setImage({ src: result.url }).run();
        }
      } catch (err) {
        setUploadError(
          err instanceof Error ? err.message : 'Upload failed.',
        );
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-bg-alt px-2 py-1.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          label="Bold"
        >
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          label="Italic"
        >
          <Italic size={14} />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          label="Heading 2"
        >
          <Heading2 size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          label="Heading 3"
        >
          <Heading3 size={14} />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          label="Bullet list"
        >
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          label="Numbered list"
        >
          <ListOrdered size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          label="Quote"
        >
          <Quote size={14} />
        </ToolbarButton>
        <Divider />
        <ToolbarButton onClick={setLink} active={editor.isActive('link')} label="Link">
          <Link2 size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={pickImage}
          disabled={uploading}
          label={uploading ? 'Uploading...' : 'Insert image'}
        >
          <ImageIcon size={14} />
        </ToolbarButton>
        <div className="ml-auto flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            label="Undo"
            disabled={!editor.can().undo()}
          >
            <Undo size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            label="Redo"
            disabled={!editor.can().redo()}
          >
            <Redo size={14} />
          </ToolbarButton>
        </div>
      </div>

      <EditorContent editor={editor} />

      {(uploading || uploadError) && (
        <div className="border-t border-border bg-bg-alt px-4 py-2 text-xs">
          {uploading && <span className="text-fg-muted">Uploading image...</span>}
          {uploadError && (
            <span className="text-red-700">{uploadError}</span>
          )}
        </div>
      )}

      <input type="hidden" name={name} value={html} />
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={[
        'grid h-8 w-8 place-items-center rounded-md transition-colors',
        active
          ? 'bg-primary text-primary-fg'
          : 'text-fg-muted hover:bg-surface hover:text-fg',
        disabled ? 'cursor-not-allowed opacity-40' : '',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div aria-hidden className="mx-1 h-5 w-px bg-border" />;
}
