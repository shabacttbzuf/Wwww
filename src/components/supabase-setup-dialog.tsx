import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Database, Key, Globe } from "lucide-react";
import { toast } from "sonner";

export function SupabaseSetupDialog() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("supabase-config-needed", handleOpen);

    // Also check on mount if config is missing
    const storedUrl = localStorage.getItem("supabase_url");
    const storedKey = localStorage.getItem("supabase_key");
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if ((!envUrl || !envKey) && (!storedUrl || !storedKey)) {
      setOpen(true);
    }

    return () => window.removeEventListener("supabase-config-needed", handleOpen);
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      toast.error("يرجى إدخال رابط المشروع والمفتاح العام");
      return;
    }
    localStorage.setItem("supabase_url", url.trim());
    localStorage.setItem("supabase_key", key.trim());
    toast.success("تم حفظ إعدادات قاعدة البيانات بنجاح");
    setOpen(false);
    window.location.reload();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Database className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">ربط قاعدة بيانات Supabase</DialogTitle>
          <DialogDescription className="text-center">
            يرجى إدخال بيانات مشروع Supabase الخاص بك لربط النظام وتمكين تسجيل الدخول وقاعدة
            البيانات.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sb-url" className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              رابط المشروع (Supabase URL)
            </Label>
            <Input
              id="sb-url"
              placeholder="https://your-project.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sb-key" className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              المفتاح العام (Publishable / Anon Key)
            </Label>
            <Input
              id="sb-key"
              type="password"
              placeholder="eyJ..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
              dir="ltr"
            />
          </div>
          <Button type="submit" className="w-full">
            حفظ وربط النظام
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
