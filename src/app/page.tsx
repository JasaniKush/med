'use client';
import React, { useState, useTransition, useActionState } from 'react';
import { Header } from '@/components/medbuddy/Header';
import { FileUploadForm } from '@/components/medbuddy/FileUploadForm';
import { ReportDisplay } from '@/components/medbuddy/ReportDisplay';
import { InitialState, generateReport } from '@/app/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [formState, formAction] = useActionState(generateReport, null);
  const [isPending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(Date.now());

  const handleStartNew = () => {
    setFormKey(Date.now()); // Resets the form by changing its key
  };

  const showReport = formState?.status === 'success' && formState.report;
  const showForm = !showReport && !isPending;
  const showError = formState?.status === 'error';

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        <Header />
        <main className="mt-8">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              {showForm && (
                <form
                  key={formKey}
                  action={(formData) => startTransition(() => formAction(formData))}
                >
                  <FileUploadForm isPending={isPending} />
                </form>
              )}
              {isPending && <LoadingState />}
              {showReport && (
                <ReportDisplay
                  report={formState.report!}
                  extractedText={formState.extractedText!}
                  audioDataUri={formState.audioDataUri!}
                  onStartNew={handleStartNew}
                />
              )}
              {showError && (
                 <Alert variant="destructive" className="mt-4">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Error Processing Document</AlertTitle>
                  <AlertDescription>
                    {formState.message || "An unknown error occurred. Please try again."}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
       <footer className="mt-8 text-center text-muted-foreground text-sm">
        <p>Medicare is an AI-powered tool and does not provide medical advice. Always consult with a qualified healthcare professional.</p>
        <p>&copy; {new Date().getFullYear()} Medicare. For demonstration purposes only.</p>
      </footer>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Generating Your Report...</h2>
        <p className="text-muted-foreground">This may take a moment. Please don't close this page.</p>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3 mx-auto" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}
