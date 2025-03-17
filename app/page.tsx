"use client";

import { useState, useEffect, useRef } from "react";
import { Moon, Sun, Play, Pause, StopCircle, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

export default function TextToSpeech() {
  const [text, setText] = useState<string>(
    "Hello! This is a text-to-speech application that works entirely in your browser. No APIs needed!"
  );
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const synth = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      synth.current = window.speechSynthesis;

      // Load available voices
      const loadVoices = () => {
        const availableVoices = synth.current?.getVoices() || [];
        setVoices(availableVoices);

        // Set default voice
        if (availableVoices.length > 0 && !selectedVoice) {
          setSelectedVoice(availableVoices[0].name);
        }
      };

      // Chrome loads voices asynchronously
      if (synth.current?.onvoiceschanged !== undefined) {
        synth.current.onvoiceschanged = loadVoices;
      }

      loadVoices();
    }

    // Cleanup
    return () => {
      if (synth.current?.speaking) {
        synth.current.cancel();
      }
    };
  }, [selectedVoice]);

  // Initialize dark mode based on user preference (only runs once)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for user preference for dark mode
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        setDarkMode(true);
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []); // Empty dependency array means this only runs once on mount

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  // Update when darkMode state changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Speak the text
  const speak = () => {
    if (synth.current) {
      // Cancel any ongoing speech
      if (synth.current.speaking) {
        synth.current.cancel();
      }

      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Set voice
      const voice = voices.find((v) => v.name === selectedVoice);
      if (voice) {
        utterance.voice = voice;
      }

      // Set rate and pitch
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Event handlers
      utterance.onstart = () => {
        setSpeaking(true);
        setPaused(false);
      };

      utterance.onend = () => {
        setSpeaking(false);
        setPaused(false);
      };

      utterance.onerror = () => {
        setSpeaking(false);
        setPaused(false);
      };

      // Speak
      synth.current.speak(utterance);
    }
  };

  // Pause speech
  const pause = () => {
    if (synth.current) {
      synth.current.pause();
      setPaused(true);
    }
  };

  // Resume speech
  const resume = () => {
    if (synth.current) {
      synth.current.resume();
      setPaused(false);
    }
  };

  // Stop speech
  const stop = () => {
    if (synth.current) {
      synth.current.cancel();
      setSpeaking(false);
      setPaused(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg dark:bg-gray-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Volume2 className="h-6 w-6" />
                Text to Speech
              </CardTitle>
              <CardDescription>
                Convert text to speech directly in your browser
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleDarkMode}
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter text to convert to speech..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-32 resize-none"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Voice</label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">
                    Rate: {rate.toFixed(1)}
                  </label>
                </div>
                <Slider
                  value={[rate]}
                  min={0.1}
                  max={2}
                  step={0.1}
                  onValueChange={(value: [number]) => setRate(value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">
                    Pitch: {pitch.toFixed(1)}
                  </label>
                </div>
                <Slider
                  value={[pitch]}
                  min={0.1}
                  max={2}
                  step={0.1}
                  onValueChange={(value: [number]) => setPitch(value[0])}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          {!speaking ? (
            <Button onClick={speak} className="w-32">
              <Play className="mr-2 h-4 w-4" /> Play
            </Button>
          ) : paused ? (
            <Button onClick={resume} className="w-32">
              <Play className="mr-2 h-4 w-4" /> Resume
            </Button>
          ) : (
            <Button onClick={pause} className="w-32">
              <Pause className="mr-2 h-4 w-4" /> Pause
            </Button>
          )}

          <Button
            onClick={stop}
            variant="outline"
            className="w-32"
            disabled={!speaking && !paused}
          >
            <StopCircle className="mr-2 h-4 w-4" /> Stop
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
