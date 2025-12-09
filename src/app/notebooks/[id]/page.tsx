"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SidebarNav } from "@/components/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  BookOpen,
  Plus,
  Github,
  Menu,
  FileText,
  Trash2,
  Edit,
  Save,
  ChevronRight,
} from "lucide-react";

interface Document {
  id: string;
  notebook_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

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

export default function NotebookPage() {
  const params = useParams();
  const id = params.id as string;

  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [newDocTitle, setNewDocTitle] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchAllNotebooks();
    fetchNotebook();
  }, [id]);

  async function fetchAllNotebooks() {
    try {
      const res = await fetch("/api/notebooks");
      if (res.ok) {
        const data = await res.json();
        setNotebooks(data.notebooks);
      }
    } catch (error) {
      console.error("Failed to fetch notebooks:", error);
    }
  }

  async function fetchNotebook() {
    try {
      const res = await fetch(`/api/notebooks/${id}`);
      if (res.ok) {
        const data = await res.json();
        setNotebook(data.notebook);
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error("Failed to fetch notebook:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createDocument() {
    if (!newDocTitle.trim()) return;

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notebook_id: id, title: newDocTitle }),
      });

      if (res.ok) {
        setNewDocTitle("");
        setDialogOpen(false);
        fetchNotebook();
        fetchAllNotebooks();
      }
    } catch (error) {
      console.error("Failed to create document:", error);
    }
  }

  async function saveDocument() {
    if (!selectedDoc) return;

    try {
      const res = await fetch(`/api/documents/${selectedDoc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });

      if (res.ok) {
        setIsEditing(false);
        setSelectedDoc({ ...selectedDoc, content: editContent });
        fetchNotebook();
      }
    } catch (error) {
      console.error("Failed to save document:", error);
    }
  }

  async function deleteDocument(docId: string) {
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedDoc?.id === docId) {
          setSelectedDoc(null);
        }
        fetchNotebook();
        fetchAllNotebooks();
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Notebook not found</p>
        <Link href="/">
          <Button>Go back home</Button>
        </Link>
      </div>
    );
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
                  New Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Document title"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && createDocument()}
                  />
                  <Button onClick={createDocument} className="w-full">
                    Create Document
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
          <main className="relative py-6 lg:py-8">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{notebook.name}</span>
            </div>

            {/* Notebook title */}
            <div className="space-y-2 mb-6">
              <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">
                {notebook.name}
              </h1>
              {notebook.description && (
                <p className="text-lg text-muted-foreground">{notebook.description}</p>
              )}
            </div>

            {/* Document list and content */}
            <div className="grid md:grid-cols-[280px_1fr] gap-6">
              {/* Document list */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Documents</h2>
                  <span className="text-sm text-muted-foreground">{documents.length}</span>
                </div>

                <ScrollArea className="h-[calc(100vh-320px)]">
                  <div className="space-y-2 pr-4">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className={`group flex items-center justify-between rounded-md border p-3 cursor-pointer transition-colors ${
                          selectedDoc?.id === doc.id
                            ? "border-foreground/20 bg-muted"
                            : "hover:border-foreground/10 hover:bg-muted/50"
                        }`}
                        onClick={() => {
                          setSelectedDoc(doc);
                          setEditContent(doc.content || "");
                          setIsEditing(false);
                        }}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="truncate text-sm">{doc.title}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDocument(doc.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}

                    {documents.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No documents yet</p>
                        <p className="text-xs">Create your first document</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Document content */}
              <div className="rounded-lg border bg-card min-h-[500px]">
                {selectedDoc ? (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold">{selectedDoc.title}</h2>
                      <div className="flex gap-2">
                        {isEditing ? (
                          <Button onClick={saveDocument} size="sm">
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                        ) : (
                          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[400px] font-mono text-sm"
                        placeholder="Write your content here..."
                      />
                    ) : (
                      <div className="prose dark:prose-invert max-w-none">
                        {selectedDoc.content ? (
                          <pre className="whitespace-pre-wrap font-sans text-sm">
                            {selectedDoc.content}
                          </pre>
                        ) : (
                          <p className="text-muted-foreground italic">
                            No content yet. Click Edit to add content.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Select a document to view</p>
                      <p className="text-sm">or create a new one</p>
                    </div>
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
