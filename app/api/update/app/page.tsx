// app/page.tsx
import { sql } from '@vercel/postgres';

// データベースからデータを取得する関数
async function getLatestModels() {
  const { rows } = await sql`
    SELECT provider_name, model_id, description, updated_at
    FROM models 
    WHERE is_available = TRUE
    ORDER BY provider_name, model_id;
  `;
  return rows;
}

export default async function DashboardPage() {
  const models = await getLatestModels();

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>📊 自動更新モデル一覧ダッシュボード</h1>
      <p>このデータはVercel Cron Jobsにより週次で自動更新されます。</p>
      {models.length > 0 && (
        <p>最終データ更新: {new Date(models[0].updated_at).toLocaleString()}</p>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead style={{ backgroundColor: '#f2f2f2' }}>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>プロバイダー</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>モデルID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>説明</th>
          </tr>
        </thead>
        <tbody>
          {models.map((model) => (
            <tr key={model.model_id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <strong>{model.provider_name.toUpperCase()}</strong>
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{model.model_id}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{model.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
