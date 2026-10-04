import { useMemo } from 'react'
import { useStore } from './store'
import { buildIndex } from './search'

export function useSearchIndex() {
  const papers = useStore(s => s.papers)
  const topics = useStore(s => s.topics)
  const users = useStore(s => s.users)
  return useMemo(() => buildIndex(papers, topics, users), [papers, topics, users])
}
