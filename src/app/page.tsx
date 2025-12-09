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

// Category color mapping
const categoryColors: Record<string, string> = {
  Business: "bg-[#0176d3] text-white",
  Operations: "bg-[#8b5fd6] text-white",
  Projects: "bg-[#28a745] text-white",
  Products: "bg-[#1589ee] text-white",
  Tech: "bg-[#ffc107] text-[#181818]",
  General: "bg-[#5c5c5c] text-white",
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
    <div className="min-h-screen bg-gradient-to-br from-[#f4f7ff] to-[#faf8ff]">
      {/* Header */}
      <header className="border-b border-[#e5e7eb] bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0176d3] to-[#8b5fd6] flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-[#181818]">IntegrateWise Hub</h1>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#0176d3] to-[#8b5fd6] hover:from-[#015ba8] hover:to-[#7248b8] text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Notebook
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-[#e5e7eb]">
              <DialogHeader>
                <DialogTitle className="text-[#181818]">Create New Notebook</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Notebook name"
                  value={newNotebookName}
                  onChange={(e) => setNewNotebookName(e.target.value)}
                  className="border-[#e5e7eb] focus:ring-[#0176d3]"
                />
                <Button onClick={createNotebook} className="w-full bg-[#0176d3] hover:bg-[#015ba8] text-white">
                  Create Notebook
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white border-[#e5e7eb] shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#5c5c5c]">Total Notebooks</CardDescription>
              <CardTitle className="text-3xl text-[#0176d3]">{stats.totalNotebooks}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white border-[#e5e7eb] shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#5c5c5c]">Total Documents</CardDescription>
              <CardTitle className="text-3xl text-[#8b5fd6]">{stats.totalDocs}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white border-[#e5e7eb] shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#5c5c5c]">Overall Progress</CardDescription>
              <CardTitle className="text-3xl text-[#28a745]">{stats.avgProgress}%</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={stats.avgProgress} className="h-2 bg-[#e5e7eb]" />
            </CardContent>
          </Card>
        </div>

        {/* Notebooks Grid */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#181818] mb-4">Notebooks</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-[#5c5c5c]">Loading notebooks...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* New Notebook Card */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Card className="bg-white/50 border-[#e5e7eb] border-dashed hover:bg-white hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center h-40">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0176d3]/20 to-[#8b5fd6]/20 flex items-center justify-center mb-3">
                      <Plus className="h-6 w-6 text-[#0176d3]" />
                    </div>
                    <p className="text-[#5c5c5c]">Create new notebook</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
            </Dialog>

            {/* Notebook Cards */}
            {notebooks.map((notebook) => {
              const Icon = iconMap[notebook.icon] || BookOpen;
              const badgeColor = categoryColors[notebook.category] || categoryColors.General;
              return (
                <Link href={`/notebooks/${notebook.id}`} key={notebook.id}>
                  <Card className="bg-white border-[#e5e7eb] hover:shadow-lg hover:border-[#0176d3]/30 transition-all cursor-pointer h-40">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0176d3]/20 to-[#8b5fd6]/20 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-[#0176d3]" />
                        </div>
                        <Badge className={`${badgeColor} text-xs`}>
                          {notebook.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-base mt-3 text-[#181818]">{notebook.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-[#5c5c5c]">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {notebook.docs_count} docs
                        </span>
                        <span>{notebook.progress}%</span>
                      </div>
                      <Progress value={notebook.progress} className="h-1 mt-2 bg-[#e5e7eb]" />
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
