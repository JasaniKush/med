'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSelector } from "./LanguageSelector";
import { VOICE_LANGUAGES } from "@/lib/constants";
import { Upload, Loader2, FileText, Camera, RefreshCcw, CircleDot } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FileUploadFormProps {
  isPending: boolean;
}

export function FileUploadForm({ isPending }: FileUploadFormProps) {
    const [fileName, setFileName] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [capturedImageDataUri, setCapturedImageDataUri] = useState<string>("");
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [activeTab, setActiveTab] = useState("upload");

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setCapturedImageDataUri(""); // Clear captured image if a file is selected
        } else {
            setFileName("");
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const input = document.getElementById('file-upload') as HTMLInputElement;
            if (input) {
                input.files = files;
                const event = new Event('change', { bubbles: true });
                input.dispatchEvent(event);
            }
        }
    };

    const enableCamera = useCallback(async () => {
        if (hasCameraPermission !== null) return;

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                setHasCameraPermission(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions in your browser settings to use this feature.',
                });
            }
        } else {
            setHasCameraPermission(false);
            toast({
                variant: 'destructive',
                title: 'Camera Not Supported',
                description: 'Your browser does not support camera access.',
            });
        }
    }, [hasCameraPermission, toast]);
    
    useEffect(() => {
        if (activeTab === 'camera') {
            enableCamera();
        }

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [activeTab, enableCamera]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUri = canvas.toDataURL('image/jpeg');
                setCapturedImageDataUri(dataUri);
                setFileName(""); // Clear file name if an image is captured
            }
        }
    };

    const handleRetake = () => {
        setCapturedImageDataUri("");
    };
  
  return (
    <div className="space-y-6">
      <input type="hidden" name="capturedImage" value={capturedImageDataUri} />
      <canvas ref={canvasRef} className="hidden" />

       <Tabs defaultValue="upload" className="w-full" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">
                    <Upload className="mr-2" /> Upload File
                </TabsTrigger>
                <TabsTrigger value="camera">
                    <Camera className="mr-2" /> Use Camera
                </TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="pt-6">
                 <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                    Upload a PDF, PNG, or JPG file (max 5MB).
                    </p>
                    <div className="relative">
                        <Input id="file-upload" name="document" type="file" required={activeTab === 'upload'} className="hidden" onChange={handleFileChange} accept="application/pdf,image/png,image/jpeg" />
                        <Label 
                            htmlFor="file-upload" 
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-40 px-4 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                                isDragging ? "border-primary bg-primary/10" : "hover:border-primary/70 hover:bg-secondary/50"
                            )}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            {fileName ? (
                                <>
                                    <FileText className="h-10 w-10 text-primary mb-2" />
                                    <span className="text-foreground font-medium">{fileName}</span>
                                    <span className="text-muted-foreground text-xs mt-1">Click or drag another file to replace</span>
                                </>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                    <span className="text-muted-foreground">Click to upload or drag & drop</span>
                                    <span className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG (up to 5MB)</span>
                                </div>
                            )}
                        </Label>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="camera" className="pt-6">
                <div className="space-y-4">
                    {capturedImageDataUri ? (
                        <div className="space-y-4">
                            <div className="border rounded-lg overflow-hidden">
                               <img src={capturedImageDataUri} alt="Captured report" className="w-full h-auto" />
                            </div>
                            <Button onClick={handleRetake} variant="outline" className="w-full">
                                <RefreshCcw className="mr-2 h-4 w-4" /> Retake Photo
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="w-full aspect-video rounded-md bg-secondary flex items-center justify-center overflow-hidden relative">
                                <video ref={videoRef} className={cn("w-full h-full object-cover", hasCameraPermission ? 'block' : 'hidden')} autoPlay muted playsInline />
                                {hasCameraPermission === false && (
                                    <Alert variant="destructive" className="m-4">
                                        <Camera className="h-4 w-4" />
                                        <AlertTitle>Camera Access Denied</AlertTitle>
                                        <AlertDescription>Please allow camera access to use this feature.</AlertDescription>
                                    </Alert>
                                )}
                                {hasCameraPermission === null && !isPending && <p className="text-muted-foreground">Waiting for camera...</p>}
                            </div>
                            <Button onClick={handleCapture} className="w-full" disabled={!hasCameraPermission || isPending}>
                                <CircleDot className="mr-2 h-4 w-4" /> Capture Photo
                            </Button>
                        </div>
                    )}
                </div>
            </TabsContent>
        </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="patient-age">Patient Age (Optional)</Label>
          <Input id="patient-age" name="patientAge" type="number" placeholder="e.g., 45" min="0" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="voice-language">Voice Language</Label>
          <LanguageSelector
            id="voice-language"
            name="voiceLanguage"
            languages={VOICE_LANGUAGES}
            defaultValue="en"
          />
        </div>
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg" disabled={isPending || (!fileName && !capturedImageDataUri)}>
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {isPending ? "Analyzing..." : "Generate Report"}
      </Button>
    </div>
  );
}
