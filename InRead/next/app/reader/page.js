"use client";

import { useEffect, useState } from "react";
import { ThemeControl } from "../theme-control";
import "./reader.css";

const emptyProgress = { chapter: 1, readChapters: [], privateNotes: [] };

async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: { "content-type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "REQUEST_FAILED");
  return body;
}

export default function ReaderPage() {
  const [bookId, setBookId] = useState("");
  const [chapter, setChapter] = useState(null);
  const [progress, setProgress] = useState(emptyProgress);
  const [annotations, setAnnotations] = useState([]);
  const [selection, setSelection] = useState(null);
  const [note, setNote] = useState("");
  const [share, setShare] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setBookId(new URLSearchParams(window.location.search).get("book") || "");
  }, []);

  useEffect(() => {
    if (!bookId) return;
    void loadChapter(1, true);
  }, [bookId]);

  async function loadAnnotations(nextChapter) {
    const result = await request(`/api/annotations?book=${encodeURIComponent(bookId)}&chapter=${nextChapter}`);
    setAnnotations(result.annotations || []);
  }

  async function loadChapter(nextChapter, initial = false) {
    try {
      setMessage("");
      const progressResult = initial ? await request(`/api/reader/progress?book=${encodeURIComponent(bookId)}`) : null;
      const nextProgress = progressResult?.progress || progress;
      const requestedChapter = initial ? nextProgress.chapter || nextChapter : nextChapter;
      const content = await request(`/api/reader?book=${encodeURIComponent(bookId)}&chapter=${requestedChapter}`);
      setProgress(nextProgress);
      setChapter(content.chapter);
      setSelection(null);
      setNote("");
      await loadAnnotations(content.chapter.chapter);
      if (!nextProgress.readChapters?.includes(content.chapter.chapter) || content.chapter.chapter !== nextProgress.chapter) {
        const saved = await request("/api/reader/progress", {
          method: "PATCH",
          body: JSON.stringify({ bookId, chapter: content.chapter.chapter, privateNotes: nextProgress.privateNotes || [] })
        });
        setProgress(saved.progress);
      }
    } catch (error) {
      setMessage(error.message === "BOOK_NOT_FOUND" ? "This book does not have a cached reading edition yet." : "Unable to load this chapter. Please try again.");
    }
  }

  function captureSelection(paragraph) {
    const excerpt = window.getSelection?.().toString().trim() || "";
    if (excerpt.length >= 2) {
      setSelection({ paragraph, excerpt: excerpt.slice(0, 220) });
      setMessage("");
    }
  }

  async function saveAnnotation(event) {
    event.preventDefault();
    const content = note.trim();
    if (!selection || content.length < 2 || !chapter) return;
    try {
      const privateNotes = [...(progress.privateNotes || []), {
        id: crypto.randomUUID(), chapter: chapter.chapter, paragraph: selection.paragraph,
        excerpt: selection.excerpt, content, createdAt: new Date().toISOString()
      }];
      const saved = await request("/api/reader/progress", {
        method: "PATCH", body: JSON.stringify({ bookId, chapter: chapter.chapter, privateNotes })
      });
      setProgress(saved.progress);
      if (share) {
        await request("/api/annotations", {
          method: "POST",
          body: JSON.stringify({ bookId, chapter: chapter.chapter, paragraph: selection.paragraph, excerpt: selection.excerpt, content })
        });
        await loadAnnotations(chapter.chapter);
      }
      setSelection(null);
      setNote("");
      setShare(false);
      setMessage(share ? "Your private note was saved and shared with readers." : "Your private note was saved.");
    } catch {
      setMessage("The note could not be saved. Please try again.");
    }
  }

  async function likeAnnotation(id) {
    await request(`/api/annotations/${id}/like`, { method: "POST" });
    await loadAnnotations(chapter.chapter);
  }

  async function reportAnnotation(id) {
    await request(`/api/annotations/${id}/report`, { method: "POST" });
    await loadAnnotations(chapter.chapter);
    setMessage("The annotation has been removed from the public feed.");
  }

  if (!bookId) return <main className="reader-page"><p className="reader-message">Choose a book from the library to open its reading edition.</p></main>;
  const chapterNotes = (progress.privateNotes || []).filter((item) => item.chapter === chapter?.chapter).slice(-3);

  return <main className="reader-page">
    <header className="reader-nav"><a className="reader-wordmark" href="/legacy/library.html">InRead</a><div className="reader-nav-actions"><ThemeControl /><a className="reader-back" href="/legacy/library.html">Back to library</a></div></header>
    {message && <p className="reader-message" role="status">{message}</p>}
    {!chapter ? <p className="reader-message">Loading your server-cached chapter...</p> : <div className="reader-layout">
      <aside className="reader-rail">
        <span className="reader-kicker">READING EDITION</span><h1>{chapter.title}</h1><p>{chapter.chapterTitle}</p>
        <div className="reader-progress"><strong>{progress.readChapters?.length || 0} / {chapter.totalChapters}</strong><span>chapters opened</span></div>
        <label className="reader-select-label">Chapter<select value={chapter.chapter} onChange={(event) => loadChapter(Number(event.target.value))}>{Array.from({ length: chapter.totalChapters }, (_, index) => <option value={index + 1} key={index}>Chapter {index + 1}</option>)}</select></label>
        <div className="reader-chapter-actions"><button type="button" disabled={chapter.chapter === 1} onClick={() => loadChapter(chapter.chapter - 1)}>Previous</button><button type="button" disabled={chapter.chapter === chapter.totalChapters} onClick={() => loadChapter(chapter.chapter + 1)}>Next</button></div>
        <section className="private-note-list"><strong>Your annotations</strong>{chapterNotes.length ? chapterNotes.map((item) => <article key={item.id}><q>{item.excerpt}</q><p>{item.content}</p></article>) : <p>No private notes in this chapter.</p>}</section>
      </aside>
      <article className="reader-chapter" aria-label={`${chapter.title} ${chapter.chapterTitle}`}>
        <span className="reader-kicker">CHAPTER {chapter.chapter}</span><h2>{chapter.chapterTitle}</h2><p className="reader-instruction">Select a sentence or phrase, then release to add an annotation.</p>
        <div className="reader-prose">{chapter.paragraphs.map((paragraph, index) => <p key={index} onMouseUp={() => captureSelection(index)}>{paragraph}</p>)}</div>
        {selection && <form className="annotation-composer" onSubmit={saveAnnotation}><span>Selected: “{selection.excerpt}”</span><textarea value={note} onChange={(event) => setNote(event.target.value)} minLength="2" maxLength="280" placeholder="What do you want to remember here?" required /><label><input type="checkbox" checked={share} onChange={(event) => setShare(event.target.checked)} /> Share this note with other readers</label><div><button type="button" onClick={() => setSelection(null)}>Cancel</button><button type="submit">Save annotation</button></div></form>}
      </article>
      <aside className="public-notes"><div className="public-notes-heading"><div><span className="reader-kicker">READERS HERE</span><h2>Random public notes</h2></div><button type="button" onClick={() => loadAnnotations(chapter.chapter)}>Refresh</button></div><p>At most three unreported annotations are shown for this chapter.</p>{annotations.length ? annotations.map((item) => <article className="public-note" key={item.id}><div><span className="reader-avatar">{item.author.avatar}</span><strong>{item.author.nickname}</strong></div><q>{item.excerpt}</q><p>{item.content}</p><footer><button type="button" onClick={() => likeAnnotation(item.id)}>{item.likedByMe ? "Liked" : "Like"} · {item.likes}</button><button type="button" onClick={() => reportAnnotation(item.id)}>Report</button></footer></article>) : <div className="public-note empty-public-note">No public notes yet. Share a thoughtful annotation to start the conversation.</div>}</aside>
    </div>}
  </main>;
}
