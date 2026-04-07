import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "通勤时间规划工具",
  description: "实时计算通勤时间，智能推荐最优方案",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
