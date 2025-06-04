// lib/loja-matcher.ts
import { lojas } from '@/lib/data'

/**
 * Remove acentos e caracteres especiais para normalização
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim()
}

/**
 * Calcula a distância de Levenshtein entre duas strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []
  
  if (str1.length === 0) return str2.length
  if (str2.length === 0) return str1.length

  // Inicializa a matriz
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  // Preenche a matriz
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substituição
          matrix[i][j - 1] + 1,     // inserção
          matrix[i - 1][j] + 1      // deleção
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * Calcula a similaridade entre duas strings (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const normalized1 = normalizeString(str1)
  const normalized2 = normalizeString(str2)
  
  if (normalized1 === normalized2) return 1
  
  const maxLength = Math.max(normalized1.length, normalized2.length)
  if (maxLength === 0) return 1
  
  const distance = levenshteinDistance(normalized1, normalized2)
  return (maxLength - distance) / maxLength
}

/**
 * Verifica se uma string contém outra (busca parcial)
 */
function containsMatch(haystack: string, needle: string): boolean {
  const normalizedHaystack = normalizeString(haystack)
  const normalizedNeedle = normalizeString(needle)
  
  return normalizedHaystack.includes(normalizedNeedle) || 
         normalizedNeedle.includes(normalizedHaystack)
}

/**
 * Encontra a melhor correspondência para um nome de loja
 */
export function findBestLojaMatch(inputName: string, threshold: number = 0.7): {
  match: string | null
  confidence: number
  exactMatch: boolean
} {
  if (!inputName || inputName.trim() === '') {
    return { match: null, confidence: 0, exactMatch: false }
  }

  let bestMatch = null
  let bestConfidence = 0
  let exactMatch = false

  for (const loja of lojas) {
    const lojaNome = loja.nome
    
    // Verifica match exato (normalizado)
    if (normalizeString(inputName) === normalizeString(lojaNome)) {
      return { match: lojaNome, confidence: 1, exactMatch: true }
    }
    
    // Calcula similaridade
    const similarity = calculateSimilarity(inputName, lojaNome)
    
    // Verifica se contém (para casos como "MACAE" vs "MACAÉ")
    const contains = containsMatch(lojaNome, inputName)
    
    // Ajusta confiança se há match parcial
    let adjustedConfidence = similarity
    if (contains && similarity > 0.5) {
      adjustedConfidence = Math.max(similarity, 0.8)
    }
    
    if (adjustedConfidence > bestConfidence && adjustedConfidence >= threshold) {
      bestMatch = lojaNome
      bestConfidence = adjustedConfidence
    }
  }

  return { 
    match: bestMatch, 
    confidence: bestConfidence,
    exactMatch: false
  }
}

/**
 * Testa o algoritmo de matching com exemplos
 */
export function testLojaMatching() {
  const testCases = [
    'MACAE',
    'macae',
    'Macaé',
    'maca',
    'cabo frio',
    'CABO FRIO',
    'cabofrio',
    'campos',
    'GRAJAU',
    'grajaú',
    'graja',
    'botafogo',
    'BOTAFOGO',
    'inexistente'
  ]

  console.log('=== TESTE DO ALGORITMO DE MATCHING ===')
  testCases.forEach(testCase => {
    const result = findBestLojaMatch(testCase)
    console.log(`"${testCase}" -> "${result.match}" (${(result.confidence * 100).toFixed(1)}% confiança, exato: ${result.exactMatch})`)
  })
}