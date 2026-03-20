'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlock from '@tiptap/extension-code-block';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';
import { useDurationEstimate } from '@/hooks/useDurationEstimate';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function TextEditor({ content, onChange }: TextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      CodeBlock,
      Image.configure({ inline: true }),
      Link.configure({ openOnClick: false }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const durationEstimate = useDurationEstimate('text', content || '');

  // Reset content if changed entirely externally (optional, maybe not needed if parent manages well)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Small check to prevent infinite loop
      if (content === '') {
        editor.commands.setContent('');
      }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleCode = () => editor.chain().focus().toggleCode().run();
  const toggleCodeBlock = () => editor.chain().focus().toggleCodeBlock().run();
  const toggleH2 = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
  const toggleH3 = () => editor.chain().focus().toggleHeading({ level: 3 }).run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();

  const words = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(w => w.length > 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        padding: '0.5rem', 
        border: '1px solid var(--color-border)', 
        borderRadius: '0.5rem', 
        backgroundColor: 'var(--color-surface, #f8fafc)',
        flexWrap: 'wrap'
      }}>
        <button type="button" onClick={toggleBold} style={{ fontWeight: editor.isActive('bold') ? 'bold' : 'normal', padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', backgroundColor: editor.isActive('bold') ? 'var(--color-primary)' : 'transparent', color: editor.isActive('bold') ? 'var(--color-background)' : 'inherit' }}>Bold</button>
        <button type="button" onClick={toggleItalic} style={{ fontStyle: editor.isActive('italic') ? 'italic' : 'normal', padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', backgroundColor: editor.isActive('italic') ? 'var(--color-primary)' : 'transparent', color: editor.isActive('italic') ? 'var(--color-background)' : 'inherit' }}>Italic</button>
        <button type="button" onClick={toggleCode} style={{ padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', backgroundColor: editor.isActive('code') ? 'var(--color-primary)' : 'transparent', color: editor.isActive('code') ? 'var(--color-background)' : 'inherit' }}>Code</button>
        <button type="button" onClick={toggleCodeBlock} style={{ padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', backgroundColor: editor.isActive('codeBlock') ? 'var(--color-primary)' : 'transparent', color: editor.isActive('codeBlock') ? 'var(--color-background)' : 'inherit' }}>CodeBlock</button>
        <button type="button" onClick={toggleH2} style={{ padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', backgroundColor: editor.isActive('heading', { level: 2 }) ? 'var(--color-primary)' : 'transparent', color: editor.isActive('heading', { level: 2 }) ? 'var(--color-background)' : 'inherit' }}>H2</button>
        <button type="button" onClick={toggleH3} style={{ padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', backgroundColor: editor.isActive('heading', { level: 3 }) ? 'var(--color-primary)' : 'transparent', color: editor.isActive('heading', { level: 3 }) ? 'var(--color-background)' : 'inherit' }}>H3</button>
        <button type="button" onClick={toggleBulletList} style={{ padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', backgroundColor: editor.isActive('bulletList') ? 'var(--color-primary)' : 'transparent', color: editor.isActive('bulletList') ? 'var(--color-background)' : 'inherit' }}>BulletList</button>
        <button type="button" onClick={toggleOrderedList} style={{ padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', backgroundColor: editor.isActive('orderedList') ? 'var(--color-primary)' : 'transparent', color: editor.isActive('orderedList') ? 'var(--color-background)' : 'inherit' }}>OrderedList</button>
      </div>
      
      <div style={{ border: '1px solid var(--color-border)', borderRadius: '0.5rem', minHeight: '300px', padding: '1rem', backgroundColor: 'var(--color-background)' }}>
        <EditorContent editor={editor} style={{ minHeight: '300px', outline: 'none' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)', fontSize: '0.875rem' }}>
        <span>{words} word{words !== 1 && 's'}</span>
        <span style={{ color: durationEstimate > 5 ? 'var(--color-warning, #eab308)' : 'inherit' }}>
          ~{durationEstimate} min read {durationEstimate > 5 && '(Consider splitting this lesson)'}
        </span>
      </div>
    </div>
  );
}
