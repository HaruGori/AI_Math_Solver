"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { TagCard } from "@/components/tag-card"
import { tagsApi, problemsApi } from "@/lib/api"
import { Tags } from "lucide-react"

interface TagWithCount {
  tag: string
  count: number
}

export default function TagsPage() {
  const [tagStats, setTagStats] = useState<TagWithCount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTagStats = async () => {
      try {
        setIsLoading(true)
        const [tags, problemsData] = await Promise.all([tagsApi.getTags(), problemsApi.getProblems({ limit: 1000 })])

        const stats = new Map<string, number>()
        problemsData.problems.forEach((problem) => {
          problem.tags.forEach((tag) => {
            stats.set(tag.name, (stats.get(tag.name) || 0) + 1)
          })
        })

        const tagStatsArray = Array.from(stats.entries())
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)

        setTagStats(tagStatsArray)
      } catch (error) {
        console.error("[v0] Error fetching tag stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTagStats()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Tags className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-balance">タグ管理</h1>
            </div>
            <p className="text-muted-foreground text-pretty leading-relaxed">
              すべてのタグと関連する問題数を確認できます。タグをクリックすると、そのタグの問題一覧が表示されます。
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">読み込み中...</p>
            </div>
          ) : tagStats.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">タグがまだありません。問題を追加してタグを作成しましょう。</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tagStats.map(({ tag, count }) => (
                <TagCard key={tag} tag={tag} count={count} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
