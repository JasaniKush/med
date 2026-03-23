import { MedBuddyLogo } from "./icons";

export function Header() {
  return (
    <header className="flex flex-col items-center text-center">
        <div className="flex items-center gap-4">
            <MedBuddyLogo className="h-12 w-12 text-primary" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                MedBuddy
            </h1>
        </div>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Upload a medical document to get an instant, easy-to-understand summary. No sign-up required. Your privacy is protected.
        </p>
    </header>
  );
}
