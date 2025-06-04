// components/upload-card.tsx
"use client"

import React, { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useUploadMovimentos } from "@/hooks/use-upload-movimentos" // Supondo que este hook exista e esteja correto
import { UploadResult } from "@/types/upload" // Supondo que este tipo exista e esteja correto

interface UploadCardProps {
  tipo: 'remessa' | 'regresso' | 'transferencia'
  onUploadSuccess: (result: UploadResult) => void
}

export function UploadCard({ tipo, onUploadSuccess }: UploadCardProps) {
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    isLoading,
    progress,
    error,
    uploadMovimentos,
    downloadTemplate,
    resetProgress
  } = useUploadMovimentos()

  const getTipoColor = () => {
    switch (tipo) {
      case 'remessa': return 'border-orange-500'
      case 'regresso': return 'border-green-500'
      case 'transferencia': return 'border-purple-500'
    }
  }

  const getTipoText = () => {
    switch (tipo) {
      case 'remessa': return 'Remessa'
      case 'regresso': return 'Regresso'
      case 'transferencia': return 'Transferência'
    }
  }

  const getTipoButtonColor = () => {
    switch (tipo) {
      case 'remessa': return 'bg-orange-600 hover:bg-orange-700'
      case 'regresso': return 'bg-green-600 hover:bg-green-700'
      case 'transferencia': return 'bg-purple-600 hover:bg-purple-700'
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const excelFile = files.find(file =>
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.name.endsWith('.xlsx')
    )

    if (excelFile) {
      setSelectedFile(excelFile)
      resetProgress()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      resetProgress()
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      const result = await uploadMovimentos(selectedFile, tipo)
      onUploadSuccess(result)
    } catch (err) {
      // Erro já tratado no hook
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate(tipo)
    } catch (err) {
      // Erro já tratado no hook
    }
  }

  return (
    <Card className={`h-full flex flex-col transition-all duration-200 ${dragOver ? 'scale-[1.02] shadow-lg' : ''} border-l-4 ${getTipoColor()}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileSpreadsheet className="h-5 w-5 flex-shrink-0" />
          <span>Upload de {getTipoText()}</span>
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          Faça upload de uma planilha Excel para criar múltiplos movimentos de {getTipoText().toLowerCase()}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate pr-2">{progress.message}</span>
              <span className="flex-shrink-0 font-medium">{progress.current}%</span>
            </div>
            <Progress value={progress.current} className="h-2" />
            {progress.status === 'completed' && (
              <Alert className="border-green-500/50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-sm">
                  Upload concluído com sucesso!
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <div
            className={`flex-1 min-h-[120px] border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer flex flex-col items-center justify-center ${
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-2">
                <FileSpreadsheet className="h-8 w-8 mx-auto text-green-500" />
                <p className="font-medium text-sm truncate max-w-full">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground px-2">
                  Arraste um arquivo Excel aqui ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground">
                  Apenas arquivos .xlsx são aceitos
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Ajuste aqui: removido sm:flex-row */}
        <div className="flex flex-col gap-2 mt-auto">
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            className="flex-1 text-sm" // flex-1 pode ser mantido ou removido dependendo do design desejado para botões empilhados
            disabled={isLoading}
          >
            <Download className="mr-2 h-4 w-4" />
            Baixar Template
          </Button>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className={`flex-1 text-sm ${getTipoButtonColor()}`} // flex-1 pode ser mantido ou removido
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Fazer Upload
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}