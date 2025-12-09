import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitBranch, Plus, Trash2, Download, Link2 } from "lucide-react";

type ShapeType = "rectangle" | "diamond" | "oval" | "parallelogram";

interface FlowchartNode {
  id: string;
  text: string;
  shape: ShapeType;
  x: number;
  y: number;
  color: string;
}

interface FlowchartEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

const shapeOptions: { value: ShapeType; label: string; description: string }[] = [
  { value: "rectangle", label: "Process", description: "Action or process step" },
  { value: "diamond", label: "Decision", description: "Yes/No decision point" },
  { value: "oval", label: "Terminal", description: "Start or end point" },
  { value: "parallelogram", label: "I/O", description: "Input or output" },
];

const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export function OnlineFlowchartMaker() {
  const [nodes, setNodes] = useState<FlowchartNode[]>([
    { id: "1", text: "Start", shape: "oval", x: 400, y: 50, color: "#10B981" }
  ]);
  const [edges, setEdges] = useState<FlowchartEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [newShape, setNewShape] = useState<ShapeType>("rectangle");
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);

  const addNode = useCallback(() => {
    const lastNode = nodes[nodes.length - 1];
    const newNode: FlowchartNode = {
      id: Date.now().toString(),
      text: "New Step",
      shape: newShape,
      x: lastNode ? lastNode.x : 400,
      y: lastNode ? lastNode.y + 100 : 150,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode.id);
  }, [nodes, newShape]);

  const deleteNode = useCallback(() => {
    if (!selectedNode) return;
    setNodes(prev => prev.filter(n => n.id !== selectedNode));
    setEdges(prev => prev.filter(e => e.from !== selectedNode && e.to !== selectedNode));
    setSelectedNode(null);
  }, [selectedNode]);

  const startConnecting = useCallback(() => {
    if (selectedNode) {
      setConnectingFrom(selectedNode);
    }
  }, [selectedNode]);

  const handleNodeClick = useCallback((id: string) => {
    if (connectingFrom && connectingFrom !== id) {
      setEdges(prev => [...prev, {
        id: `${connectingFrom}-${id}`,
        from: connectingFrom,
        to: id,
      }]);
      setConnectingFrom(null);
    } else {
      setSelectedNode(id);
    }
  }, [connectingFrom]);

  const startEditing = useCallback((id: string) => {
    const node = nodes.find(n => n.id === id);
    if (node) {
      setEditingNode(id);
      setEditText(node.text);
    }
  }, [nodes]);

  const finishEditing = useCallback(() => {
    if (editingNode) {
      setNodes(prev => prev.map(n => 
        n.id === editingNode ? { ...n, text: editText } : n
      ));
      setEditingNode(null);
    }
  }, [editingNode, editText]);

  const renderShape = (node: FlowchartNode) => {
    const isSelected = selectedNode === node.id;
    const stroke = isSelected ? "#000" : "transparent";
    
    switch (node.shape) {
      case "diamond":
        return (
          <polygon
            points={`${node.x},${node.y - 30} ${node.x + 50},${node.y} ${node.x},${node.y + 30} ${node.x - 50},${node.y}`}
            fill={node.color}
            stroke={stroke}
            strokeWidth={2}
          />
        );
      case "oval":
        return (
          <ellipse
            cx={node.x}
            cy={node.y}
            rx={50}
            ry={25}
            fill={node.color}
            stroke={stroke}
            strokeWidth={2}
          />
        );
      case "parallelogram":
        return (
          <polygon
            points={`${node.x - 40},${node.y + 20} ${node.x - 50},${node.y - 20} ${node.x + 40},${node.y - 20} ${node.x + 50},${node.y + 20}`}
            fill={node.color}
            stroke={stroke}
            strokeWidth={2}
          />
        );
      default:
        return (
          <rect
            x={node.x - 50}
            y={node.y - 20}
            width={100}
            height={40}
            rx={4}
            fill={node.color}
            stroke={stroke}
            strokeWidth={2}
          />
        );
    }
  };

  const exportAsSVG = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    
    const blob = new Blob([clone.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "flowchart.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Flowchart Maker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Select value={newShape} onValueChange={(v) => setNewShape(v as ShapeType)}>
              <SelectTrigger className="w-40" data-testid="select-shape">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {shapeOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addNode} data-testid="button-add-shape">
              <Plus className="w-4 h-4 mr-2" />
              Add Shape
            </Button>
            <Button onClick={startConnecting} variant="outline" disabled={!selectedNode} data-testid="button-connect">
              <Link2 className="w-4 h-4 mr-2" />
              {connectingFrom ? "Click target..." : "Connect"}
            </Button>
            <Button onClick={deleteNode} variant="outline" disabled={!selectedNode} data-testid="button-delete-shape">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button onClick={exportAsSVG} variant="outline" data-testid="button-export-flowchart">
              <Download className="w-4 h-4 mr-2" />
              Export SVG
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden bg-muted/20" style={{ height: "500px" }}>
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox="0 0 800 600"
              data-testid="flowchart-canvas"
            >
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                </marker>
              </defs>

              {edges.map(edge => {
                const fromNode = nodes.find(n => n.id === edge.from);
                const toNode = nodes.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return null;
                return (
                  <line
                    key={edge.id}
                    x1={fromNode.x}
                    y1={fromNode.y + 25}
                    x2={toNode.x}
                    y2={toNode.y - 25}
                    stroke="#666"
                    strokeWidth={2}
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}

              {nodes.map(node => (
                <g
                  key={node.id}
                  onClick={() => handleNodeClick(node.id)}
                  onDoubleClick={() => startEditing(node.id)}
                  style={{ cursor: "pointer" }}
                  data-testid={`flowchart-node-${node.id}`}
                >
                  {renderShape(node)}
                  {editingNode === node.id ? (
                    <foreignObject x={node.x - 45} y={node.y - 10} width={90} height={24}>
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={finishEditing}
                        onKeyDown={(e) => e.key === "Enter" && finishEditing()}
                        autoFocus
                        className="h-5 text-xs text-center"
                        data-testid="input-shape-text"
                      />
                    </foreignObject>
                  ) : (
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fill="white"
                      fontSize={11}
                      fontWeight={500}
                    >
                      {node.text.length > 12 ? node.text.slice(0, 12) + "..." : node.text}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>

          <p className="text-sm text-muted-foreground mt-2">
            Click to select, double-click to edit text. Use Connect to link shapes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
