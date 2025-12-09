import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarRange, Plus, Trash2, Download, Edit } from "lucide-react";
import { format, addDays, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  color: string;
  progress: number;
}

const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"];

export function OnlineGanttChart() {
  const [tasks, setTasks] = useState<GanttTask[]>([
    { id: "1", name: "Project Planning", startDate: new Date(), endDate: addDays(new Date(), 5), color: "#3B82F6", progress: 100 },
    { id: "2", name: "Design Phase", startDate: addDays(new Date(), 3), endDate: addDays(new Date(), 10), color: "#10B981", progress: 60 },
    { id: "3", name: "Development", startDate: addDays(new Date(), 8), endDate: addDays(new Date(), 20), color: "#F59E0B", progress: 20 },
  ]);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<GanttTask | null>(null);

  const viewStart = startOfMonth(new Date());
  const viewEnd = endOfMonth(addDays(new Date(), 30));
  const days = eachDayOfInterval({ start: viewStart, end: viewEnd });
  const totalDays = differenceInDays(viewEnd, viewStart);

  const addTask = useCallback(() => {
    const newTask: GanttTask = {
      id: Date.now().toString(),
      name: "New Task",
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      color: colors[Math.floor(Math.random() * colors.length)],
      progress: 0,
    };
    setTasks(prev => [...prev, newTask]);
    setEditingTask(newTask);
    setIsDialogOpen(true);
  }, []);

  const deleteTask = useCallback(() => {
    if (!selectedTask) return;
    setTasks(prev => prev.filter(t => t.id !== selectedTask));
    setSelectedTask(null);
  }, [selectedTask]);

  const updateTask = useCallback((updatedTask: GanttTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setIsDialogOpen(false);
    setEditingTask(null);
  }, []);

  const getTaskPosition = (task: GanttTask) => {
    const startOffset = Math.max(0, differenceInDays(task.startDate, viewStart));
    const duration = differenceInDays(task.endDate, task.startDate) + 1;
    const left = (startOffset / totalDays) * 100;
    const width = Math.min((duration / totalDays) * 100, 100 - left);
    return { left: `${left}%`, width: `${width}%` };
  };

  const exportAsImage = useCallback(() => {
    const chartEl = document.getElementById("gantt-chart");
    if (chartEl) {
      const canvas = document.createElement("canvas");
      canvas.width = chartEl.scrollWidth;
      canvas.height = chartEl.scrollHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "12px sans-serif";
        ctx.fillStyle = "#000";
        ctx.fillText("Gantt Chart Export - Use screenshot for full quality", 10, 20);
      }
      const link = document.createElement("a");
      link.download = "gantt-chart.png";
      link.href = canvas.toDataURL();
      link.click();
    }
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarRange className="w-5 h-5" />
            Gantt Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={addTask} data-testid="button-add-task">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
            <Button onClick={deleteTask} variant="outline" disabled={!selectedTask} data-testid="button-delete-task">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button onClick={exportAsImage} variant="outline" data-testid="button-export-gantt">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <div id="gantt-chart" className="border rounded-lg overflow-auto" data-testid="gantt-chart-container">
            <div className="min-w-[800px]">
              <div className="flex border-b bg-muted/50">
                <div className="w-48 shrink-0 p-2 font-medium border-r">Task Name</div>
                <div className="flex-1 flex">
                  {days.filter((_, i) => i % 3 === 0).map((day, i) => (
                    <div key={i} className="flex-1 p-1 text-xs text-center border-r">
                      {format(day, "MMM d")}
                    </div>
                  ))}
                </div>
              </div>

              {tasks.map(task => {
                const pos = getTaskPosition(task);
                return (
                  <div
                    key={task.id}
                    className={`flex border-b cursor-pointer hover-elevate ${selectedTask === task.id ? "bg-muted/50" : ""}`}
                    onClick={() => setSelectedTask(task.id)}
                    data-testid={`gantt-task-${task.id}`}
                  >
                    <div className="w-48 shrink-0 p-2 border-r flex items-center justify-between gap-2">
                      <span className="truncate">{task.name}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTask(task);
                          setIsDialogOpen(true);
                        }}
                        data-testid={`button-edit-task-${task.id}`}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex-1 relative h-10">
                      <div
                        className="absolute top-2 h-6 rounded-md flex items-center px-2"
                        style={{
                          left: pos.left,
                          width: pos.width,
                          backgroundColor: task.color,
                        }}
                      >
                        <div
                          className="absolute left-0 top-0 h-full rounded-l-md bg-black/20"
                          style={{ width: `${task.progress}%` }}
                        />
                        <span className="relative text-xs text-white font-medium truncate">
                          {task.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
              </DialogHeader>
              {editingTask && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Task Name</label>
                    <Input
                      value={editingTask.name}
                      onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                      data-testid="input-task-name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Start Date</label>
                      <Input
                        type="date"
                        value={format(editingTask.startDate, "yyyy-MM-dd")}
                        onChange={(e) => setEditingTask({ ...editingTask, startDate: new Date(e.target.value) })}
                        data-testid="input-start-date"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Date</label>
                      <Input
                        type="date"
                        value={format(editingTask.endDate, "yyyy-MM-dd")}
                        onChange={(e) => setEditingTask({ ...editingTask, endDate: new Date(e.target.value) })}
                        data-testid="input-end-date"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Progress (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={editingTask.progress}
                      onChange={(e) => setEditingTask({ ...editingTask, progress: Number(e.target.value) })}
                      data-testid="input-progress"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex gap-2 mt-1">
                      {colors.map(c => (
                        <button
                          key={c}
                          className={`w-6 h-6 rounded-full border-2 ${editingTask.color === c ? "border-foreground" : "border-transparent"}`}
                          style={{ backgroundColor: c }}
                          onClick={() => setEditingTask({ ...editingTask, color: c })}
                          data-testid={`color-${c}`}
                        />
                      ))}
                    </div>
                  </div>
                  <Button onClick={() => updateTask(editingTask)} className="w-full" data-testid="button-save-task">
                    Save Task
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
