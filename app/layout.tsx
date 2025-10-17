// app/layout.tsx

import React from 'react';

// Next.jsの基本的なルートレイアウトを定義
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      {/* <head>タグの中身はNext.jsが自動で処理します */}
      <body>
        {/* {children} の部分に app/page.tsx の内容（ダッシュボード）が入ります */}
        {children}
      </body>
    </html>
  );
}
