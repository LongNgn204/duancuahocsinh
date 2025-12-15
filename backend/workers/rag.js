// backend/workers/rag.js
// Chú thích: RAG (Retrieval-Augmented Generation) implementation
// Hybrid search: BM25 (keyword) + Dense embeddings (semantic)
// Sử dụng Cloudflare Workers AI cho embeddings
// Embeddings được cache trong DB để tối ưu performance

/**
 * Simple BM25 scoring (keyword-based search)
 * @param {string} query - Search query
 * @param {Array} documents - Array of {id, content, ...}
 * @returns {Array} Scored documents
 */
export function bm25Search(query, documents) {
  if (!query || !documents || documents.length === 0) {
    return [];
  }

  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
  if (queryTerms.length === 0) return [];

  // Simple TF-IDF scoring
  const scores = documents.map(doc => {
    const content = (doc.content || '').toLowerCase();
    let score = 0;

    for (const term of queryTerms) {
      const termFreq = (content.match(new RegExp(term, 'g')) || []).length;
      if (termFreq > 0) {
        // Simple scoring: term frequency * inverse document frequency
        const docFreq = documents.filter(d => 
          (d.content || '').toLowerCase().includes(term)
        ).length;
        const idf = Math.log(documents.length / (docFreq + 1));
        score += termFreq * idf;
      }
    }

    return { ...doc, bm25_score: score };
  });

  // Sort by score descending
  return scores
    .filter(d => d.bm25_score > 0)
    .sort((a, b) => b.bm25_score - a.bm25_score)
    .slice(0, 10); // Top 10
}

/**
 * Generate embeddings using Workers AI
 * @param {Object} env - Cloudflare env với AI binding
 * @param {string} text - Text to embed
 * @returns {Promise<Float32Array>} Embedding vector
 */
export async function generateEmbedding(env, text) {
  if (!text || !env.AI) {
    return null;
  }

  try {
    // Sử dụng Workers AI embedding model
    // Note: Cloudflare có thể không có embedding model, dùng fallback
    const result = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
      text: [text],
    });

    return result.data?.[0] || null;
  } catch (error) {
    console.error('[RAG] Embedding error:', error.message);
    // Fallback: return null, sẽ dùng BM25 only
    return null;
  }
}

/**
 * Cosine similarity between two vectors
 * @param {Float32Array|Array} a 
 * @param {Float32Array|Array} b 
 * @returns {number} Similarity score (0-1)
 */
export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator > 0 ? dotProduct / denominator : 0;
}

/**
 * Hybrid search: Combine BM25 + Dense embeddings
 * @param {string} query - Search query
 * @param {Array} documents - Array of {id, content, embedding?, ...}
 * @param {Object} env - Cloudflare env
 * @param {Object} options - {bm25Weight: 0.5, denseWeight: 0.5, topK: 5}
 * @returns {Promise<Array>} Reranked documents
 */
export async function hybridSearch(query, documents, env, options = {}) {
  const {
    bm25Weight = 0.5,
    denseWeight = 0.5,
    topK = 5,
  } = options;

  // BM25 search
  const bm25Results = bm25Search(query, documents);
  const bm25MaxScore = bm25Results[0]?.bm25_score || 1;

  // Normalize BM25 scores
  const bm25Normalized = bm25Results.reduce((acc, doc) => {
    acc[doc.id] = (doc.bm25_score / bm25MaxScore) * bm25Weight;
    return acc;
  }, {});

  // Dense search (nếu có embeddings) - với caching
  let denseScores = {};
  try {
    const queryEmbedding = await generateEmbedding(env, query); // Query embedding không cache
    
    if (queryEmbedding) {
      for (const doc of documents) {
        // Try to get cached embedding from DB
        let docEmbedding = null;
        if (doc.id && env.ban_dong_hanh_db) {
          try {
            const cached = await env.ban_dong_hanh_db.prepare(
              'SELECT embedding FROM knowledge_base WHERE id = ? AND embedding IS NOT NULL AND embedding != ""'
            ).bind(doc.id).first();
            
            if (cached?.embedding) {
              try {
                docEmbedding = JSON.parse(cached.embedding);
              } catch (_) {
                // Invalid JSON, generate new
              }
            }
          } catch (_) {
            // DB error, continue
          }
        }
        
        // Generate embedding if not cached (và cache nó)
        if (!docEmbedding) {
          docEmbedding = await generateEmbedding(env, doc.content, doc.id);
        }
        
        if (docEmbedding) {
          const similarity = cosineSimilarity(queryEmbedding, docEmbedding);
          denseScores[doc.id] = similarity * denseWeight;
        }
      }
    }
  } catch (error) {
    console.warn('[RAG] Dense search failed, using BM25 only:', error.message);
  }

  // Combine scores
  const combinedScores = {};
  const allDocIds = new Set([
    ...Object.keys(bm25Normalized),
    ...Object.keys(denseScores),
  ]);

  for (const docId of allDocIds) {
    combinedScores[docId] = (bm25Normalized[docId] || 0) + (denseScores[docId] || 0);
  }

  // Get top K documents
  const topDocs = documents
    .filter(doc => combinedScores[doc.id] !== undefined)
    .map(doc => ({
      ...doc,
      relevance_score: combinedScores[doc.id],
    }))
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, topK);

  return topDocs;
}

/**
 * Rerank results using LLM (optional, tốn token)
 * @param {string} query 
 * @param {Array} documents 
 * @param {Object} env 
 * @returns {Promise<Array>} Reranked documents
 */
export async function rerankResults(query, documents, env) {
  if (documents.length === 0) return [];

  // Simple rerank: sử dụng LLM để đánh giá relevance
  // Note: Có thể skip để tiết kiệm token, chỉ dùng hybrid search
  try {
    const prompt = `Đánh giá mức độ liên quan của các tài liệu sau với câu hỏi "${query}".

Tài liệu:
${documents.map((d, i) => `${i + 1}. ${d.content?.slice(0, 200)}`).join('\n')}

Trả về JSON array với thứ tự từ liên quan nhất đến ít liên quan nhất: [1, 3, 2, ...]`;

    const result = await env.AI.run(env.MODEL || '@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: 'Bạn là chuyên gia đánh giá mức độ liên quan. Trả về JSON array.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 100,
    });

    // Parse rerank order (simplified)
    const rerankOrder = JSON.parse(result.response || '[]');
    if (Array.isArray(rerankOrder)) {
      return rerankOrder.map(idx => documents[idx - 1]).filter(Boolean);
    }
  } catch (error) {
    console.warn('[RAG] Rerank failed, using original order:', error.message);
  }

  // Fallback: return original order
  return documents;
}

/**
 * Format RAG context for LLM prompt
 * @param {Array} retrievedDocs - Documents từ hybrid search
 * @returns {string} Formatted context
 */
export function formatRAGContext(retrievedDocs) {
  if (!retrievedDocs || retrievedDocs.length === 0) {
    return '';
  }

  const contextParts = retrievedDocs.map((doc, i) => {
    const content = doc.content || '';
    const source = doc.source || 'tài liệu';
    return `[${i + 1}] ${content.slice(0, 300)}${content.length > 300 ? '...' : ''} (Nguồn: ${source})`;
  });

  return `\n\n[NGỮ CẢNH TỪ TÀI LIỆU]\n${contextParts.join('\n\n')}\n\nLưu ý: Sử dụng thông tin trên để trả lời, nhưng nếu không chắc chắn thì nói rõ.`;
}

