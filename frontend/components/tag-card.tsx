import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tag } from "lucide-react"

interface TagCardProps {
  tag: string
  count: number
}

export function TagCard({ tag, count }: TagCardProps) {
  return (
    <Link href={`/problems?tag=${encodeURIComponent(tag)}`}>
      <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Tag className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">{tag}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {count}件の問題
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
