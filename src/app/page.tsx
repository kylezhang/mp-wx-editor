import { Suspense } from 'react'
import { Metadata } from 'next'
import App from './post/App'
import Loading from '@/components/Loading'

export const metadata: Metadata = {
  title: '公众号排版编辑器',
}

// 首页即编辑器：纯本地模式，文档保存在浏览器 localStorage
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <App />
    </Suspense>
  )
}
