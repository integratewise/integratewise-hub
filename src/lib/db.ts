import { neon } from '@neondatabase/serverless';

// Database connection - will be set from environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL not set - database features will be unavailable');
}

export const sql = connectionString ? neon(connectionString) : null;

// Types
export interface Notebook {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  category: string;
  progress: number;
  status: string;
  created_at: Date;
  updated_at: Date;
  docs_count?: number;
}

export interface Document {
  id: string;
  notebook_id: string;
  title: string;
  content: string | null;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

// Notebook operations
export async function getNotebooks(): Promise<Notebook[]> {
  if (!sql) return [];

  const result = await sql`
    SELECT
      n.*,
      COALESCE(COUNT(d.id), 0)::int as docs_count
    FROM notebooks n
    LEFT JOIN documents d ON d.notebook_id = n.id
    GROUP BY n.id
    ORDER BY n.category, n.name
  `;
  return result as Notebook[];
}

export async function getNotebook(id: string): Promise<Notebook | null> {
  if (!sql) return null;

  const result = await sql`
    SELECT
      n.*,
      COALESCE(COUNT(d.id), 0)::int as docs_count
    FROM notebooks n
    LEFT JOIN documents d ON d.notebook_id = n.id
    WHERE n.id = ${id}
    GROUP BY n.id
  `;
  return result[0] as Notebook || null;
}

export async function createNotebook(data: { name: string; description?: string; icon?: string; category?: string }): Promise<Notebook> {
  if (!sql) throw new Error('Database not configured');

  const result = await sql`
    INSERT INTO notebooks (name, description, icon, category)
    VALUES (${data.name}, ${data.description || null}, ${data.icon || 'BookOpen'}, ${data.category || 'General'})
    RETURNING *
  `;
  return result[0] as Notebook;
}

export async function updateNotebook(id: string, data: Partial<Notebook>): Promise<Notebook | null> {
  if (!sql) throw new Error('Database not configured');

  const result = await sql`
    UPDATE notebooks
    SET
      name = COALESCE(${data.name || null}, name),
      description = COALESCE(${data.description || null}, description),
      icon = COALESCE(${data.icon || null}, icon),
      category = COALESCE(${data.category || null}, category),
      progress = COALESCE(${data.progress ?? null}, progress),
      status = COALESCE(${data.status || null}, status),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] as Notebook || null;
}

export async function deleteNotebook(id: string): Promise<boolean> {
  if (!sql) throw new Error('Database not configured');

  const result = await sql`DELETE FROM notebooks WHERE id = ${id} RETURNING id`;
  return result.length > 0;
}

// Document operations
export async function getDocuments(notebookId: string): Promise<Document[]> {
  if (!sql) return [];

  const result = await sql`
    SELECT * FROM documents
    WHERE notebook_id = ${notebookId}
    ORDER BY order_index, created_at
  `;
  return result as Document[];
}

export async function getDocument(id: string): Promise<Document | null> {
  if (!sql) return null;

  const result = await sql`SELECT * FROM documents WHERE id = ${id}`;
  return result[0] as Document || null;
}

export async function createDocument(data: { notebook_id: string; title: string; content?: string }): Promise<Document> {
  if (!sql) throw new Error('Database not configured');

  const result = await sql`
    INSERT INTO documents (notebook_id, title, content)
    VALUES (${data.notebook_id}, ${data.title}, ${data.content || null})
    RETURNING *
  `;

  // Update notebook progress
  await updateNotebookProgress(data.notebook_id);

  return result[0] as Document;
}

export async function updateDocument(id: string, data: Partial<Document>): Promise<Document | null> {
  if (!sql) throw new Error('Database not configured');

  const result = await sql`
    UPDATE documents
    SET
      title = COALESCE(${data.title || null}, title),
      content = COALESCE(${data.content || null}, content),
      order_index = COALESCE(${data.order_index ?? null}, order_index),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] as Document || null;
}

export async function deleteDocument(id: string): Promise<boolean> {
  if (!sql) throw new Error('Database not configured');

  // Get notebook_id before deleting
  const doc = await getDocument(id);
  if (!doc) return false;

  const result = await sql`DELETE FROM documents WHERE id = ${id} RETURNING id`;

  // Update notebook progress
  if (result.length > 0) {
    await updateNotebookProgress(doc.notebook_id);
  }

  return result.length > 0;
}

// Helper to update notebook progress based on document count
async function updateNotebookProgress(notebookId: string): Promise<void> {
  if (!sql) return;

  // Simple progress calculation: 10% per document, max 100%
  await sql`
    UPDATE notebooks
    SET
      progress = LEAST(100, (SELECT COUNT(*) * 10 FROM documents WHERE notebook_id = ${notebookId})),
      status = CASE
        WHEN (SELECT COUNT(*) FROM documents WHERE notebook_id = ${notebookId}) = 0 THEN 'not_started'
        WHEN (SELECT COUNT(*) FROM documents WHERE notebook_id = ${notebookId}) >= 10 THEN 'completed'
        ELSE 'in_progress'
      END,
      updated_at = NOW()
    WHERE id = ${notebookId}
  `;
}

// Stats
export async function getStats(): Promise<{ totalNotebooks: number; totalDocs: number; avgProgress: number }> {
  if (!sql) return { totalNotebooks: 0, totalDocs: 0, avgProgress: 0 };

  const result = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM notebooks) as total_notebooks,
      (SELECT COUNT(*)::int FROM documents) as total_docs,
      (SELECT COALESCE(AVG(progress), 0)::int FROM notebooks) as avg_progress
  `;

  return {
    totalNotebooks: result[0].total_notebooks,
    totalDocs: result[0].total_docs,
    avgProgress: result[0].avg_progress
  };
}
