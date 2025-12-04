import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Volume2, VolumeX, Play, Pause, Square } from "lucide-react";

interface Voice {
  name: string;
  lang: string;
  voice: SpeechSynthesisVoice;
}

export function TextToSpeechComponent() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const voiceList = availableVoices.map((v) => ({
        name: v.name,
        lang: v.lang,
        voice: v,
      }));
      setVoices(voiceList);
      
      if (voiceList.length > 0 && !selectedVoice) {
        const defaultVoice = voiceList.find(v => v.lang.startsWith("en")) || voiceList[0];
        setSelectedVoice(defaultVoice.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [selectedVoice]);

  const speak = useCallback(() => {
    if (!text.trim()) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice.voice;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [text, selectedVoice, rate, pitch, voices]);

  const pause = useCallback(() => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSpeaking, isPaused]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  if (!isSupported) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <VolumeX className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            Text-to-speech is not supported in your browser. Please try a different browser.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="tts-text">Text to Speak</Label>
          <Textarea
            id="tts-text"
            placeholder="Enter the text you want to convert to speech..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="resize-none"
            data-testid="textarea-tts-text"
          />
          <p className="text-xs text-muted-foreground">
            {text.length} characters
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Voice</Label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger data-testid="select-tts-voice">
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((v) => (
                  <SelectItem key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Speed: {rate.toFixed(1)}x</Label>
            <Slider
              value={[rate]}
              min={0.5}
              max={2}
              step={0.1}
              onValueChange={([val]) => setRate(val)}
              data-testid="slider-tts-rate"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Pitch: {pitch.toFixed(1)}</Label>
          <Slider
            value={[pitch]}
            min={0.5}
            max={2}
            step={0.1}
            onValueChange={([val]) => setPitch(val)}
            data-testid="slider-tts-pitch"
          />
        </div>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          {!isSpeaking ? (
            <Button
              size="lg"
              onClick={speak}
              disabled={!text.trim()}
              className="gap-2"
              data-testid="button-speak"
            >
              <Volume2 className="w-5 h-5" />
              Speak
            </Button>
          ) : (
            <>
              <Button
                size="icon"
                variant="outline"
                onClick={isPaused ? resume : pause}
                data-testid="button-pause-speech"
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
              
              <Button
                size="lg"
                variant="destructive"
                onClick={stop}
                className="gap-2"
                data-testid="button-stop-speech"
              >
                <Square className="w-5 h-5" />
                Stop
              </Button>
            </>
          )}
        </div>

        {isSpeaking && (
          <div className="flex items-center justify-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isPaused ? "bg-yellow-500" : "bg-green-500 animate-pulse"}`} />
            <span className="text-sm text-muted-foreground">
              {isPaused ? "Paused" : "Speaking..."}
            </span>
          </div>
        )}

        <p className="text-sm text-muted-foreground text-center">
          This uses your browser's built-in text-to-speech engine. Available voices depend on your system.
        </p>
      </div>
    </Card>
  );
}
