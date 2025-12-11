import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Copy, Download, Sparkles, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AiContentGeneratorProps {
  toolType: string;
  toolName: string;
}

interface GenerationConfig {
  placeholder: string;
  inputLabel: string;
  additionalFields?: { name: string; label: string; type: "input" | "select" | "textarea"; options?: string[] }[];
}

const toolConfigs: Record<string, GenerationConfig> = {
  "ai-logo-maker": {
    inputLabel: "Brand/Company Name",
    placeholder: "Enter your company or brand name",
    additionalFields: [
      { name: "industry", label: "Industry", type: "select", options: ["Technology", "Healthcare", "Finance", "Food & Beverage", "Retail", "Education", "Entertainment", "Sports", "Travel", "Other"] },
      { name: "style", label: "Logo Style", type: "select", options: ["Modern", "Classic", "Minimalist", "Playful", "Professional", "Abstract", "Vintage", "Geometric"] },
      { name: "colors", label: "Preferred Colors (optional)", type: "input" },
      { name: "description", label: "Brand Description", type: "textarea" },
    ],
  },
  "ai-ad-copy-generator": {
    inputLabel: "Product/Service Name",
    placeholder: "Enter your product or service name",
    additionalFields: [
      { name: "platform", label: "Ad Platform", type: "select", options: ["Google Ads", "Facebook", "Instagram", "LinkedIn", "Twitter", "TikTok", "YouTube"] },
      { name: "targetAudience", label: "Target Audience", type: "input" },
      { name: "uniqueSellingPoint", label: "Unique Selling Point", type: "textarea" },
      { name: "tone", label: "Tone", type: "select", options: ["Professional", "Casual", "Urgent", "Friendly", "Luxury", "Humorous"] },
    ],
  },
  "ai-blog-post-writer": {
    inputLabel: "Blog Topic",
    placeholder: "Enter your blog topic or title idea",
    additionalFields: [
      { name: "keywords", label: "Target Keywords (comma separated)", type: "input" },
      { name: "wordCount", label: "Word Count", type: "select", options: ["500", "800", "1000", "1500", "2000"] },
      { name: "tone", label: "Writing Tone", type: "select", options: ["Informative", "Conversational", "Professional", "Persuasive", "Entertaining"] },
      { name: "outline", label: "Key Points to Cover (optional)", type: "textarea" },
    ],
  },
  "ai-email-writer": {
    inputLabel: "Email Subject/Purpose",
    placeholder: "What is this email about?",
    additionalFields: [
      { name: "emailType", label: "Email Type", type: "select", options: ["Business", "Sales Outreach", "Follow-up", "Thank You", "Apology", "Meeting Request", "Introduction", "Newsletter"] },
      { name: "recipient", label: "Recipient Context", type: "input" },
      { name: "tone", label: "Tone", type: "select", options: ["Formal", "Friendly", "Professional", "Casual", "Apologetic", "Persuasive"] },
      { name: "keyPoints", label: "Key Points to Include", type: "textarea" },
    ],
  },
  "ai-social-media-generator": {
    inputLabel: "Post Topic/Content Idea",
    placeholder: "What do you want to post about?",
    additionalFields: [
      { name: "platform", label: "Platform", type: "select", options: ["Instagram", "Twitter/X", "LinkedIn", "Facebook", "TikTok", "Pinterest"] },
      { name: "postType", label: "Post Type", type: "select", options: ["Promotional", "Educational", "Entertaining", "Inspirational", "Behind-the-scenes", "Product Launch", "Announcement"] },
      { name: "tone", label: "Tone", type: "select", options: ["Professional", "Casual", "Witty", "Inspiring", "Informative", "Playful"] },
      { name: "includeHashtags", label: "Include Hashtags", type: "select", options: ["Yes", "No"] },
    ],
  },
  "ai-product-description-generator": {
    inputLabel: "Product Name",
    placeholder: "Enter the product name",
    additionalFields: [
      { name: "category", label: "Product Category", type: "select", options: ["Electronics", "Fashion", "Home & Garden", "Health & Beauty", "Sports & Outdoors", "Toys & Games", "Food & Beverages", "Books & Media", "Automotive", "Other"] },
      { name: "features", label: "Key Features (comma separated)", type: "input" },
      { name: "targetAudience", label: "Target Customer", type: "input" },
      { name: "tone", label: "Description Style", type: "select", options: ["Professional", "Casual", "Luxury", "Technical", "Fun", "Minimalist"] },
    ],
  },
  "ai-video-script-writer": {
    inputLabel: "Video Topic/Title",
    placeholder: "What is your video about?",
    additionalFields: [
      { name: "videoType", label: "Video Type", type: "select", options: ["YouTube Tutorial", "Explainer Video", "Product Review", "Vlog", "Advertisement", "Corporate Video", "Social Media Short", "Documentary Style"] },
      { name: "duration", label: "Target Duration", type: "select", options: ["30 seconds", "1 minute", "3 minutes", "5 minutes", "10 minutes", "15+ minutes"] },
      { name: "tone", label: "Tone", type: "select", options: ["Educational", "Entertaining", "Professional", "Casual", "Inspiring", "Dramatic"] },
      { name: "keyPoints", label: "Key Points to Cover", type: "textarea" },
    ],
  },
  "ai-music-generator": {
    inputLabel: "Music Description",
    placeholder: "Describe the music you want (mood, genre, use case)",
    additionalFields: [
      { name: "genre", label: "Genre", type: "select", options: ["Pop", "Rock", "Classical", "Electronic", "Jazz", "Hip Hop", "Ambient", "Cinematic", "Lo-fi", "Country", "Folk"] },
      { name: "mood", label: "Mood", type: "select", options: ["Happy", "Sad", "Energetic", "Calm", "Dramatic", "Mysterious", "Romantic", "Epic", "Peaceful"] },
      { name: "tempo", label: "Tempo", type: "select", options: ["Slow", "Medium", "Fast", "Variable"] },
      { name: "useCase", label: "Use Case", type: "select", options: ["Background Music", "Video/Film", "Podcast Intro", "Advertisement", "Gaming", "Meditation", "Workout"] },
    ],
  },
  "ai-code-generator": {
    inputLabel: "What code do you need?",
    placeholder: "Describe what you want the code to do",
    additionalFields: [
      { name: "language", label: "Programming Language", type: "select", options: ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin"] },
      { name: "codeType", label: "Code Type", type: "select", options: ["Function", "Class", "Algorithm", "API Integration", "Data Processing", "UI Component", "Database Query", "Utility Script"] },
      { name: "context", label: "Additional Context", type: "textarea" },
    ],
  },
  "ai-sql-query-generator": {
    inputLabel: "Describe Your Query",
    placeholder: "Describe in plain English what data you want",
    additionalFields: [
      { name: "database", label: "Database Type", type: "select", options: ["MySQL", "PostgreSQL", "SQLite", "SQL Server", "Oracle", "MariaDB"] },
            { name: "tables", label: "Table Names (comma separated)", type: "input" },
      { name: "queryType", label: "Query Type", type: "select", options: ["SELECT", "INSERT", "UPDATE", "DELETE", "CREATE TABLE", "JOIN", "Aggregation", "Complex Query"] },
    ],
  },
  "ai-regex-generator": {
    inputLabel: "Describe Your Pattern",
    placeholder: "What do you want to match? (e.g., email addresses, phone numbers)",
    additionalFields: [
      { name: "language", label: "Target Language", type: "select", options: ["JavaScript", "Python", "Java", "PHP", "Ruby", "Go", "C#", "Rust"] },
      { name: "flags", label: "Regex Flags (optional)", type: "input" },
      { name: "testCases", label: "Test Cases (examples to match)", type: "textarea" },
    ],
  },
  "ai-excel-formula-generator": {
    inputLabel: "Describe Your Formula Need",
    placeholder: "What calculation or operation do you need?",
    additionalFields: [
      { name: "platform", label: "Platform", type: "select", options: ["Excel", "Google Sheets", "LibreOffice Calc"] },
      { name: "columns", label: "Columns/Cells Involved", type: "input" },
      { name: "complexity", label: "Complexity", type: "select", options: ["Simple", "Intermediate", "Advanced", "Expert"] },
    ],
  },
  "ai-app-builder": {
    inputLabel: "Describe Your Feature",
    placeholder: "What app feature do you want to build?",
    additionalFields: [
      { name: "framework", label: "Framework", type: "select", options: ["React", "React Native", "Vue", "Angular", "Flutter", "Swift", "Kotlin"] },
      { name: "featureType", label: "Feature Type", type: "select", options: ["Component", "Page", "API", "Full Feature", "CRUD Operations"] },
      { name: "requirements", label: "Specific Requirements", type: "textarea" },
    ],
  },
  "ai-chatbot-builder": {
    inputLabel: "Chatbot Topic/Purpose",
    placeholder: "What should your chatbot do?",
    additionalFields: [
      { name: "purpose", label: "Bot Purpose", type: "select", options: ["Customer Service", "Sales", "FAQ", "Lead Generation", "Booking", "Technical Support"] },
      { name: "tone", label: "Conversation Tone", type: "select", options: ["Professional", "Friendly", "Casual", "Formal", "Playful"] },
      { name: "intents", label: "Key Intents (comma separated)", type: "input" },
    ],
  },
  "ai-data-analyzer": {
    inputLabel: "Describe Your Data",
    placeholder: "What data do you have and what insights do you need?",
    additionalFields: [
      { name: "dataType", label: "Data Type", type: "select", options: ["Sales Data", "Survey Results", "Financial Data", "User Analytics", "Marketing Metrics", "Operations Data"] },
      { name: "goal", label: "Analysis Goal", type: "select", options: ["Trend Analysis", "Performance Review", "Anomaly Detection", "Forecasting", "Comparison"] },
      { name: "metrics", label: "Key Metrics (comma separated)", type: "input" },
    ],
  },
  "ai-meeting-summarizer": {
    inputLabel: "Meeting Notes",
    placeholder: "Paste your meeting notes, transcript, or key points discussed",
    additionalFields: [
      { name: "meetingType", label: "Meeting Type", type: "select", options: ["Team Standup", "Project Review", "Client Call", "Brainstorm", "One-on-One", "Board Meeting"] },
      { name: "attendees", label: "Attendees (optional)", type: "input" },
    ],
  },
  "ai-note-taker": {
    inputLabel: "Your Notes",
    placeholder: "Paste your rough notes, jottings, or bullet points",
    additionalFields: [
      { name: "format", label: "Output Format", type: "select", options: ["Bullet Points", "Numbered List", "Paragraphs", "Outline", "Mind Map Text"] },
      { name: "context", label: "Context (lecture, meeting, etc.)", type: "input" },
    ],
  },
  "ai-homework-helper": {
    inputLabel: "Your Question or Problem",
    placeholder: "Paste your homework question or describe the problem",
    additionalFields: [
      { name: "subject", label: "Subject", type: "select", options: ["Math", "Physics", "Chemistry", "Biology", "History", "English", "Computer Science", "Economics"] },
      { name: "gradeLevel", label: "Grade Level", type: "select", options: ["Elementary", "Middle School", "High School", "Undergraduate", "Graduate"] },
      { name: "specificHelp", label: "What help do you need?", type: "textarea" },
    ],
  },
  "ai-story-generator": {
    inputLabel: "Story Idea or Prompt",
    placeholder: "Describe your story idea, characters, or setting",
    additionalFields: [
      { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Romance", "Mystery", "Horror", "Adventure", "Literary Fiction", "Childrens"] },
      { name: "length", label: "Story Length", type: "select", options: ["Flash Fiction", "Short Story", "Long Story"] },
      { name: "tone", label: "Tone", type: "select", options: ["Light", "Dark", "Humorous", "Dramatic", "Suspenseful", "Heartwarming"] },
      { name: "elements", label: "Elements to Include (optional)", type: "textarea" },
    ],
  },
  "ai-resume-builder": {
    inputLabel: "Your Role or Experience",
    placeholder: "Describe your job title, experience, and key responsibilities",
    additionalFields: [
      { name: "industry", label: "Industry", type: "select", options: ["Technology", "Finance", "Healthcare", "Marketing", "Sales", "Education", "Engineering", "Creative"] },
      { name: "experienceLevel", label: "Experience Level", type: "select", options: ["Entry Level", "Mid-Level", "Senior", "Executive", "Career Change"] },
      { name: "achievements", label: "Key Achievements", type: "textarea" },
    ],
  },
};

export function AiContentGenerator({ toolType, toolName }: AiContentGeneratorProps) {
  const { toast } = useToast();
  const [mainInput, setMainInput] = useState("");
  const [additionalInputs, setAdditionalInputs] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState("");
  const [copied, setCopied] = useState(false);

  const config = toolConfigs[toolType] || {
    inputLabel: "Input",
    placeholder: "Enter your prompt",
  };

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/ai/generate`, {
        toolType,
        mainInput,
        options: additionalInputs,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.content) {
        setGeneratedContent(data.content);
        toast({
          title: "Content Generated",
          description: "Your AI-generated content is ready.",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: data.error || "Failed to generate content",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred during generation",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!mainInput.trim()) {
      toast({
        title: "Input Required",
        description: `Please enter ${config.inputLabel.toLowerCase()}`,
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      toast({
        title: "Copied",
        description: "Content copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${toolType}-output.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateAdditionalInput = (name: string, value: string) => {
    setAdditionalInputs((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {toolName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="main-input" data-testid="label-main-input">{config.inputLabel}</Label>
            <Input
              id="main-input"
              data-testid="input-main"
              placeholder={config.placeholder}
              value={mainInput}
              onChange={(e) => setMainInput(e.target.value)}
            />
          </div>

          {config.additionalFields?.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} data-testid={`label-${field.name}`}>{field.label}</Label>
              {field.type === "input" && (
                <Input
                  id={field.name}
                  data-testid={`input-${field.name}`}
                  value={additionalInputs[field.name] || ""}
                  onChange={(e) => updateAdditionalInput(field.name, e.target.value)}
                />
              )}
              {field.type === "textarea" && (
                <Textarea
                  id={field.name}
                  data-testid={`textarea-${field.name}`}
                  value={additionalInputs[field.name] || ""}
                  onChange={(e) => updateAdditionalInput(field.name, e.target.value)}
                  rows={3}
                />
              )}
              {field.type === "select" && field.options && (
                <Select
                  value={additionalInputs[field.name] || ""}
                  onValueChange={(value) => updateAdditionalInput(field.name, value)}
                >
                  <SelectTrigger data-testid={`select-${field.name}`}>
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option} value={option} data-testid={`option-${field.name}-${option}`}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}

          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="w-full"
            data-testid="button-generate"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <span>Generated Content</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} data-testid="button-copy">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} data-testid="button-download">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="whitespace-pre-wrap rounded-md border bg-muted p-4 text-sm"
              data-testid="text-generated-content"
            >
              {generatedContent}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
