"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Code2,
  Star,
  Lock,
  Trophy,
  Medal,
  ArrowLeft,
  Camera,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  AVATAR_MAX_BYTES,
  avatarObjectPath,
  resolveProfileAvatarUrl,
} from "@/lib/supabase/avatar";

export type AchievementRow = {
  id: string;
  title: string;
  description: string | null;
  badge_icon: string | null;
};

function iconForBadge(raw: string | null) {
  switch (raw) {
    case "trophy":
      return Trophy;
    case "star":
      return Star;
    case "zap":
      return Zap;
    case "code":
      return Code2;
    case "flame":
      return Zap;
    default:
      return Medal;
  }
}

function initials(name: string, email: string | null | undefined) {
  const n = name.trim();
  if (n.length >= 2) return n.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "?";
}

function ProfileAvatarCircle(props: {
  className?: string;
  fallbackClassName?: string;
  imageUrl: string | null;
  name: string;
  email: string | null | undefined;
}) {
  const { className, fallbackClassName, imageUrl, name, email } = props;
  return (
    <Avatar className={className}>
      {imageUrl ? (
        <AvatarImage src={imageUrl} alt="" className="object-cover" />
      ) : null}
      <AvatarFallback className={fallbackClassName}>
        {initials(name, email)}
      </AvatarFallback>
    </Avatar>
  );
}

type Props = {
  userId: string;
  initialFullName: string;
  email: string | null;
  level: number;
  achievements: AchievementRow[];
  /** Raw `profiles.avatar_url` (storage path or absolute URL). */
  initialAvatarPath: string | null;
};

/**
 * Profile hub: display name, level from quiz XP, earned achievements, save name to profiles.
 */
