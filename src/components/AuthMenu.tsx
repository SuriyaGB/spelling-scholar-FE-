import { useState } from "react";
import { LogIn, LogOut, User as UserIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AuthDialog } from "@/components/AuthDialog";

export function AuthMenu() {
  const { user, loading, configured, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (!configured) return null;

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  if (user) {
    const label = user.email ?? user.user_metadata?.name ?? "Signed in";
    return (
      <div className="flex items-center gap-1.5">
        <span
          className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground max-w-[140px] truncate"
          title={label}
        >
          <UserIcon className="h-3 w-3" /> {label}
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
        className="flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        title="Sign in"
      >
        <LogIn className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Sign in</span>
      </button>
      <AuthDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
