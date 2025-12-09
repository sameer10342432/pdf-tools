import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, Share2, Copy, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: number[];
}

export function OnlinePollMaker() {
  const [mode, setMode] = useState<"create" | "view" | "vote">("create");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [pollId, setPollId] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const createPoll = async () => {
    if (!question.trim() || options.filter((o) => o.trim()).length < 2) {
      toast({ title: "Please enter a question and at least 2 options", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, options: options.filter((o) => o.trim()) }),
      });
      const data = await res.json();
      if (data.success) {
        setPoll(data.poll);
        setMode("view");
        toast({ title: "Poll created successfully!" });
      }
    } catch {
      toast({ title: "Failed to create poll", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPoll = async () => {
    if (!pollId.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/polls/${pollId}`);
      const data = await res.json();
      if (data.success) {
        setPoll(data.poll);
        setMode("vote");
      } else {
        toast({ title: "Poll not found", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to load poll", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const vote = async (optionIndex: number) => {
    if (!poll || hasVoted) return;
    try {
      const res = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIndex }),
      });
      const data = await res.json();
      if (data.success) {
        setPoll(data.poll);
        setHasVoted(true);
        toast({ title: "Vote recorded!" });
      }
    } catch {
      toast({ title: "Failed to vote", variant: "destructive" });
    }
  };

  const copyLink = () => {
    if (poll) {
      navigator.clipboard.writeText(`${window.location.origin}/tool/online-poll-maker?id=${poll.id}`);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  const totalVotes = poll?.votes.reduce((a, b) => a + b, 0) || 0;

  return (
    <Card>
      <CardContent className="p-6">
        {mode === "create" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question">Poll Question</Label>
              <Input
                id="question"
                placeholder="What would you like to ask?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                data-testid="input-poll-question"
              />
            </div>
            <div className="space-y-3">
              <Label>Options</Label>
              {options.map((option, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder={`Option ${i + 1}`}
                    value={option}
                    onChange={(e) => updateOption(i, e.target.value)}
                    data-testid={`input-option-${i}`}
                  />
                  {options.length > 2 && (
                    <Button size="icon" variant="outline" onClick={() => removeOption(i)} data-testid={`button-remove-option-${i}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addOption} data-testid="button-add-option">
                <Plus className="h-4 w-4 mr-2" /> Add Option
              </Button>
            </div>
            <Button onClick={createPoll} disabled={isLoading} className="w-full" data-testid="button-create-poll">
              Create Poll
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Enter Poll ID to view" value={pollId} onChange={(e) => setPollId(e.target.value)} data-testid="input-poll-id" />
              <Button onClick={loadPoll} disabled={isLoading} data-testid="button-load-poll">Load</Button>
            </div>
          </div>
        )}
        {(mode === "view" || mode === "vote") && poll && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xl font-semibold" data-testid="text-poll-question">{poll.question}</h3>
              <Button size="icon" variant="outline" onClick={copyLink} data-testid="button-copy-link">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {poll.options.map((option, i) => {
                const percentage = totalVotes > 0 ? (poll.votes[i] / totalVotes) * 100 : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <Button
                        variant={hasVoted ? "ghost" : "outline"}
                        className="flex-1 justify-start"
                        onClick={() => vote(i)}
                        disabled={hasVoted}
                        data-testid={`button-vote-${i}`}
                      >
                        {option}
                        {hasVoted && <span className="ml-auto">{poll.votes[i]} votes ({percentage.toFixed(1)}%)</span>}
                      </Button>
                    </div>
                    {hasVoted && <Progress value={percentage} className="h-2" data-testid={`progress-${i}`} />}
                  </div>
                );
              })}
            </div>
            {hasVoted && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span>Thank you for voting! Total votes: {totalVotes}</span>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setMode("create"); setPoll(null); setHasVoted(false); }} data-testid="button-new-poll">
                Create New Poll
              </Button>
              <Button variant="outline" onClick={copyLink} data-testid="button-share-poll">
                <Share2 className="h-4 w-4 mr-2" /> Share Poll
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
