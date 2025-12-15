// backend/scripts/generate-embeddings.js
// Chú thích: Script để pre-generate embeddings cho knowledge base
// Chạy: wrangler d1 execute ban-dong-hanh-db --remote --file=generate-embeddings.js
// Hoặc: node backend/scripts/generate-embeddings.js (nếu có local D1)

/**
 * Pre-generate embeddings cho tất cả documents trong knowledge base
 * Script này cần chạy trên Cloudflare Workers environment hoặc với Wrangler
 */

export default {
  async fetch(request, env) {
    try {
      // Get all documents without embeddings
      const docs = await env.ban_dong_hanh_db.prepare(
        'SELECT id, title, content FROM knowledge_base WHERE embedding IS NULL OR embedding = ""'
      ).all();

      if (!docs.results || docs.results.length === 0) {
        return new Response(JSON.stringify({ 
          message: 'All documents already have embeddings',
          count: 0 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const results = [];
      
      for (const doc of docs.results) {
        try {
          // Generate embedding
          const model = '@cf/baai/bge-base-en-v1.5';
          const text = `${doc.title}\n${doc.content}`.slice(0, 512);
          
          const response = await env.AI.run(model, {
            text: [text],
          });
          
          if (response && Array.isArray(response.data) && response.data[0]) {
            const embedding = response.data[0];
            
            // Save to DB
            await env.ban_dong_hanh_db.prepare(
              'UPDATE knowledge_base SET embedding = ?, updated_at = datetime("now") WHERE id = ?'
            ).bind(JSON.stringify(embedding), doc.id).run();
            
            results.push({ id: doc.id, title: doc.title, status: 'success' });
          } else {
            results.push({ id: doc.id, title: doc.title, status: 'failed', error: 'No embedding returned' });
          }
        } catch (error) {
          results.push({ id: doc.id, title: doc.title, status: 'error', error: error.message });
        }
      }

      return new Response(JSON.stringify({
        message: 'Embedding generation completed',
        total: docs.results.length,
        results,
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Failed to generate embeddings',
        message: error.message,
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

