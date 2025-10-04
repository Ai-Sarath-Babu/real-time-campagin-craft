import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import rrwebPlayer from "rrweb-player";
import "rrweb-player/dist/style.css";

interface SessionRecordingViewerProps {
  recordingUrl: string;
  visitorId: string;
  timestamp: string;
}

export const SessionRecordingViewer = ({ 
  recordingUrl, 
  visitorId, 
  timestamp 
}: SessionRecordingViewerProps) => {
  const { toast } = useToast();
  const playerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerRef.current || !recordingUrl) return;

    try {
      // Parse the recording data
      let events;
      if (recordingUrl.startsWith('data:application/json;base64,')) {
        const base64Data = recordingUrl.split(',')[1];
        const jsonData = decodeURIComponent(escape(atob(base64Data)));
        events = JSON.parse(jsonData);
      } else {
        throw new Error("Invalid recording format");
      }

      // Clear previous player
      playerRef.current.innerHTML = '';

      // Create new player
      const newPlayer = new rrwebPlayer({
        target: playerRef.current,
        props: {
          events,
          width: 1024,
          height: 576,
          autoPlay: false,
          showController: true,
          tags: {
            visitor: visitorId,
            timestamp: new Date(timestamp).toLocaleString()
          }
        },
      });

      setPlayer(newPlayer);
      setError(null);
    } catch (err) {
      console.error("Error loading recording:", err);
      setError("Failed to load recording. The data may be corrupted or incomplete.");
      toast({
        title: "Error",
        description: "Failed to load session recording",
        variant: "destructive",
      });
    }

    return () => {
      // Cleanup
      if (player) {
        try {
          player.pause();
        } catch (e) {
          console.error("Error cleaning up player:", e);
        }
      }
    };
  }, [recordingUrl, visitorId, timestamp]);

  if (error) {
    return (
      <Card className="p-6 border-border/50 bg-card/80">
        <div className="flex items-start gap-3 text-destructive">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to load recording</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4 border-border/50 bg-card/80">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Session Recording</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{visitorId}</Badge>
            <span className="text-sm text-muted-foreground">
              {new Date(timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div ref={playerRef} className="w-full rounded-lg overflow-hidden bg-muted/30" />

      <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
        <p>💡 Tip: Use the player controls to play, pause, and seek through the recording</p>
      </div>
    </Card>
  );
};
