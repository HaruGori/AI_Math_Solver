"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/header"
import { ProblemCard } from "@/components/problem-card"
import { ProblemFilters } from "@/components/problem-filters"
import { problemsApi, tagsApi, type Problem } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function ProblemsPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [problems, setProblems] = useState<Problem[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const tagParam = searchParams.get("tag")
    if (tagParam) {
      setSelectedTag(tagParam)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [problemsData, tagsData] = await Promise.all([problemsApi.getProblems({ limit: 100 }), tagsApi.getTags()])
        setProblems(problemsData.problems)
        setAvailableTags(tagsData.map((tag) => tag.name))
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDeleteProblem = async (id: number) => {
    try {
      await problemsApi.deleteProblem(id)
      setProblems((prevProblems) => prevProblems.filter((p) => p.id !== id))
      toast({
        title: "問題を削除しました",
      })
    } catch (error) {
      console.error("[v0] Error deleting problem:", error)
      toast({
        title: "エラーが発生しました",
        description: "問題の削除に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const matchesSearch =
        search === "" ||
        problem.title.toLowerCase().includes(search.toLowerCase()) ||
        problem.content.toLowerCase().includes(search.toLowerCase())

      const matchesTag = selectedTag === null || problem.tags.some((tag) => tag.name === selectedTag)

      return matchesSearch && matchesTag
    })
  }, [problems, search, selectedTag])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-balance mb-2">問題一覧</h1>
              <p className="text-muted-foreground text-pretty leading-relaxed">
                保存した問題と解説を確認できます。タグで絞り込んで検索してください。
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/upload">
                <Plus className="h-4 w-4" />
                新しい問題
              </Link>
            </Button>
          </div>

          <div className="mb-8">
            <ProblemFilters
              onSearchChange={setSearch}
              onTagFilter={setSelectedTag}
              availableTags={availableTags}
              selectedTag={selectedTag}
            />
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">読み込み中...</p>
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">問題が見つかりませんでした。</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProblems.map((problem) => (
                <ProblemCard key={problem.id} problem={problem} onDelete={handleDeleteProblem} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
