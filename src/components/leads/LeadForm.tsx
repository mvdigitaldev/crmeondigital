'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { leadSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import type { Lead } from '@/types/lead.types'
import { useCreateLead, useUpdateLead } from '@/hooks/useLeads'
import { usePipelineStages } from '@/hooks/usePipelineStages'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  countries,
  defaultCountry,
  applyPhoneMask,
  removePhoneMask,
  parsePhone,
  combinePhone,
  type Country,
} from '@/lib/phone-mask'

interface LeadFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead?: Lead | null
}

export function LeadForm({ open, onOpenChange, lead }: LeadFormProps) {
  const createLead = useCreateLead()
  const updateLead = useUpdateLead()
  const { data: stages = [] } = usePipelineStages()
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry)
  const [phoneNumber, setPhoneNumber] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      nome_produtor: '',
      nome_contato: '',
      telefone: '',
      email: '',
      produto: '',
      site_link: '',
      uf: '',
      status: '',
      valor_estimado: null,
      origem: 'Outbound' as const,
      observacoes: '',
    },
  })

  useEffect(() => {
    if (!open) {
      // Reset quando o dialog fecha
      setSelectedCountry(defaultCountry)
      setPhoneNumber('')
      return
    }

    if (lead) {
      reset({
        nome_produtor: lead.nome_produtor,
        nome_contato: lead.nome_contato,
        telefone: lead.telefone || '',
        email: lead.email || '',
        produto: lead.produto || '',
        site_link: lead.site_link || '',
        uf: lead.uf || '',
        status: lead.status,
        valor_estimado: lead.valor_estimado,
        origem: lead.origem,
        observacoes: lead.observacoes || '',
      })

      // Processar telefone se existir
      if (lead.telefone) {
        const parsed = parsePhone(lead.telefone)
        if (parsed) {
          const country = countries.find(c => c.ddi === parsed.ddi) || defaultCountry
          setSelectedCountry(country)
          const masked = applyPhoneMask(parsed.number, country.mask)
          setPhoneNumber(masked)
        } else {
          setSelectedCountry(defaultCountry)
          setPhoneNumber('')
        }
      } else {
        setSelectedCountry(defaultCountry)
        setPhoneNumber('')
      }
    } else {
      reset({
        nome_produtor: '',
        nome_contato: '',
        telefone: '',
        email: '',
        produto: '',
        site_link: '',
        uf: '',
        status: stages.length > 0 ? stages[0].slug : '',
        valor_estimado: null,
        origem: 'Outbound' as const,
        observacoes: '',
      })
      setSelectedCountry(defaultCountry)
      setPhoneNumber('')
    }
  }, [lead, open, reset, setValue, stages])

  const handlePhoneChange = (value: string) => {
    const masked = applyPhoneMask(value, selectedCountry.mask)
    setPhoneNumber(masked)
    const cleanNumber = removePhoneMask(masked)
    const fullPhone = cleanNumber ? combinePhone(selectedCountry.ddi, cleanNumber) : ''
    setValue('telefone', fullPhone)
  }

  const handleCountryChange = (ddi: string) => {
    const country = countries.find(c => c.ddi === ddi) || defaultCountry
    setSelectedCountry(country)
    // Reaplica a máscara com o novo país
    const cleanNumber = removePhoneMask(phoneNumber)
    const masked = cleanNumber ? applyPhoneMask(cleanNumber, country.mask) : ''
    setPhoneNumber(masked)
    const fullPhone = cleanNumber ? combinePhone(country.ddi, cleanNumber) : ''
    setValue('telefone', fullPhone)
  }

  const onSubmit = async (data: any) => {
    try {
      // Garantir que o telefone está salvo corretamente
      const cleanNumber = removePhoneMask(phoneNumber)
      if (cleanNumber) {
        data.telefone = combinePhone(selectedCountry.ddi, cleanNumber)
      } else {
        data.telefone = null
      }

      if (lead) {
        await updateLead.mutateAsync({ id: lead.id, updates: data })
      } else {
        await createLead.mutateAsync(data as any)
      }
      onOpenChange(false)
      setSelectedCountry(defaultCountry)
      setPhoneNumber('')
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const status = watch('status')
  const origem = watch('origem')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead ? 'Editar Lead' : 'Novo Lead'}</DialogTitle>
          <DialogDescription>
            {lead ? 'Atualize as informações do lead' : 'Preencha os dados do novo lead'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome_produtor">Nome do Produtor *</Label>
              <Input
                id="nome_produtor"
                {...register('nome_produtor')}
                aria-invalid={!!errors.nome_produtor}
              />
              {errors.nome_produtor && (
                <p className="text-sm text-destructive">{errors.nome_produtor.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome_contato">Nome do Contato *</Label>
              <Input
                id="nome_contato"
                {...register('nome_contato')}
                aria-invalid={!!errors.nome_contato}
              />
              {errors.nome_contato && (
                <p className="text-sm text-destructive">{errors.nome_contato.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <div className="flex gap-2">
                <Select
                  value={selectedCountry.ddi}
                  onValueChange={handleCountryChange}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue>
                      +{selectedCountry.ddi}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.ddi}>
                        +{country.ddi} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="telefone"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder={selectedCountry.placeholder}
                  aria-invalid={!!errors.telefone}
                />
              </div>
              {errors.telefone && (
                <p className="text-sm text-destructive">{errors.telefone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="produto">Produto</Label>
              <Input
                id="produto"
                {...register('produto')}
                aria-invalid={!!errors.produto}
              />
              {errors.produto && (
                <p className="text-sm text-destructive">{errors.produto.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="site_link">Site/Link</Label>
              <Input
                id="site_link"
                {...register('site_link')}
                aria-invalid={!!errors.site_link}
              />
              {errors.site_link && (
                <p className="text-sm text-destructive">{errors.site_link.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="uf">UF</Label>
              <Input
                id="uf"
                maxLength={2}
                {...register('uf')}
                aria-invalid={!!errors.uf}
              />
              {errors.uf && (
                <p className="text-sm text-destructive">{errors.uf.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Etapa *</Label>
              <Select value={status} onValueChange={(value) => setValue('status', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a etapa" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.slug}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="origem">Origem *</Label>
              <Select value={origem} onValueChange={(value) => setValue('origem', value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inbound">Inbound</SelectItem>
                  <SelectItem value="Outbound">Outbound</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor_estimado">Valor Estimado</Label>
            <Input
              id="valor_estimado"
              type="number"
              step="0.01"
              {...register('valor_estimado')}
              aria-invalid={!!errors.valor_estimado}
            />
            {errors.valor_estimado && (
              <p className="text-sm text-destructive">{errors.valor_estimado.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              rows={4}
              aria-invalid={!!errors.observacoes}
            />
            {errors.observacoes && (
              <p className="text-sm text-destructive">{errors.observacoes.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createLead.isPending || updateLead.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createLead.isPending || updateLead.isPending}>
              {(createLead.isPending || updateLead.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {lead ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

