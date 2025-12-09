"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SidebarNav } from "@/components/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookOpen, Plus, Github, Menu, FileText, FolderOpen, TrendingUp } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <BookOpen className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">IntegrateWise Hub</span>
            </Link>
          </div>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6" />
                <span className="font-bold">IntegrateWise Hub</span>
              </Link>
              <SidebarNav notebooks={notebooks} />
            </SheetContent>
          </Sheet>

          <Link href="/" className="mr-6 flex items-center space-x-2 md:hidden">
            <BookOpen className="h-6 w-6" />
            <span className="font-bold">Hub</span>
          </Link>

          <div className="flex flex-1 items-center justify-end space-x-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Notebook
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Notebook</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Notebook name"
                    value={newNotebookName}
                    onChange={(e) => setNewNotebookName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && createNotebook()}
                  />
                  <Button onClick={createNotebook} className="w-full">
                    Create Notebook
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Link href="https://github.com/integratewise/integratewise-hub" target="_blank">
              <Button variant="ghost" size="icon">
                <Github className="h-5 w-5" />
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container flex-1">
        <div className="flex-1 md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
          {/* Sidebar */}
          <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
            <SidebarNav notebooks={notebooks} />
          </aside>

          {/* Main content */}
          <main className="relative py-6 lg:gap-10 lg:py-8">
            <div className="mx-auto w-full min-w-0">
              {/* Welcome section */}
              <div className="space-y-2 mb-8">
                <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
                  Welcome to IntegrateWise Hub
                </h1>
                <p className="text-lg text-muted-foreground">
                  Your central knowledge base for business documentation, planning, and operations.
                </p>
              </div>

              {/* Stats cards */}
              <div className="grid gap-4 md:grid-cols-3 mb-8">
                <div className="rounded-lg border bg-card p-6">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-muted-foreground">Notebooks</h3>
                  </div>
                  <p className="text-3xl font-bold mt-2">{stats.totalNotebooks}</p>
                </div>
                <div className="rounded-lg border bg-card p-6">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-muted-foreground">Documents</h3>
                  </div>
                  <p className="text-3xl font-bold mt-2">{stats.totalDocs}</p>
                </div>
                <div className="rounded-lg border bg-card p-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-muted-foreground">Progress</h3>
                  </div>
                  <p className="text-3xl font-bold mt-2">{stats.avgProgress}%</p>
                </div>
              </div>

              {/* Quick access */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight">Quick Access</h2>
                <p className="text-muted-foreground">
                  Select a notebook from the sidebar to view its documents, or create a new one to get started.
                </p>

                {loading ? (
                  <p className="text-muted-foreground">Loading notebooks...</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {notebooks.slice(0, 6).map((notebook) => (
                      <Link
                        key={notebook.id}
                        href={`/notebooks/${notebook.id}`}
                        className="group rounded-lg border p-4 hover:border-foreground/20 hover:bg-muted/50 transition-colors"
                      >
                        <h3 className="font-semibold group-hover:underline">{notebook.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notebook.docs_count} documents
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by IntegrateWise. The source code is available on GitHub.
          </p>
        </div>
      </footer>
    </div>
  );
}
