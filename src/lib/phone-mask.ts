// Lista de países com DDI e máscaras de telefone
export interface Country {
  code: string
  name: string
  ddi: string
  mask: string
  placeholder: string
}

export const countries: Country[] = [
  { code: 'BR', name: 'Brasil', ddi: '55', mask: '(00) 00000-0000', placeholder: '(00) 00000-0000' },
  { code: 'US', name: 'Estados Unidos', ddi: '1', mask: '(000) 000-0000', placeholder: '(000) 000-0000' },
  { code: 'AR', name: 'Argentina', ddi: '54', mask: '(00) 0000-0000', placeholder: '(00) 0000-0000' },
  { code: 'CL', name: 'Chile', ddi: '56', mask: '(0) 0000-0000', placeholder: '(0) 0000-0000' },
  { code: 'CO', name: 'Colômbia', ddi: '57', mask: '(000) 000-0000', placeholder: '(000) 000-0000' },
  { code: 'MX', name: 'México', ddi: '52', mask: '(00) 0000-0000', placeholder: '(00) 0000-0000' },
  { code: 'PT', name: 'Portugal', ddi: '351', mask: '000 000 000', placeholder: '000 000 000' },
  { code: 'ES', name: 'Espanha', ddi: '34', mask: '000 000 000', placeholder: '000 000 000' },
  { code: 'FR', name: 'França', ddi: '33', mask: '0 00 00 00 00', placeholder: '0 00 00 00 00' },
  { code: 'DE', name: 'Alemanha', ddi: '49', mask: '000 0000000', placeholder: '000 0000000' },
  { code: 'IT', name: 'Itália', ddi: '39', mask: '000 000 0000', placeholder: '000 000 0000' },
  { code: 'GB', name: 'Reino Unido', ddi: '44', mask: '0000 000000', placeholder: '0000 000000' },
  { code: 'UY', name: 'Uruguai', ddi: '598', mask: '000 000 000', placeholder: '000 000 000' },
  { code: 'PY', name: 'Paraguai', ddi: '595', mask: '(000) 000-000', placeholder: '(000) 000-000' },
  { code: 'BO', name: 'Bolívia', ddi: '591', mask: '0000-0000', placeholder: '0000-0000' },
  { code: 'PE', name: 'Peru', ddi: '51', mask: '000-000-000', placeholder: '000-000-000' },
  { code: 'VE', name: 'Venezuela', ddi: '58', mask: '(000) 000-0000', placeholder: '(000) 000-0000' },
  { code: 'EC', name: 'Equador', ddi: '593', mask: '0 000-0000', placeholder: '0 000-0000' },
]

export const defaultCountry = countries.find(c => c.ddi === '55') || countries[0]

/**
 * Aplica máscara de telefone baseada no padrão do país
 */
export function applyPhoneMask(value: string, mask: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '')
  
  if (!numbers) return ''
  
  let masked = ''
  let numberIndex = 0
  
  for (let i = 0; i < mask.length && numberIndex < numbers.length; i++) {
    if (mask[i] === '0') {
      masked += numbers[numberIndex]
      numberIndex++
    } else {
      masked += mask[i]
    }
  }
  
  return masked
}

/**
 * Remove máscara e retorna apenas números
 */
export function removePhoneMask(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Extrai DDI e número de um telefone completo
 */
export function parsePhone(phone: string): { ddi: string; number: string } | null {
  if (!phone) return null
  
  const numbers = removePhoneMask(phone)
  if (!numbers) return null
  
  // Tenta encontrar o DDI (começando pelos maiores)
  const sortedCountries = [...countries].sort((a, b) => b.ddi.length - a.ddi.length)
  
  for (const country of sortedCountries) {
    if (numbers.startsWith(country.ddi)) {
      return {
        ddi: country.ddi,
        number: numbers.slice(country.ddi.length),
      }
    }
  }
  
  // Se não encontrou, assume Brasil (55) como padrão
  if (numbers.length >= 10) {
    return {
      ddi: '55',
      number: numbers.startsWith('55') ? numbers.slice(2) : numbers,
    }
  }
  
  return {
    ddi: '55',
    number: numbers,
  }
}

/**
 * Formata telefone completo (DDI + número) para exibição
 */
export function formatPhoneForDisplay(phone: string | null): string {
  if (!phone) return ''
  
  const parsed = parsePhone(phone)
  if (!parsed) return phone
  
  const country = countries.find(c => c.ddi === parsed.ddi) || defaultCountry
  const masked = applyPhoneMask(parsed.number, country.mask)
  
  return `+${parsed.ddi} ${masked}`
}

/**
 * Combina DDI e número para salvar no banco
 */
export function combinePhone(ddi: string, number: string): string {
  const cleanNumber = removePhoneMask(number)
  if (!cleanNumber) return ''
  return `${ddi}${cleanNumber}`
}

