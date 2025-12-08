-- IntegrateWise Hub Database Schema

-- Notebooks (unlimited)
CREATE TABLE IF NOT EXISTS notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'BookOpen',
  category TEXT DEFAULT 'General',
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'not_started',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Documents (per notebook)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_notebook_id ON documents(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_category ON notebooks(category);

-- Insert default notebooks matching NotebookLM structure
INSERT INTO notebooks (name, icon, category, description) VALUES
  ('Compliance & Legal', 'Scale', 'Operations', 'Legal compliance, contracts, and regulatory matters'),
  ('Startup Launch', 'Rocket', 'Projects', 'Launch planning and execution'),
  ('SaaS', 'Code', 'Products', 'SaaS product development and management'),
  ('Professional Services', 'Users', 'Products', 'Consulting and services offerings'),
  ('Digital Presence & IT', 'Globe', 'Tech', 'Website, infrastructure, and IT systems'),
  ('Sales & Growth', 'TrendingUp', 'Business', 'Sales strategy and growth initiatives'),
  ('Customer & Support', 'Heart', 'Operations', 'Customer success and support processes'),
  ('Operations & Compliance', 'Building2', 'Operations', 'Day-to-day operations and compliance'),
  ('Finance', 'DollarSign', 'Business', 'Financial planning and accounting'),
  ('Metrics & Dashboard', 'BarChart3', 'Business', 'KPIs and business metrics'),
  ('Marketing & Brand', 'Megaphone', 'Business', 'Marketing campaigns and brand management'),
  ('Innovation & R&D', 'FlaskConical', 'Projects', 'Research and development initiatives'),
  ('Investor Relations', 'Globe', 'Business', 'Investor communications and fundraising'),
  ('Misc / General Ops', 'Package', 'Operations', 'General operations and miscellaneous'),
  ('Team & Culture', 'Users', 'Operations', 'HR, team building, and company culture')
ON CONFLICT DO NOTHING;