export function ProfileCustomization({
  userId,
  initialFullName,
  email,
  level,
  achievements,
  initialAvatarPath,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(initialFullName);
  const [saving, setSaving] = useState(false);
  const [avatarPath, setAvatarPath] = useState(initialAvatarPath);
  const [avatarUploading, setAvatarUploading] = useState(false);
  /** Bump after each successful storage upload so the browser refetches the same public URL. */
  const [avatarVersion, setAvatarVersion] = useState(0);

  const displayAvatarUrl = useMemo(() => {
    const base = resolveProfileAvatarUrl(avatarPath, supabase);
    if (!base) return null;
    if (avatarVersion <= 0) return base;
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}v=${avatarVersion}`;
  }, [avatarPath, supabase, avatarVersion]);

  const showUnlockCount = `${achievements.length} earned`;

  const [showcase, setShowcase] = useState<string[]>(() =>
    achievements.slice(0, 3).map((a) => a.id)
  );

  useEffect(() => {
    setFullName(initialFullName);
  }, [initialFullName]);

  useEffect(() => {
    setAvatarPath(initialAvatarPath);
  }, [initialAvatarPath]);

  function toggleShowcase(id: string) {
    setShowcase((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id].slice(-3)
    );
  }

  async function saveName() {
    if (!fullName.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId, full_name: fullName.trim() });
      if (error) throw error;
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  async function onAvatarFileChange(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      alert("Image must be 2 MB or smaller.");
      return;
    }
    setAvatarUploading(true);
    const storagePath = avatarObjectPath(userId);
    const contentType = file.type || "application/octet-stream";
    try {
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(storagePath, file, { upsert: true, contentType });
      if (upErr) throw upErr;
      const { error: prErr } = await supabase
        .from("profiles")
        .upsert({ id: userId, avatar_url: storagePath });
      if (prErr) throw prErr;
      setAvatarPath(storagePath);
      setAvatarVersion((v) => v + 1);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not upload photo");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function removeAvatar() {
    if (!displayAvatarUrl) return;
    setAvatarUploading(true);
    const pathToRemove =
      avatarPath &&
      !avatarPath.startsWith("http://") &&
      !avatarPath.startsWith("https://")
        ? avatarPath.trim()
        : null;
    try {
      if (pathToRemove) {
        const { error: rmErr } = await supabase.storage
          .from("avatars")
          .remove([pathToRemove]);
        if (rmErr) throw rmErr;
      }
      const { error: prErr } = await supabase
        .from("profiles")
        .upsert({ id: userId, avatar_url: null });
      if (prErr) throw prErr;
      setAvatarPath(null);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not remove photo");
    } finally {
      setAvatarUploading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr_320px]">
      <aside className="space-y-3 rounded-2xl border bg-card p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <ProfileAvatarCircle
            className="h-12 w-12"
            fallbackClassName="text-sm font-bold"
            imageUrl={displayAvatarUrl}
            name={fullName}
            email={email}
          />
          <div>
            <p className="font-bold leading-tight">{fullName}</p>
            <p className="text-xs text-muted-foreground">Level {level}</p>
          </div>
        </div>
        <div className="space-y-2 rounded-xl border bg-muted/30 p-3 text-xs">
          <Label htmlFor="profile-name">Display name</Label>
          <Input
            id="profile-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={saving}
            className="h-9"
          />
          <Button
            type="button"
            size="sm"
            className="w-full rounded-lg"
            disabled={saving}
            onClick={() => void saveName()}
          >
            {saving ? "Saving…" : "Save name"}
          </Button>
        </div>
        <div className="space-y-2 rounded-xl border bg-muted/30 p-3 text-xs">
          <Label>Profile photo</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label="Upload profile photo"
            disabled={avatarUploading}
            onChange={(e) => void onAvatarFileChange(e.target.files)}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="flex-1 rounded-lg"
              disabled={avatarUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="mr-1 h-3.5 w-3.5 shrink-0" />
              {avatarUploading ? "Working…" : "Upload"}
            </Button>
            {displayAvatarUrl ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 rounded-lg px-2"
                disabled={avatarUploading}
                onClick={() => void removeAvatar()}
                title="Remove photo"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only">Remove photo</span>
              </Button>
            ) : null}
          </div>
          <p className="text-[10px] leading-snug text-muted-foreground">
            Images only, up to 2 MB. Replaces your current photo.
          </p>
        </div>
        <nav className="space-y-1 text-sm">
          <Link
            href="/labs"
            className="block rounded-lg px-2 py-2 hover:bg-muted"
          >
            Curriculum
          </Link>
          <Link
            href="/leaderboard"
            className="block rounded-lg px-2 py-2 hover:bg-muted"
          >
            Leaderboard
          </Link>
          <span className="block rounded-lg px-2 py-2 font-semibold text-[#534AB7]">
            Profile
          </span>
        </nav>
      </aside>

      <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-soft">
        <Tabs defaultValue="badges">
          <TabsList className="rounded-2xl">
            <TabsTrigger value="avatars">Avatars</TabsTrigger>
            <TabsTrigger value="frames">Frames</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="titles">Titles</TabsTrigger>
          </TabsList>
          <TabsContent value="badges" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                Your badges ({showUnlockCount})
              </p>
              <Button size="sm" variant="outline" className="rounded-full" asChild>
                <Link href="/achievements">Hall of Fame</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {achievements.map((b) => {
                const Icon = iconForBadge(b.badge_icon);
                return (
                  <motion.button
                    key={b.id}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => toggleShowcase(b.id)}
                    className={`rounded-2xl border p-4 text-center shadow-sm ${
                      showcase.includes(b.id)
                        ? "border-[#534AB7] ring-2 ring-[#534AB7]/30"
                        : "border-muted"
                    }`}
                  >
                    <Icon className="mx-auto h-8 w-8 text-[#534AB7]" />
                    <p className="mt-2 text-xs font-semibold leading-snug">
                      {b.title}
                    </p>
                  </motion.button>
                );
              })}
              <motion.div
                initial={{ opacity: 0.9 }}
                className="rounded-2xl border border-dashed p-4 text-center opacity-60"
              >
                <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-xs font-semibold text-muted-foreground">
                  More badges
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Complete labs &amp; quizzes to unlock
                </p>
              </motion.div>
            </div>
          </TabsContent>
          <TabsContent value="avatars" className="mt-4 space-y-3 text-sm">
            <p className="text-muted-foreground">
              Upload a photo for your profile. It appears in the sidebar and preview,
              and replaces any previous upload.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ProfileAvatarCircle
                className="h-20 w-20 border-2 border-muted"
                fallbackClassName="text-lg font-bold"
                imageUrl={displayAvatarUrl}
                name={fullName}
                email={email}
              />
              <div className="min-w-[200px] flex-1 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="rounded-lg"
                    disabled={avatarUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="mr-1 h-3.5 w-3.5 shrink-0" />
                    {avatarUploading ? "Working…" : "Choose image"}
                  </Button>
                  {displayAvatarUrl ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      disabled={avatarUploading}
                      onClick={() => void removeAvatar()}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5 shrink-0" />
                      Remove
                    </Button>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  Stored securely; only you can change or delete your file.
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="frames" className="mt-4 text-sm text-muted-foreground">
            Frame slots reserved for future seasonal rewards.
          </TabsContent>
          <TabsContent value="titles" className="mt-4 text-sm text-muted-foreground">
            Titles can mirror leaderboard rank — check{" "}
            <Link href="/leaderboard" className="font-semibold text-[#534AB7]">
              The Arena
            </Link>
            .
          </TabsContent>
        </Tabs>
      </section>

      <aside className="space-y-3 rounded-2xl border bg-card p-5 shadow-soft">
        <p className="text-xs font-bold uppercase text-muted-foreground">
          Preview
        </p>
        <div className="rounded-3xl border bg-gradient-to-br from-[#534AB7]/10 to-[#6dd5ed]/20 p-4">
          <div className="h-16 rounded-2xl bg-[#534AB7]/30" />
          <div className="mt-4 flex flex-col items-center">
            <ProfileAvatarCircle
              className="h-16 w-16 border-4 border-white shadow"
              fallbackClassName="text-lg font-bold"
              imageUrl={displayAvatarUrl}
              name={fullName}
              email={email}
            />
            <p className="mt-2 font-bold">{fullName}</p>
            <Badge className="mt-1">Level {level}</Badge>
            <p className="text-xs text-muted-foreground">
              {email ?? "—"}
            </p>
            <div className="mt-3 flex gap-2">
              {showcase.map((id) => {
                const a = achievements.find((x) => x.id === id);
                return (
                  <span
                    key={id}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[10px] font-bold text-[#534AB7]"
                    title={a?.title}
                  >
                    {(a?.title ?? "?").slice(0, 1).toUpperCase()}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-dashed bg-[#F8F7FF] p-4 text-sm text-muted-foreground dark:bg-[#1a1a2e]">
          Tap up to three badges on the left to feature them in your preview strip.
        </div>
        <Button variant="outline" className="w-full rounded-xl" asChild>
          <Link href="/dashboard" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </Button>
      </aside>
    </div>
  );
}
