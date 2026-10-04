import { useEffect, useRef, useState } from 'react'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import { Loader2, ShieldCheck, ZoomIn, ZoomOut } from 'lucide-react'
import { loadVersionBytes, pdfjs } from '../lib/pdf'
import type { PaperVersion } from '../lib/types'
import { Button } from './ui'

function Watermark({ text }: { text: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 grid grid-cols-2 content-around overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <span key={i} className="-rotate-[28deg] whitespace-nowrap text-center text-[13px] font-bold text-red-900/15">
          {text}
        </span>
      ))}
    </div>
  )
}

function PageCanvas({ doc, pageNumber, width, watermark }: { doc: PDFDocumentProxy; pageNumber: number; width: number; watermark: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    let task: RenderTask | undefined
    let cancelled = false
    doc.getPage(pageNumber).then(page => {
      if (cancelled || !canvasRef.current) return
      const base = page.getViewport({ scale: 1 })
      const dpr = window.devicePixelRatio || 1
      const viewport = page.getViewport({ scale: (width / base.width) * dpr })
      const canvas = canvasRef.current
      canvas.width = viewport.width
      canvas.height = viewport.height
      canvas.style.width = `${width}px`
      canvas.style.height = `${viewport.height / dpr}px`
      task = page.render({ canvasContext: canvas.getContext('2d')!, viewport })
      task.promise.catch(() => undefined)
    })
    return () => { cancelled = true; task?.cancel() }
  }, [doc, pageNumber, width])

  return (
    <div className="relative mx-auto mb-4 bg-white shadow-md" style={{ width }}>
      <canvas ref={canvasRef} className="block" />
      <Watermark text={watermark} />
      <span className="absolute bottom-1 right-2 text-[10px] text-ink-400">{pageNumber}</span>
    </div>
  )
}

export function PdfViewer({ version, watermark }: { version: PaperVersion; watermark: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [doc, setDoc] = useState<PDFDocumentProxy>()
  const [error, setError] = useState<string>()
  const [zoom, setZoom] = useState(1)
  const [baseWidth, setBaseWidth] = useState(760)

  useEffect(() => {
    let loaded: PDFDocumentProxy | undefined
    setDoc(undefined)
    setError(undefined)
    loadVersionBytes(version)
      .then(data => pdfjs.getDocument({ data }).promise)
      .then(d => { loaded = d; setDoc(d) })
      .catch(e => setError(String(e.message ?? e)))
    return () => { loaded?.destroy() }
  }, [version])

  useEffect(() => {
    if (wrapRef.current) setBaseWidth(Math.min(820, wrapRef.current.clientWidth - 32))
  }, [])

  useEffect(() => {
    document.body.classList.add('viewer-open')
    const block = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['p', 's', 'c', 'a'].includes(e.key.toLowerCase())) e.preventDefault()
    }
    window.addEventListener('keydown', block)
    return () => { document.body.classList.remove('viewer-open'); window.removeEventListener('keydown', block) }
  }, [])

  const width = Math.round(baseWidth * zoom)

  return (
    <div ref={wrapRef} className="rounded border border-ink-200 bg-ink-100"
      onContextMenu={e => e.preventDefault()} onDragStart={e => e.preventDefault()} style={{ userSelect: 'none' }}>
      <div className="flex flex-wrap items-center gap-2 border-b border-ink-200 bg-white px-3 py-2 text-xs text-ink-600">
        <ShieldCheck size={16} className="text-brand-700" />
        <span>Visor protegido: páginas como imagen, sin texto seleccionable, marca de agua personal, sin clic derecho ni impresión.</span>
        <span className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.max(0.6, z - 0.15))} aria-label="Alejar"><ZoomOut size={14} /></Button>
          {Math.round(zoom * 100)}%
          <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.min(1.8, z + 0.15))} aria-label="Acercar"><ZoomIn size={14} /></Button>
        </span>
      </div>
      <div className="max-h-[80vh] overflow-auto p-4">
        {error && <p className="text-sm text-red-700">{error}</p>}
        {!doc && !error && <p className="flex items-center gap-2 text-sm text-ink-500"><Loader2 className="animate-spin" size={16} />Cargando documento…</p>}
        {doc && Array.from({ length: doc.numPages }, (_, i) => (
          <PageCanvas key={`${i}-${width}`} doc={doc} pageNumber={i + 1} width={width} watermark={watermark} />
        ))}
      </div>
    </div>
  )
}
