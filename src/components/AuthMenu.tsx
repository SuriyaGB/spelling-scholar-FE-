import { useState } from "react";
import { LogIn, LogOut, User as UserIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AuthDialog } from "@/components/AuthDialog";

export function AuthMenu() {
  const { user, loading, configured, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  // Always render Sign in button, even when Supabase is not yet configured in this environment.

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  if (user) {
    const label = user.email ?? user.user_metadata?.name ?? "Signed in";
    return (
      <div className="flex items-center gap-1.5">
        <span
          className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground max-w-[200px] truncate"
          title={label}
        >
          <UserIcon className="h-4 w-4" /> {label}
        </span>
        <button
          onClick={() => signOut()}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="font-medium px-3 py-1.5 rounded-lg text-[#1e3a5f] hover:text-primary transition-colors text-base"
        title="Sign in"
      >
        Sign in
      </button>
      <AuthDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
