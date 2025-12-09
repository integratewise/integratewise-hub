"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  FileText,
  BookOpen,
  Trash2,
  Edit,
  Save,
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

  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [newDocTitle, setNewDocTitle] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchNotebook();
  }, [id]);

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
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">Notebook not found</p>
        <Link href="/">
          <Button variant="outline">Go back home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold">{notebook.name}</h1>
              <p className="text-sm text-zinc-400">{notebook.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
              {notebook.category}
            </Badge>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Document
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800">
                <DialogHeader>
                  <DialogTitle>Create New Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Document title"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    className="bg-zinc-800 border-zinc-700"
                  />
                  <Button onClick={createDocument} className="w-full">
                    Create Document
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Document List Sidebar */}
        <aside className="w-72 border-r border-zinc-800 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-zinc-400">
                {documents.length} documents
              </span>
              <span className="text-sm text-zinc-400">
                {notebook.progress}% complete
              </span>
            </div>
            <Progress value={notebook.progress} className="h-1 mb-4" />

            <div className="space-y-2">
              {documents.map((doc) => (
                <Card
                  key={doc.id}
                  className={`bg-zinc-900 border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors ${
                    selectedDoc?.id === doc.id ? "border-blue-500" : ""
                  }`}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setEditContent(doc.content || "");
                    setIsEditing(false);
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-zinc-500" />
                        <span className="text-sm truncate">{doc.title}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-zinc-500 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDocument(doc.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {documents.length === 0 && (
                <div className="text-center py-8 text-zinc-500">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No documents yet</p>
                  <p className="text-xs">Create your first document</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Document Content */}
        <main className="flex-1 overflow-y-auto">
          {selectedDoc ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">{selectedDoc.title}</h2>
                <div className="flex gap-2">
                  {isEditing ? (
                    <Button onClick={saveDocument} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
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
                  className="min-h-[500px] bg-zinc-900 border-zinc-800 font-mono text-sm"
                  placeholder="Write your content here..."
                />
              ) : (
                <div className="prose prose-invert max-w-none">
                  {selectedDoc.content ? (
                    <pre className="whitespace-pre-wrap font-sans text-zinc-300">
                      {selectedDoc.content}
                    </pre>
                  ) : (
                    <p className="text-zinc-500 italic">
                      No content yet. Click Edit to add content.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a document to view</p>
                <p className="text-sm">or create a new one</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
