
import { PDFDocument } from 'pdf-lib'
import pdfjs from 'pdfjs-dist/build/pdf.js'

pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@2.7.570/build/pdf.worker.min.js'

export const pdfLibPageToPdfDocument = async page => {
    const sourceDocument = page.doc
    const index = sourceDocument.getPages().indexOf(page)

    const destinationDocument = await PDFDocument.create()
    const [copiedPage] = await destinationDocument.copyPages(sourceDocument, [index])
    destinationDocument.addPage(copiedPage)

    return destinationDocument
}

export const pdfLibPageToPngDataUrl = async pdfLibPage => {
    console.log('generate page')

    const previewPdfLibDocument = await pdfLibPageToPdfDocument(pdfLibPage)
    const buffer = await previewPdfLibDocument.save()
    const loadingTask = pdfjs.getDocument(buffer)
    const pdf = await loadingTask.promise
    const pdfPage = await pdf.getPage(1)

    const viewport = pdfPage.getViewport({
        scale: 1
    })

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.height = viewport.height
    canvas.width = viewport.width

    await pdfPage.render({
        canvasContext: context,
        viewport: viewport
    }).promise

    return canvas.toDataURL('image/png')
}

