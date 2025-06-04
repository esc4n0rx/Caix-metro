// app/dashboard/upload-movimentos/page.tsx
"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { UploadCard } from "@/components/upload-card"
import { UploadResult } from "@/types/upload"
import { CheckCircle, AlertTriangle, FileSpreadsheet, Info } from "lucide-react"

export default function UploadMovimentosPage() {
  const [lastUploadResult, setLastUploadResult] = useState<UploadResult | null>(null)

  const handleUploadSuccess = (result: UploadResult) => {
    setLastUploadResult(result)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload de Movimentos</h1>
        <p className="text-muted-foreground">
          Faça upload de planilhas Excel para criar movimentos em massa
        </p>
      </div>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Como usar esta funcionalidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>1. <strong>Baixe o template</strong> clicando no botão "Baixar Template" do tipo de movimento desejado</p>
          <p>2. <strong>Preencha a planilha</strong> seguindo o formato do template</p>
          <p>3. <strong>Para lojas:</strong> Você pode usar variações do nome (ex: "macae", "MACAÉ", "maca") - nosso sistema encontrará automaticamente</p>
          <p>4. <strong>Faça o upload</strong> arrastando o arquivo ou clicando para selecionar</p>
          <p>5. <strong>Acompanhe o progresso</strong> e verifique os resultados</p>
        </CardContent>
      </Card>

      {/* Resultado do último upload */}
      {lastUploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {lastUploadResult.erros.length > 0 ? (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              Resultado do Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{lastUploadResult.total_linhas}</div>
                <div className="text-sm text-muted-foreground">Linhas processadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{lastUploadResult.movimentos_criados}</div>
                <div className="text-sm text-muted-foreground">Movimentos criados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{lastUploadResult.erros.length}</div>
                <div className="text-sm text-muted-foreground">Erros encontrados</div>
              </div>
            </div>

            {lastUploadResult.erros.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-destructive">Erros encontrados:</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {lastUploadResult.erros.map((erro, index) => (
                      <div key={index} className="text-sm bg-muted rounded p-2 border">
                        <span className="font-medium">Linha {erro.linha}:</span>
                        <ul className="list-disc list-inside ml-2">
                          {erro.erros.map((mensagem, idx) => (
                            <li key={idx}>{mensagem}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cards de Upload - Grid com altura uniforme */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="min-h-[400px]">
          <UploadCard tipo="remessa" onUploadSuccess={handleUploadSuccess} />
        </div>
        <div className="min-h-[400px]">
          <UploadCard tipo="regresso" onUploadSuccess={handleUploadSuccess} />
        </div>
        <div className="min-h-[400px]">
          <UploadCard tipo="transferencia" onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>

      {/* Informações adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Informações sobre os Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Badge variant="outline" className="border-orange-500 text-orange-500">Remessa</Badge>
              <p className="text-sm">
                <strong>Origem:</strong> Sempre o seu CD<br />
                <strong>Destino:</strong> Nome da loja (pode usar variações)<br />
                <strong>Ativos:</strong> Nome e quantidade dos ativos
              </p>
            </div>
            
            <div className="space-y-2">
              <Badge variant="outline" className="border-green-500 text-green-500">Regresso</Badge>
              <p className="text-sm">
                <strong>Origem:</strong> Nome da loja (pode usar variações)<br />
                <strong>Destino:</strong> Sempre o seu CD<br />
                <strong>Ativos:</strong> Nome e quantidade dos ativos
              </p>
            </div>
            
            <div className="space-y-2">
              <Badge variant="outline" className="border-purple-500 text-purple-500">Transferência</Badge>
              <p className="text-sm">
                <strong>Origem:</strong> Sempre o seu CD<br />
                <strong>Destino:</strong> Nome do CD de destino<br />
                <strong>Ativos:</strong> Nome e quantidade dos ativos
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Algoritmo Inteligente de Lojas</h4>
            <p className="text-sm text-muted-foreground">
              Nosso sistema reconhece automaticamente variações nos nomes das lojas. Por exemplo:
            </p>
            <div className="text-sm bg-muted rounded p-3 font-mono">
              "MACAE" → MACAE ✓<br />
              "macaé" → MACAE ✓<br />
              "maca" → MACAE ✓<br />
              "cabo frio" → CABO FRIO ✓<br />
              "cabofrio" → CABO FRIO ✓
            </div>
            <p className="text-sm text-muted-foreground">
              O sistema usa algoritmo de similaridade com 70% de confiança mínima para encontrar a loja correta.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}