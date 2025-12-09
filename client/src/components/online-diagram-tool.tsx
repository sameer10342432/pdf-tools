import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, Plus, Trash2, Download, Square, Circle, Database, Server, Cloud, Monitor, Link2 } from "lucide-react";

type DiagramType = "network" | "er" | "general";
type ElementType = "rectangle" | "circle" | "database" | "server" | "cloud" | "monitor";

interface DiagramElement {
  id: string;
  type: ElementType;
  text: string;
  x: number;
  y: number;
  color: string;
}

interface DiagramConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
}

const elementIcons: Record<ElementType, typeof Square> = {
  rectangle: Square,
  circle: Circle,
  database: Database,
  server: Server,
  cloud: Cloud,
  monitor: Monitor,
};

const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export function OnlineDiagramTool() {
  const [diagramType, setDiagramType] = useState<DiagramType>("general");
  const [elements, setElements] = useState<DiagramElement[]>([]);
  const [connections, setConnections] = useState<DiagramConnection[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);

  const addElement = useCallback((type: ElementType) => {
    const newElement: DiagramElement = {
      id: Date.now().toString(),
      type,
      text: type.charAt(0).toUpperCase() + type.slice(1),
      x: 100 + Math.random() * 400,
      y: 100 + Math.random() * 300,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
  }, []);

  const deleteElement = useCallback(() => {
    if (!selectedElement) return;
    setElements(prev => prev.filter(e => e.id !== selectedElement));
    setConnections(prev => prev.filter(c => c.from !== selectedElement && c.to !== selectedElement));
    setSelectedElement(null);
  }, [selectedElement]);

  const startConnecting = useCallback(() => {
    if (selectedElement) {
      setConnectingFrom(selectedElement);
    }
  }, [selectedElement]);

  const handleElementClick = useCallback((id: string) => {
    if (connectingFrom && connectingFrom !== id) {
      setConnections(prev => [...prev, {
        id: `${connectingFrom}-${id}`,
        from: connectingFrom,
        to: id,
      }]);
      setConnectingFrom(null);
    } else {
      setSelectedElement(id);
    }
  }, [connectingFrom]);

  const startEditing = useCallback((id: string) => {
    const element = elements.find(e => e.id === id);
    if (element) {
      setEditingElement(id);
      setEditText(element.text);
    }
  }, [elements]);

  const finishEditing = useCallback(() => {
    if (editingElement) {
      setElements(prev => prev.map(e => 
        e.id === editingElement ? { ...e, text: editText } : e
      ));
      setEditingElement(null);
    }
  }, [editingElement, editText]);

  const renderElement = (element: DiagramElement) => {
    const isSelected = selectedElement === element.id;
    const stroke = isSelected ? "#000" : "transparent";

    switch (element.type) {
      case "circle":
        return <circle cx={element.x} cy={element.y} r={30} fill={element.color} stroke={stroke} strokeWidth={2} />;
      case "database":
        return (
          <g>
            <ellipse cx={element.x} cy={element.y - 20} rx={30} ry={10} fill={element.color} stroke={stroke} strokeWidth={isSelected ? 2 : 0} />
            <rect x={element.x - 30} y={element.y - 20} width={60} height={40} fill={element.color} />
            <ellipse cx={element.x} cy={element.y + 20} rx={30} ry={10} fill={element.color} stroke={stroke} strokeWidth={isSelected ? 2 : 0} />
          </g>
        );
      case "cloud":
        return (
          <ellipse cx={element.x} cy={element.y} rx={40} ry={25} fill={element.color} stroke={stroke} strokeWidth={2} />
        );
      case "server":
      case "monitor":
        return (
          <rect x={element.x - 25} y={element.y - 30} width={50} height={60} rx={4} fill={element.color} stroke={stroke} strokeWidth={2} />
        );
      default:
        return (
          <rect x={element.x - 40} y={element.y - 25} width={80} height={50} rx={4} fill={element.color} stroke={stroke} strokeWidth={2} />
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
    link.download = "diagram.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const getElementTypes = (): ElementType[] => {
    switch (diagramType) {
      case "network":
        return ["server", "monitor", "cloud", "database"];
      case "er":
        return ["rectangle", "database", "circle"];
      default:
        return ["rectangle", "circle", "database", "server", "cloud", "monitor"];
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Diagram Tool
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={diagramType} onValueChange={(v) => setDiagramType(v as DiagramType)} className="mb-4">
            <TabsList>
              <TabsTrigger value="general" data-testid="tab-general">General</TabsTrigger>
              <TabsTrigger value="network" data-testid="tab-network">Network</TabsTrigger>
              <TabsTrigger value="er" data-testid="tab-er">ER Diagram</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap gap-2 mb-4">
            {getElementTypes().map(type => {
              const Icon = elementIcons[type];
              return (
                <Button key={type} onClick={() => addElement(type)} variant="outline" size="sm" data-testid={`button-add-${type}`}>
                  <Icon className="w-4 h-4 mr-1" />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              );
            })}
            <div className="h-6 w-px bg-border mx-2" />
            <Button onClick={startConnecting} variant="outline" size="sm" disabled={!selectedElement} data-testid="button-connect-diagram">
              <Link2 className="w-4 h-4 mr-1" />
              {connectingFrom ? "Click target..." : "Connect"}
            </Button>
            <Button onClick={deleteElement} variant="outline" size="sm" disabled={!selectedElement} data-testid="button-delete-element">
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
            <Button onClick={exportAsSVG} variant="outline" size="sm" data-testid="button-export-diagram">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden bg-muted/20" style={{ height: "500px" }}>
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox="0 0 800 500"
              data-testid="diagram-canvas"
            >
              <defs>
                <marker id="diagram-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                </marker>
              </defs>

              {connections.map(conn => {
                const from = elements.find(e => e.id === conn.from);
                const to = elements.find(e => e.id === conn.to);
                if (!from || !to) return null;
                return (
                  <line
                    key={conn.id}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="#666"
                    strokeWidth={2}
                    markerEnd="url(#diagram-arrow)"
                  />
                );
              })}

              {elements.map(element => (
                <g
                  key={element.id}
                  onClick={() => handleElementClick(element.id)}
                  onDoubleClick={() => startEditing(element.id)}
                  style={{ cursor: "pointer" }}
                  data-testid={`diagram-element-${element.id}`}
                >
                  {renderElement(element)}
                  {editingElement === element.id ? (
                    <foreignObject x={element.x - 35} y={element.y - 8} width={70} height={20}>
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={finishEditing}
                        onKeyDown={(e) => e.key === "Enter" && finishEditing()}
                        autoFocus
                        className="h-4 text-xs text-center p-0"
                        data-testid="input-element-text"
                      />
                    </foreignObject>
                  ) : (
                    <text
                      x={element.x}
                      y={element.y + 4}
                      textAnchor="middle"
                      fill="white"
                      fontSize={10}
                      fontWeight={500}
                    >
                      {element.text.length > 10 ? element.text.slice(0, 10) + "..." : element.text}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>

          <p className="text-sm text-muted-foreground mt-2">
            Click elements to add them. Select and connect, double-click to edit text.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
