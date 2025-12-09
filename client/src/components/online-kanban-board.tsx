import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, Plus, Trash2, GripVertical, Edit } from "lucide-react";

interface KanbanCard {
  id: string;
  title: string;
  description: string;
  color: string;
  priority: "low" | "medium" | "high";
}

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

const priorityColors = {
  low: "bg-green-500/10 text-green-600",
  medium: "bg-yellow-500/10 text-yellow-600",
  high: "bg-red-500/10 text-red-600",
};

const cardColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export function OnlineKanbanBoard() {
  const [columns, setColumns] = useState<KanbanColumn[]>([
    { id: "todo", title: "To Do", cards: [
      { id: "1", title: "Research competitors", description: "Analyze top 5 competitors", color: "#3B82F6", priority: "high" },
      { id: "2", title: "Design mockups", description: "Create wireframes", color: "#10B981", priority: "medium" },
    ]},
    { id: "progress", title: "In Progress", cards: [
      { id: "3", title: "Build landing page", description: "Implement responsive design", color: "#F59E0B", priority: "high" },
    ]},
    { id: "review", title: "Review", cards: [] },
    { id: "done", title: "Done", cards: [
      { id: "4", title: "Project setup", description: "Initial configuration", color: "#8B5CF6", priority: "low" },
    ]},
  ]);
  const [draggedCard, setDraggedCard] = useState<{ cardId: string; columnId: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
  const [targetColumnId, setTargetColumnId] = useState<string>("todo");

  const addCard = useCallback((columnId: string) => {
    const newCard: KanbanCard = {
      id: Date.now().toString(),
      title: "New Task",
      description: "",
      color: cardColors[Math.floor(Math.random() * cardColors.length)],
      priority: "medium",
    };
    setEditingCard(newCard);
    setTargetColumnId(columnId);
    setIsDialogOpen(true);
  }, []);

  const saveCard = useCallback(() => {
    if (!editingCard) return;
    
    setColumns(prev => prev.map(col => {
      if (col.id === targetColumnId) {
        const existingIndex = col.cards.findIndex(c => c.id === editingCard.id);
        if (existingIndex >= 0) {
          const updated = [...col.cards];
          updated[existingIndex] = editingCard;
          return { ...col, cards: updated };
        } else {
          return { ...col, cards: [...col.cards, editingCard] };
        }
      }
      return col;
    }));
    setIsDialogOpen(false);
    setEditingCard(null);
  }, [editingCard, targetColumnId]);

  const deleteCard = useCallback((columnId: string, cardId: string) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId 
        ? { ...col, cards: col.cards.filter(c => c.id !== cardId) }
        : col
    ));
  }, []);

  const handleDragStart = useCallback((cardId: string, columnId: string) => {
    setDraggedCard({ cardId, columnId });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((targetColumnId: string) => {
    if (!draggedCard) return;
    
    if (draggedCard.columnId === targetColumnId) {
      setDraggedCard(null);
      return;
    }

    setColumns(prev => {
      const sourceCol = prev.find(c => c.id === draggedCard.columnId);
      const card = sourceCol?.cards.find(c => c.id === draggedCard.cardId);
      if (!card) return prev;

      return prev.map(col => {
        if (col.id === draggedCard.columnId) {
          return { ...col, cards: col.cards.filter(c => c.id !== draggedCard.cardId) };
        }
        if (col.id === targetColumnId) {
          return { ...col, cards: [...col.cards, card] };
        }
        return col;
      });
    });
    setDraggedCard(null);
  }, [draggedCard]);

  const editCard = useCallback((card: KanbanCard, columnId: string) => {
    setEditingCard({ ...card });
    setTargetColumnId(columnId);
    setIsDialogOpen(true);
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" />
            Kanban Board
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-4" data-testid="kanban-board">
            {columns.map(column => (
              <div
                key={column.id}
                className="flex-shrink-0 w-72 bg-muted/30 rounded-lg p-3"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.id)}
                data-testid={`kanban-column-${column.id}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    {column.title}
                    <Badge variant="secondary" className="text-xs">
                      {column.cards.length}
                    </Badge>
                  </h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => addCard(column.id)}
                    data-testid={`button-add-card-${column.id}`}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 min-h-[200px]">
                  {column.cards.map(card => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card.id, column.id)}
                      className="bg-card p-3 rounded-md border cursor-grab active:cursor-grabbing hover-elevate"
                      style={{ borderLeftColor: card.color, borderLeftWidth: 3 }}
                      data-testid={`kanban-card-${card.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{card.title}</h4>
                          {card.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {card.description}
                            </p>
                          )}
                        </div>
                        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge className={`text-xs ${priorityColors[card.priority]}`}>
                          {card.priority}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => editCard(card, column.id)}
                            data-testid={`button-edit-card-${card.id}`}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-destructive"
                            onClick={() => deleteCard(column.id, card.id)}
                            data-testid={`button-delete-card-${card.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Card</DialogTitle>
              </DialogHeader>
              {editingCard && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={editingCard.title}
                      onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                      data-testid="input-card-title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={editingCard.description}
                      onChange={(e) => setEditingCard({ ...editingCard, description: e.target.value })}
                      rows={3}
                      data-testid="input-card-description"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <div className="flex gap-2 mt-1">
                      {(["low", "medium", "high"] as const).map(p => (
                        <Button
                          key={p}
                          variant={editingCard.priority === p ? "default" : "outline"}
                          size="sm"
                          onClick={() => setEditingCard({ ...editingCard, priority: p })}
                          data-testid={`priority-${p}`}
                        >
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex gap-2 mt-1">
                      {cardColors.map(c => (
                        <button
                          key={c}
                          className={`w-6 h-6 rounded-full border-2 ${editingCard.color === c ? "border-foreground" : "border-transparent"}`}
                          style={{ backgroundColor: c }}
                          onClick={() => setEditingCard({ ...editingCard, color: c })}
                        />
                      ))}
                    </div>
                  </div>
                  <Button onClick={saveCard} className="w-full" data-testid="button-save-card">
                    Save Card
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
