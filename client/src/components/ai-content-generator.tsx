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
  "ai-cover-letter-generator": {
    inputLabel: "Job Position",
    placeholder: "Enter the job title you're applying for",
    additionalFields: [
      { name: "company", label: "Company Name", type: "input" },
      { name: "experience", label: "Your Relevant Experience", type: "textarea" },
      { name: "skills", label: "Key Skills (comma separated)", type: "input" },
      { name: "tone", label: "Tone", type: "select", options: ["Professional", "Enthusiastic", "Confident", "Humble", "Creative"] },
    ],
  },
  "ai-interior-design": {
    inputLabel: "Room Type",
    placeholder: "Describe the room you want to design (e.g., living room, bedroom)",
    additionalFields: [
      { name: "style", label: "Design Style", type: "select", options: ["Modern", "Minimalist", "Scandinavian", "Industrial", "Bohemian", "Traditional", "Contemporary", "Rustic", "Art Deco", "Mid-Century Modern"] },
      { name: "budget", label: "Budget Range", type: "select", options: ["Budget-Friendly", "Mid-Range", "Luxury"] },
      { name: "colors", label: "Preferred Colors", type: "input" },
      { name: "requirements", label: "Special Requirements", type: "textarea" },
    ],
  },
  "ai-tattoo-generator": {
    inputLabel: "Tattoo Idea",
    placeholder: "Describe your tattoo idea or concept",
    additionalFields: [
      { name: "style", label: "Tattoo Style", type: "select", options: ["Traditional", "Neo-Traditional", "Minimalist", "Watercolor", "Geometric", "Tribal", "Japanese", "Blackwork", "Dotwork", "Realism", "Trash Polka"] },
      { name: "placement", label: "Body Placement", type: "select", options: ["Arm", "Forearm", "Shoulder", "Back", "Chest", "Leg", "Wrist", "Ankle", "Neck", "Finger", "Rib"] },
      { name: "size", label: "Size", type: "select", options: ["Small", "Medium", "Large", "Full Sleeve", "Half Sleeve"] },
      { name: "meaning", label: "Personal Meaning (optional)", type: "textarea" },
    ],
  },
  "ai-fashion-designer": {
    inputLabel: "Outfit Description",
    placeholder: "Describe the outfit or fashion style you want",
    additionalFields: [
      { name: "occasion", label: "Occasion", type: "select", options: ["Casual", "Business", "Formal", "Party", "Date Night", "Wedding", "Vacation", "Athleisure", "Street Style"] },
      { name: "season", label: "Season", type: "select", options: ["Spring", "Summer", "Fall", "Winter", "All Seasons"] },
      { name: "gender", label: "Style For", type: "select", options: ["Women", "Men", "Unisex", "Kids"] },
      { name: "budget", label: "Budget", type: "select", options: ["Budget-Friendly", "Mid-Range", "Designer", "Luxury"] },
      { name: "preferences", label: "Style Preferences", type: "textarea" },
    ],
  },
  "ai-recipe-generator": {
    inputLabel: "Dish or Ingredients",
    placeholder: "Describe the dish you want or list available ingredients",
    additionalFields: [
      { name: "cuisine", label: "Cuisine Type", type: "select", options: ["Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai", "French", "Mediterranean", "American", "Korean", "Middle Eastern", "Fusion"] },
      { name: "dietary", label: "Dietary Restrictions", type: "select", options: ["None", "Vegetarian", "Vegan", "Gluten-Free", "Keto", "Paleo", "Low-Carb", "Dairy-Free", "Halal", "Kosher"] },
      { name: "difficulty", label: "Difficulty Level", type: "select", options: ["Beginner", "Intermediate", "Advanced", "Chef Level"] },
      { name: "servings", label: "Number of Servings", type: "select", options: ["1", "2", "4", "6", "8", "10+"] },
      { name: "time", label: "Cooking Time", type: "select", options: ["15 minutes", "30 minutes", "1 hour", "2 hours", "No limit"] },
    ],
  },
  "ai-workout-planner": {
    inputLabel: "Fitness Goal",
    placeholder: "Describe your fitness goal (e.g., lose weight, build muscle)",
    additionalFields: [
      { name: "fitnessLevel", label: "Current Fitness Level", type: "select", options: ["Beginner", "Intermediate", "Advanced", "Athlete"] },
      { name: "workoutType", label: "Workout Type", type: "select", options: ["Strength Training", "Cardio", "HIIT", "Yoga", "Pilates", "CrossFit", "Calisthenics", "Mixed"] },
      { name: "equipment", label: "Available Equipment", type: "select", options: ["None (Bodyweight)", "Dumbbells", "Full Gym", "Resistance Bands", "Home Gym"] },
      { name: "duration", label: "Workout Duration", type: "select", options: ["15 minutes", "30 minutes", "45 minutes", "60 minutes", "90 minutes"] },
      { name: "daysPerWeek", label: "Days Per Week", type: "select", options: ["3", "4", "5", "6", "7"] },
    ],
  },
  "ai-travel-itinerary": {
    inputLabel: "Destination",
    placeholder: "Enter your travel destination",
    additionalFields: [
      { name: "duration", label: "Trip Duration", type: "select", options: ["Weekend (2-3 days)", "1 Week", "2 Weeks", "1 Month", "Extended"] },
      { name: "travelStyle", label: "Travel Style", type: "select", options: ["Budget Backpacker", "Mid-Range", "Luxury", "Adventure", "Cultural", "Relaxation", "Family-Friendly"] },
      { name: "interests", label: "Interests (comma separated)", type: "input" },
      { name: "budget", label: "Budget Per Day", type: "select", options: ["Under $50", "$50-100", "$100-200", "$200-500", "Unlimited"] },
      { name: "requirements", label: "Special Requirements", type: "textarea" },
    ],
  },
  "ai-horoscope-generator": {
    inputLabel: "Zodiac Sign",
    placeholder: "Enter zodiac sign (e.g., Aries, Taurus)",
    additionalFields: [
      { name: "period", label: "Time Period", type: "select", options: ["Daily", "Weekly", "Monthly", "Yearly"] },
      { name: "focus", label: "Life Area Focus", type: "select", options: ["General", "Love & Relationships", "Career & Finance", "Health & Wellness", "Personal Growth"] },
      { name: "style", label: "Reading Style", type: "select", options: ["Traditional", "Modern", "Inspirational", "Detailed", "Brief"] },
    ],
  },
  "ai-dream-interpreter": {
    inputLabel: "Dream Description",
    placeholder: "Describe your dream in detail",
    additionalFields: [
      { name: "dreamType", label: "Dream Type", type: "select", options: ["Normal", "Recurring", "Nightmare", "Lucid", "Prophetic", "Vivid"] },
      { name: "emotions", label: "Emotions Felt", type: "input" },
      { name: "interpretationStyle", label: "Interpretation Style", type: "select", options: ["Psychological", "Spiritual", "Cultural", "Scientific", "Mixed"] },
    ],
  },
  "ai-name-generator": {
    inputLabel: "Name Category",
    placeholder: "What type of name do you need? (e.g., baby name, business name)",
    additionalFields: [
      { name: "nameType", label: "Name Type", type: "select", options: ["Baby Name", "Business Name", "Brand Name", "Username", "Character Name", "Pet Name", "Product Name", "Domain Name"] },
      { name: "style", label: "Style", type: "select", options: ["Modern", "Classic", "Unique", "Professional", "Creative", "Funny", "Sophisticated"] },
      { name: "origin", label: "Cultural Origin (optional)", type: "select", options: ["Any", "English", "Latin", "Greek", "Hebrew", "Arabic", "Asian", "African", "European"] },
      { name: "startingLetter", label: "Starting Letter (optional)", type: "input" },
      { name: "keywords", label: "Keywords/Themes", type: "input" },
    ],
  },
  "ai-slogan-generator": {
    inputLabel: "Brand/Product Name",
    placeholder: "Enter your brand or product name",
    additionalFields: [
      { name: "industry", label: "Industry", type: "select", options: ["Technology", "Food & Beverage", "Fashion", "Health & Wellness", "Finance", "Education", "Entertainment", "Sports", "Travel", "Non-Profit", "Retail"] },
      { name: "tone", label: "Slogan Tone", type: "select", options: ["Professional", "Playful", "Inspiring", "Bold", "Friendly", "Sophisticated", "Humorous"] },
      { name: "length", label: "Slogan Length", type: "select", options: ["Short (2-4 words)", "Medium (5-7 words)", "Long (8+ words)"] },
      { name: "description", label: "Brand Description", type: "textarea" },
    ],
  },
  "ai-code-debugger": {
    inputLabel: "Code with Bug",
    placeholder: "Paste the code that has a bug or error",
    additionalFields: [
      { name: "language", label: "Programming Language", type: "select", options: ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin"] },
      { name: "errorMessage", label: "Error Message (if any)", type: "textarea" },
      { name: "expectedBehavior", label: "Expected Behavior", type: "textarea" },
    ],
  },
  "ai-code-reviewer": {
    inputLabel: "Code to Review",
    placeholder: "Paste the code you want reviewed",
    additionalFields: [
      { name: "language", label: "Programming Language", type: "select", options: ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin"] },
      { name: "focusAreas", label: "Focus Areas", type: "select", options: ["Performance", "Security", "Best Practices", "Readability", "All Areas"] },
      { name: "context", label: "Code Context", type: "textarea" },
    ],
  },
  "ai-code-translator": {
    inputLabel: "Code to Translate",
    placeholder: "Paste the code you want to translate",
    additionalFields: [
      { name: "sourceLanguage", label: "Source Language", type: "select", options: ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin"] },
      { name: "targetLanguage", label: "Target Language", type: "select", options: ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin"] },
      { name: "preserveComments", label: "Preserve Comments", type: "select", options: ["Yes", "No"] },
    ],
  },
  "ai-unit-test-generator": {
    inputLabel: "Code to Test",
    placeholder: "Paste the code you want to generate tests for",
    additionalFields: [
      { name: "language", label: "Programming Language", type: "select", options: ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby"] },
      { name: "framework", label: "Testing Framework", type: "select", options: ["Jest", "Mocha", "Pytest", "JUnit", "xUnit", "Go Test", "RSpec", "PHPUnit", "Auto-detect"] },
      { name: "coverage", label: "Test Coverage", type: "select", options: ["Basic", "Comprehensive", "Edge Cases Only", "Full Coverage"] },
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
