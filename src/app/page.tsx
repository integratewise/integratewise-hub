"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Plus,
  FileText,
  Scale,
  Rocket,
  Code,
  Users,
  Globe,
  TrendingUp,
  Heart,
  Building2,
  DollarSign,
  BarChart3,
  Megaphone,
  FlaskConical,
  Package,
  LucideIcon,
} from "lucide-react";

interface Notebook {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  category: string;
  progress: number;
  status: string;
  docs_count: number;
}

interface Stats {
  totalNotebooks: number;
  totalDocs: number;
  avgProgress: number;
}

const iconMap: Record<string, LucideIcon> = {
  Scale,
  Rocket,
  Code,
  Users,
  Globe,
  TrendingUp,
  Heart,
  Building2,
  DollarSign,
  BarChart3,
  Megaphone,
  FlaskConical,
  Package,
  BookOpen,
};

export default function Home() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [stats, setStats] = useState<Stats>({ totalNotebooks: 0, totalDocs: 0, avgProgress: 0 });
  const [loading, setLoading] = useState(true);
  const [newNotebookName, setNewNotebookName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchNotebooks();
  }, []);

  async function fetchNotebooks() {
    try {
      const res = await fetch("/api/notebooks");
      if (res.ok) {
        const data = await res.json();
        setNotebooks(data.notebooks);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch notebooks:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createNotebook() {
    if (!newNotebookName.trim()) return;

    try {
      const res = await fetch("/api/notebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newNotebookName }),
      });

      if (res.ok) {
        setNewNotebookName("");
        setDialogOpen(false);
        fetchNotebooks();
      }
    } catch (error) {
      console.error("Failed to create notebook:", error);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <h1 className="text-xl font-semibold">IntegrateWise Hub</h1>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-zinc-700 text-white hover:bg-zinc-800">
                <Plus className="h-4 w-4 mr-2" />
                New Notebook
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle>Create New Notebook</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Notebook name"
                  value={newNotebookName}
                  onChange={(e) => setNewNotebookName(e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                />
                <Button onClick={createNotebook} className="w-full">
                  Create Notebook
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardDescription>Total Notebooks</CardDescription>
              <CardTitle className="text-3xl">{stats.totalNotebooks}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardDescription>Total Documents</CardDescription>
              <CardTitle className="text-3xl">{stats.totalDocs}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardDescription>Overall Progress</CardDescription>
              <CardTitle className="text-3xl">{stats.avgProgress}%</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={stats.avgProgress} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Notebooks Grid */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-4">Notebooks</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-zinc-400">Loading notebooks...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* New Notebook Card */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Card className="bg-zinc-900/50 border-zinc-800 border-dashed hover:bg-zinc-900 transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center h-40">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                      <Plus className="h-6 w-6 text-zinc-400" />
                    </div>
                    <p className="text-zinc-400">Create new notebook</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
            </Dialog>

            {/* Notebook Cards */}
            {notebooks.map((notebook) => {
              const Icon = iconMap[notebook.icon] || BookOpen;
              return (
                <Link href={`/notebooks/${notebook.id}`} key={notebook.id}>
                  <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer h-40">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-amber-500" />
                        </div>
                        <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-xs">
                          {notebook.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-base mt-3">{notebook.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-zinc-400">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {notebook.docs_count} docs
                        </span>
                        <span>{notebook.progress}%</span>
                      </div>
                      <Progress value={notebook.progress} className="h-1 mt-2" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
