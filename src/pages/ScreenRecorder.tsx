import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Video, Square, Download, Loader2, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ScreenRecorder = () => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewRef = useRef<HTMLVideoElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      streamRef.current = stream;

      // Show live preview
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        previewRef.current.muted = true;
        previewRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm; codecs=vp9')
          ? 'video/webm; codecs=vp9'
          : 'video/webm'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        
        // Stop preview
        if (previewRef.current) {
          previewRef.current.srcObject = null;
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        toast({
          title: "Recording saved!",
          description: "Your screen recording is ready to download",
        });
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Handle user stopping share from browser
      stream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      toast({
        title: "Recording started",
        description: "Your screen is being recorded",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Error",
        description: "Failed to start recording. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const downloadRecording = () => {
    if (recordedUrl) {
      const a = document.createElement('a');
      a.href = recordedUrl;
      a.download = `screen-recording-${Date.now()}.webm`;
      a.click();
      
      toast({
        title: "Download started",
        description: "Your recording is being downloaded",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Video className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Screen Recorder
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Record your screen in real-time with audio support
            </p>
          </div>

          {/* Recording Controls */}
          <Card className="p-8 border-border/50 bg-card/80 backdrop-blur">
            <div className="space-y-6">
              {/* Status Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isRecording ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <Badge variant="destructive" className="font-mono">
                          {formatTime(recordingTime)}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">Recording in progress</span>
                    </>
                  ) : recordedUrl ? (
                    <>
                      <Badge variant="secondary">
                        <Monitor className="w-3 h-3 mr-1" />
                        Recording Ready
                      </Badge>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Ready to record</span>
                  )}
                </div>

                {isRecording && (
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    className="gap-2"
                  >
                    <Square className="w-4 h-4" />
                    Stop Recording
                  </Button>
                )}
              </div>

              {/* Video Preview */}
              <div className="aspect-video bg-muted/50 rounded-lg overflow-hidden border border-border/50">
                {isRecording ? (
                  <video
                    ref={previewRef}
                    className="w-full h-full object-contain"
                    playsInline
                  />
                ) : recordedUrl ? (
                  <video
                    src={recordedUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <Monitor className="w-16 h-16 mx-auto text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        Click "Start Recording" to begin
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4">
                {!isRecording && !recordedUrl && (
                  <Button
                    onClick={startRecording}
                    size="lg"
                    className="gap-2"
                  >
                    <Video className="w-5 h-5" />
                    Start Recording
                  </Button>
                )}

                {recordedUrl && (
                  <Button
                    onClick={downloadRecording}
                    size="lg"
                    className="gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Recording
                  </Button>
                )}

                {recordedUrl && (
                  <Button
                    onClick={() => {
                      setRecordedUrl(null);
                      setRecordingTime(0);
                    }}
                    variant="outline"
                    size="lg"
                  >
                    New Recording
                  </Button>
                )}
              </div>

              {/* Features */}
              <div className="pt-4 border-t border-border/50">
                <h3 className="font-semibold mb-3">Features:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <p>✅ <strong>High Quality:</strong> Up to 1080p @ 30fps</p>
                  <p>✅ <strong>Audio Support:</strong> Record system and microphone audio</p>
                  <p>✅ <strong>Real-time Preview:</strong> See what you're recording</p>
                  <p>✅ <strong>Instant Download:</strong> Save recordings locally</p>
                  <p>✅ <strong>Browser Native:</strong> No software installation needed</p>
                  <p>✅ <strong>Privacy First:</strong> All processing happens locally</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ScreenRecorder;
