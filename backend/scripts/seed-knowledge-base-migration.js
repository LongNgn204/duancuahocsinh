// backend/scripts/seed-knowledge-base-migration.js
// Chú thích: Script để generate SQL migration cho knowledge base
// Chạy: node backend/scripts/seed-knowledge-base-migration.js > migrations/seed-kb.sql

import { knowledgeBase } from './seed-knowledge-base.js';

console.log('-- Migration: Seed Knowledge Base');
console.log('-- Generated:', new Date().toISOString());
console.log('');
console.log('BEGIN TRANSACTION;');
console.log('');

knowledgeBase.forEach((kb, idx) => {
  const title = kb.title.replace(/'/g, "''");
  const content = kb.content.replace(/'/g, "''");
  const tags = kb.tags || '[]';
  
  console.log(`INSERT INTO knowledge_base (title, content, category, tags, source, created_at, updated_at)`);
  console.log(`VALUES (`);
  console.log(`  '${title}',`);
  console.log(`  '${content}',`);
  console.log(`  '${kb.category}',`);
  console.log(`  '${tags}',`);
  console.log(`  '${kb.source}',`);
  console.log(`  datetime('now'),`);
  console.log(`  datetime('now')`);
  console.log(`);`);
  console.log('');
});

console.log('COMMIT;');
console.log('');
console.log('-- Note: Embeddings sẽ được generate tự động khi RAG search lần đầu');
console.log('-- Hoặc có thể chạy script generate-embeddings.js để pre-generate');

