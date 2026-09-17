'use client'

import { useState, useEffect } from 'react'
import { sizeToObject } from '@/utils/size'
import { useSearchParams } from 'next/navigation'
import { getDefaultContent } from '@/utils/getDefaultContent'
import dynamic from 'next/dynamic'
import Loading from '@/components/Loading'
const Pen = dynamic(() => import('@/components/Pen'), {
  ssr: false,
})

interface Post {
  _id: string
  css: string
  config: string
  title: string
  author_id: string
  html: string
}

// 纯本地模式：固定使用 demo 身份，Pen 组件据此走 localStorage 读写分支，
// 不再依赖已停服的后端（mdx-api.maqib.cn）。
const LOCAL_ID = 'demo'

const LOCAL_DEFAULTS = {
  _id: LOCAL_ID,
  title: '未命名文章',
  author_id: LOCAL_ID,
}

export default function App() {
  const [initialContent, setInitialContent] = useState<Post | null>(null)
  const searchParams = useSearchParams()
  const layout = searchParams.get('layout')
  const size = searchParams.get('size')
  const file = searchParams.get('file')

  useEffect(() => {
    const loadLocalContent = async () => {
      // 1) 优先恢复浏览器里已保存的草稿
      const saved = localStorage.getItem('content')
      if (saved) {
        try {
          setInitialContent({ ...LOCAL_DEFAULTS, ...JSON.parse(saved) })
          return
        } catch (error) {
          console.warn('本地草稿解析失败，回退到默认文档', error)
        }
      }
      // 2) 没有草稿时，复用项目自带的默认文档（getDefaultContent）
      // 注：raw-loader 导入的 .md 会被 TS 推断成 MDX 组件类型，运行时实际是字符串，用 String() 归一
      const defaults = await getDefaultContent()
      setInitialContent({
        ...LOCAL_DEFAULTS,
        html: String(defaults.html),
        css: String(defaults.css),
        config: String(defaults.config),
      })
    }
    loadLocalContent()
  }, [])

  const layoutProps = {
    initialLayout: ['vertical', 'horizontal', 'preview'].includes(
      layout as string
    )
      ? layout
      : 'vertical',
    initialResponsiveSize: sizeToObject(size),
    initialActiveTab: ['html', 'css', 'config'].includes(file as string)
      ? file
      : 'html',
  }

  if (!initialContent) {
    return <Loading />
  }

  return <Pen {...layoutProps} id={LOCAL_ID} initialContent={initialContent} />
}
