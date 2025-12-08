const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_5xmkIN7heWAK@ep-soft-firefly-a2lt04cj.eu-west-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

async function setupDatabase() {
  console.log('Setting up Hub database tables...');

  try {
    // Create notebooks table
    await sql`
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
      )
    `;
    console.log('✓ Created notebooks table');

    // Create documents table
    await sql`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ Created documents table');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_documents_notebook_id ON documents(notebook_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notebooks_category ON notebooks(category)`;
    console.log('✓ Created indexes');

    // Check if notebooks already exist
    const existing = await sql`SELECT COUNT(*) as count FROM notebooks`;
    if (existing[0].count === '0' || existing[0].count === 0) {
      // Insert default notebooks
      await sql`
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
      `;
      console.log('✓ Inserted 15 default notebooks');
    } else {
      console.log('✓ Notebooks already exist, skipping seed data');
    }

    // Verify
    const notebooks = await sql`SELECT COUNT(*) as count FROM notebooks`;
    console.log(`\n✅ Database setup complete! ${notebooks[0].count} notebooks ready.`);

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();
