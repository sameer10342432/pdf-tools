import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, Copy, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SurveyQuestion {
  id: string;
  type: "text" | "multiple-choice" | "rating" | "yes-no";
  question: string;
  options?: string[];
}

interface Survey {
  id: string;
  title: string;
  questions: SurveyQuestion[];
  responses: any[];
}

export function OnlineSurveyMaker() {
  const [mode, setMode] = useState<"create" | "view" | "respond">("create");
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<SurveyQuestion[]>([
    { id: "1", type: "text", question: "" }
  ]);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [surveyId, setSurveyId] = useState("");
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now().toString(), type: "text", question: "" }]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const updateQuestion = (id: string, field: keyof SurveyQuestion, value: any) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map((q) => {
      if (q.id === questionId) {
        return { ...q, options: [...(q.options || []), ""] };
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map((q) => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const createSurvey = async () => {
    if (!title.trim() || questions.every((q) => !q.question.trim())) {
      toast({ title: "Please enter a title and at least one question", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const validQuestions = questions.filter((q) => q.question.trim());
      const res = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, questions: validQuestions }),
      });
      const data = await res.json();
      if (data.success) {
        setSurvey(data.survey);
        setMode("view");
        toast({ title: "Survey created successfully!" });
      }
    } catch {
      toast({ title: "Failed to create survey", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSurvey = async () => {
    if (!surveyId.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/surveys/${surveyId}`);
      const data = await res.json();
      if (data.success) {
        setSurvey(data.survey);
        setMode("respond");
      } else {
        toast({ title: "Survey not found", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to load survey", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const submitResponse = async () => {
    if (!survey) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/surveys/${survey.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        toast({ title: "Response submitted!" });
      }
    } catch {
      toast({ title: "Failed to submit response", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = () => {
    if (survey) {
      navigator.clipboard.writeText(`${window.location.origin}/tool/online-survey-maker?id=${survey.id}`);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {mode === "create" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Survey Title</Label>
              <Input id="title" placeholder="Enter survey title" value={title} onChange={(e) => setTitle(e.target.value)} data-testid="input-survey-title" />
            </div>
            <div className="space-y-4">
              <Label>Questions</Label>
              {questions.map((q, i) => (
                <Card key={q.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex gap-2 items-start">
                      <span className="text-sm font-medium mt-2">Q{i + 1}</span>
                      <div className="flex-1 space-y-2">
                        <Input placeholder="Enter question" value={q.question} onChange={(e) => updateQuestion(q.id, "question", e.target.value)} data-testid={`input-question-${i}`} />
                        <Select value={q.type} onValueChange={(v: any) => updateQuestion(q.id, "type", v)}>
                          <SelectTrigger data-testid={`select-type-${i}`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text Answer</SelectItem>
                            <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                            <SelectItem value="rating">Rating (1-5)</SelectItem>
                            <SelectItem value="yes-no">Yes/No</SelectItem>
                          </SelectContent>
                        </Select>
                        {q.type === "multiple-choice" && (
                          <div className="space-y-2 pl-4">
                            {(q.options || []).map((opt, oi) => (
                              <Input key={oi} placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => updateOption(q.id, oi, e.target.value)} data-testid={`input-option-${i}-${oi}`} />
                            ))}
                            <Button size="sm" variant="outline" onClick={() => addOption(q.id)} data-testid={`button-add-option-${i}`}>
                              <Plus className="h-3 w-3 mr-1" /> Add Option
                            </Button>
                          </div>
                        )}
                      </div>
                      {questions.length > 1 && (
                        <Button size="icon" variant="ghost" onClick={() => removeQuestion(q.id)} data-testid={`button-remove-question-${i}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              <Button variant="outline" onClick={addQuestion} data-testid="button-add-question">
                <Plus className="h-4 w-4 mr-2" /> Add Question
              </Button>
            </div>
            <Button onClick={createSurvey} disabled={isLoading} className="w-full" data-testid="button-create-survey">Create Survey</Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Enter Survey ID to respond" value={surveyId} onChange={(e) => setSurveyId(e.target.value)} data-testid="input-survey-id" />
              <Button onClick={loadSurvey} disabled={isLoading} data-testid="button-load-survey">Load</Button>
            </div>
          </div>
        )}
        {mode === "view" && survey && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xl font-semibold" data-testid="text-survey-title">{survey.title}</h3>
              <Button size="icon" variant="outline" onClick={copyLink} data-testid="button-copy-link"><Copy className="h-4 w-4" /></Button>
            </div>
            <p className="text-muted-foreground">Survey created with {survey.questions.length} question(s). Responses: {survey.responses.length}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setMode("create"); setSurvey(null); }} data-testid="button-new-survey">Create New Survey</Button>
              <Button onClick={copyLink} data-testid="button-share-survey"><Copy className="h-4 w-4 mr-2" /> Share Survey</Button>
            </div>
          </div>
        )}
        {mode === "respond" && survey && !submitted && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold" data-testid="text-survey-title">{survey.title}</h3>
            {survey.questions.map((q, i) => (
              <div key={q.id} className="space-y-2">
                <Label>Q{i + 1}: {q.question}</Label>
                {q.type === "text" && (
                  <Textarea placeholder="Your answer" value={String(answers[q.id] || "")} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} data-testid={`input-answer-${i}`} />
                )}
                {q.type === "multiple-choice" && q.options && (
                  <RadioGroup value={String(answers[q.id] || "")} onValueChange={(v) => setAnswers({ ...answers, [q.id]: v })}>
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt} id={`${q.id}-${oi}`} data-testid={`radio-${i}-${oi}`} />
                        <Label htmlFor={`${q.id}-${oi}`}>{opt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                {q.type === "rating" && (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Button key={n} size="icon" variant={answers[q.id] === n ? "default" : "outline"} onClick={() => setAnswers({ ...answers, [q.id]: n })} data-testid={`button-rating-${i}-${n}`}>{n}</Button>
                    ))}
                  </div>
                )}
                {q.type === "yes-no" && (
                  <div className="flex gap-2">
                    <Button variant={answers[q.id] === "yes" ? "default" : "outline"} onClick={() => setAnswers({ ...answers, [q.id]: "yes" })} data-testid={`button-yes-${i}`}>Yes</Button>
                    <Button variant={answers[q.id] === "no" ? "default" : "outline"} onClick={() => setAnswers({ ...answers, [q.id]: "no" })} data-testid={`button-no-${i}`}>No</Button>
                  </div>
                )}
              </div>
            ))}
            <Button onClick={submitResponse} disabled={isLoading} className="w-full" data-testid="button-submit-survey">Submit Response</Button>
          </div>
        )}
        {submitted && (
          <div className="text-center space-y-4 py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold">Thank you!</h3>
            <p className="text-muted-foreground">Your response has been recorded.</p>
            <Button variant="outline" onClick={() => { setMode("create"); setSurvey(null); setSubmitted(false); setAnswers({}); }} data-testid="button-new-response">Create New Survey</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
