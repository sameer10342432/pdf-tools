import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Plus, Trash2, Download, Maximize2, Minimize2 } from "lucide-react";

interface Note {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  width: number;
  height: number;
  zIndex: number;
}

const noteColors = [
  { bg: "#FEF3C7", border: "#F59E0B" },
  { bg: "#DBEAFE", border: "#3B82F6" },
  { bg: "#D1FAE5", border: "#10B981" },
  { bg: "#FEE2E2", border: "#EF4444" },
  { bg: "#E9D5FF", border: "#8B5CF6" },
  { bg: "#FCE7F3", border: "#EC4899" },
];

export function OnlineStickyNotes() {
  const [notes, setNotes] = useState<Note[]>([
    { id: "1", text: "Welcome to Sticky Notes!", x: 50, y: 50, color: "#FEF3C7", width: 200, height: 150, zIndex: 1 },
    { id: "2", text: "Double-click to edit", x: 280, y: 80, color: "#DBEAFE", width: 200, height: 150, zIndex: 2 },
    { id: "3", text: "Drag to move", x: 150, y: 220, color: "#D1FAE5", width: 200, height: 150, zIndex: 3 },
  ]);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; noteX: number; noteY: number } | null>(null);

  const addNote = useCallback(() => {
    const newZIndex = maxZIndex + 1;
    const colorSet = noteColors[Math.floor(Math.random() * noteColors.length)];
    const newNote: Note = {
      id: Date.now().toString(),
      text: "",
      x: 50 + Math.random() * 200,
      y: 50 + Math.random() * 200,
      color: colorSet.bg,
      width: 200,
      height: 150,
      zIndex: newZIndex,
    };
    setNotes(prev => [...prev, newNote]);
    setMaxZIndex(newZIndex);
    setEditingNote(newNote.id);
    setSelectedNote(newNote.id);
  }, [maxZIndex]);

  const deleteNote = useCallback(() => {
    if (!selectedNote) return;
    setNotes(prev => prev.filter(n => n.id !== selectedNote));
    setSelectedNote(null);
  }, [selectedNote]);

  const bringToFront = useCallback((id: string) => {
    const newZIndex = maxZIndex + 1;
    setNotes(prev => prev.map(n => 
      n.id === id ? { ...n, zIndex: newZIndex } : n
    ));
    setMaxZIndex(newZIndex);
    setSelectedNote(id);
  }, [maxZIndex]);

  const handleMouseDown = useCallback((e: React.MouseEvent, noteId: string) => {
    if (editingNote === noteId) return;
    
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    bringToFront(noteId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      noteX: note.x,
      noteY: note.y,
    };
  }, [notes, editingNote, bringToFront]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current || !selectedNote) return;
    
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    
    setNotes(prev => prev.map(n => 
      n.id === selectedNote 
        ? { ...n, x: dragRef.current!.noteX + dx, y: dragRef.current!.noteY + dy }
        : n
    ));
  }, [selectedNote]);

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const updateNoteText = useCallback((id: string, text: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, text } : n));
  }, []);

  const changeColor = useCallback((id: string, color: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, color } : n));
  }, []);

  const toggleSize = useCallback((id: string) => {
    setNotes(prev => prev.map(n => {
      if (n.id !== id) return n;
      const isExpanded = n.width > 200;
      return { ...n, width: isExpanded ? 200 : 300, height: isExpanded ? 150 : 250 };
    }));
  }, []);

  const exportNotes = useCallback(() => {
    const data = notes.map(n => ({ text: n.text, color: n.color }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "sticky-notes.json";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [notes]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="w-5 h-5" />
            Sticky Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={addNote} data-testid="button-add-note">
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
            <Button onClick={deleteNote} variant="outline" disabled={!selectedNote} data-testid="button-delete-note">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button onClick={exportNotes} variant="outline" data-testid="button-export-notes">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {selectedNote && (
              <div className="flex gap-1 ml-2">
                {noteColors.map((c, i) => (
                  <button
                    key={i}
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: c.bg, borderColor: c.border }}
                    onClick={() => changeColor(selectedNote, c.bg)}
                    data-testid={`color-button-${i}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div
            ref={containerRef}
            className="relative border rounded-lg bg-muted/20 overflow-hidden"
            style={{ height: "500px" }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            data-testid="sticky-notes-canvas"
          >
            {notes.map(note => (
              <div
                key={note.id}
                className={`absolute rounded-md shadow-md cursor-move select-none ${selectedNote === note.id ? "ring-2 ring-primary" : ""}`}
                style={{
                  left: note.x,
                  top: note.y,
                  width: note.width,
                  height: note.height,
                  backgroundColor: note.color,
                  zIndex: note.zIndex,
                }}
                onMouseDown={(e) => handleMouseDown(e, note.id)}
                onDoubleClick={() => {
                  setEditingNote(note.id);
                  bringToFront(note.id);
                }}
                data-testid={`sticky-note-${note.id}`}
              >
                <div className="flex justify-end p-1 gap-1">
                  <button
                    className="p-1 hover:bg-black/10 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSize(note.id);
                    }}
                    data-testid={`toggle-size-${note.id}`}
                  >
                    {note.width > 200 ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                  </button>
                </div>
                {editingNote === note.id ? (
                  <Textarea
                    value={note.text}
                    onChange={(e) => updateNoteText(note.id, e.target.value)}
                    onBlur={() => setEditingNote(null)}
                    autoFocus
                    className="h-[calc(100%-30px)] resize-none border-0 bg-transparent focus-visible:ring-0"
                    style={{ fontSize: "14px" }}
                    data-testid={`note-textarea-${note.id}`}
                  />
                ) : (
                  <div className="p-2 h-[calc(100%-30px)] overflow-auto text-sm whitespace-pre-wrap">
                    {note.text || <span className="text-muted-foreground italic">Double-click to edit...</span>}
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mt-2">
            Drag to move, double-click to edit. Use the color palette when a note is selected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
