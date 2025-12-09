"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
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

// Category color mapping
const categoryColors: Record<string, string> = {
  Business: "bg-[#0176d3] text-white",
  Operations: "bg-[#8b5fd6] text-white",
  Projects: "bg-[#28a745] text-white",
  Products: "bg-[#1589ee] text-white",
  Tech: "bg-[#ffc107] text-[#181818]",
  General: "bg-[#5c5c5c] text-white",
};

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
      <div className="min-h-screen bg-gradient-to-br from-[#f4f7ff] to-[#faf8ff] flex items-center justify-center">
        <p className="text-[#5c5c5c]">Loading...</p>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4f7ff] to-[#faf8ff] flex flex-col items-center justify-center gap-4">
        <p className="text-[#5c5c5c]">Notebook not found</p>
        <Link href="/">
          <Button className="bg-[#0176d3] hover:bg-[#015ba8] text-white">Go back home</Button>
        </Link>
      </div>
    );
  }

  const badgeColor = categoryColors[notebook.category] || categoryColors.General;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f7ff] to-[#faf8ff]">
      {/* Header */}
      <header className="border-b border-[#e5e7eb] bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-[#5c5c5c] hover:text-[#181818] hover:bg-[#f3f4f6]">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-[#181818]">{notebook.name}</h1>
              <p className="text-sm text-[#5c5c5c]">{notebook.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${badgeColor} text-xs`}>
              {notebook.category}
            </Badge>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#0176d3] to-[#8b5fd6] hover:from-[#015ba8] hover:to-[#7248b8] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  New Document
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-[#e5e7eb]">
                <DialogHeader>
                  <DialogTitle className="text-[#181818]">Create New Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Document title"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    className="border-[#e5e7eb] focus:ring-[#0176d3]"
                  />
                  <Button onClick={createDocument} className="w-full bg-[#0176d3] hover:bg-[#015ba8] text-white">
                    Create Document
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)] max-w-7xl mx-auto">
        {/* Document List Sidebar */}
        <aside className="w-72 border-r border-[#e5e7eb] bg-white overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#5c5c5c]">
                {documents.length} documents
              </span>
              <span className="text-sm text-[#5c5c5c]">
                {notebook.progress}% complete
              </span>
            </div>
            <Progress value={notebook.progress} className="h-1 mb-4 bg-[#e5e7eb]" />

            <div className="space-y-2">
              {documents.map((doc) => (
                <Card
                  key={doc.id}
                  className={`bg-[#fafbfc] border-[#e5e7eb] cursor-pointer hover:shadow-md hover:border-[#0176d3]/30 transition-all ${
                    selectedDoc?.id === doc.id ? "border-[#0176d3] bg-[#f4f7ff]" : ""
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
                        <FileText className="h-4 w-4 text-[#0176d3]" />
                        <span className="text-sm text-[#181818] truncate">{doc.title}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-[#5c5c5c] hover:text-[#dc3545] hover:bg-[#dc3545]/10"
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
                <div className="text-center py-8 text-[#5c5c5c]">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No documents yet</p>
                  <p className="text-xs">Create your first document</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Document Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          {selectedDoc ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[#181818]">{selectedDoc.title}</h2>
                <div className="flex gap-2">
                  {isEditing ? (
                    <Button onClick={saveDocument} className="bg-[#28a745] hover:bg-[#218838] text-white">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-[#0176d3] hover:bg-[#015ba8] text-white"
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
                  className="min-h-[500px] border-[#e5e7eb] font-mono text-sm text-[#181818] focus:ring-[#0176d3]"
                  placeholder="Write your content here..."
                />
              ) : (
                <div className="prose max-w-none">
                  {selectedDoc.content ? (
                    <pre className="whitespace-pre-wrap font-sans text-[#181818] bg-[#fafbfc] p-4 rounded-lg border border-[#e5e7eb]">
                      {selectedDoc.content}
                    </pre>
                  ) : (
                    <p className="text-[#5c5c5c] italic">
                      No content yet. Click Edit to add content.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[#5c5c5c]">
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
