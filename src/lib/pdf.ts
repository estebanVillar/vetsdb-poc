import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { get as getBlob, set as setBlob } from 'idb-keyval'
import type { PaperVersion } from './types'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export { pdfjs }

export async function loadVersionBytes(version: PaperVersion): Promise<ArrayBuffer> {
  if (version.blobKey) {
    const blob = await getBlob<Blob>(version.blobKey)
    if (!blob) throw new Error('El archivo subido ya no está en este navegador (se ha reiniciado la demo).')
    return blob.arrayBuffer()
  }
  const res = await fetch(version.fileUrl!)
  if (!res.ok) throw new Error(`No se pudo cargar el documento (${res.status})`)
  return res.arrayBuffer()
}

export async function storeUpload(file: File): Promise<string> {
  const key = `upload-${Date.now()}-${file.name}`
  await setBlob(key, file)
  return key
}

// Las fuentes estándar de PDF solo admiten WinAnsi: se sustituye lo que no se pueda codificar.
const winAnsiSafe = (text: string) => text.replace(/[^\x20-\x7E -ÿ]/g, '?')

export async function downloadWithWatermark(version: PaperVersion, watermark: string, fileName: string) {
  const bytes = await loadVersionBytes(version)
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
  const font = await doc.embedFont(StandardFonts.HelveticaBold)
  const text = winAnsiSafe(watermark)
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize()
    const size = Math.max(10, Math.min(width, height) / 32)
    for (let i = 0; i < 3; i++) {
      page.drawText(text, {
        x: width * 0.1, y: height * (0.25 + i * 0.28), size, font, color: rgb(0.6, 0.1, 0.1),
        opacity: 0.16, rotate: degrees(30),
      })
    }
    page.drawText(winAnsiSafe(`Descargado de vetsDB por ${watermark}`), {
      x: 20, y: 10, size: 7, font, color: rgb(0.5, 0.1, 0.1), opacity: 0.8,
    })
  }
  const out = await doc.save()
  const url = URL.createObjectURL(new Blob([out as BlobPart], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = fileName.replace(/\.pdf$/i, '') + '-vetsdb.pdf'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
