// app/api/update/route.ts
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

const VERCEL_AI_GATEWAY_BASE_URL = 'https://ai-gateway.vercel.sh/v1';

async function fetchVercelAIModels() {
  const apiKey = process.env.VERCEL_AI_GATEWAY_API_KEY;
  if (!apiKey) {
    // APIキーがない場合はエラー
    throw new Error('VERCEL_AI_GATEWAY_API_KEYが設定されていません。'); 
  }

  const response = await fetch(`${VERCEL_AI_GATEWAY_BASE_URL}/models`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Vercel AIモデルの取得に失敗しました: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.data; // モデルの配列
}

async function updateDatabase(models: any[]) {
  const client = await sql.connect();
  
  try {
    // 既存モデルの availability を一旦全てFALSEにする
    await client.query('UPDATE models SET is_available = FALSE');

    for (const model of models) {
      const provider_name = model.id.split('/')[0] || 'unknown';
      
      const upsertQuery = `
        INSERT INTO models (provider_name, model_id, description, is_available)
        VALUES ($1, $2, $3, TRUE)
        ON CONFLICT (model_id)
        DO UPDATE SET 
          provider_name = $1, 
          description = $3, 
          is_available = TRUE, 
          updated_at = NOW();
      `;

      await client.query(upsertQuery, [
        provider_name, 
        model.id, 
        model.description || 'No description provided'
      ]);
    }
    await client.query('COMMIT'); 
  } catch (error) {
    await client.query('ROLLBACK');
    throw error; 
  } finally {
    client.release();
  }
}

export async function POST() {
  try {
    const rawModels = await fetchVercelAIModels();
    await updateDatabase(rawModels);

    return NextResponse.json({ 
      success: true, 
      message: 'モデルリストの更新が成功しました。',
      count: rawModels.length 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'モデルリストの更新に失敗しました。', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}
