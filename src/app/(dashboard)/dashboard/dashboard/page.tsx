'use client'

export const dynamic = 'force-dynamic'

import { useLeads } from '@/hooks/useLeads'
import { usePipelineStages } from '@/hooks/usePipelineStages'
import { MetricsCard } from '@/components/dashboard/MetricsCard'
import { Users, Phone, TrendingUp, DollarSign } from 'lucide-react'
import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// Cores baseadas no laranja #ff4c00
const PRIMARY_ORANGE = '#ff4c00'
const orangeShades = [
  '#ff4c00', // Laranja principal
  '#ff6b2e', // Laranja mais claro
  '#ff8a5c', // Laranja médio claro
  '#ffa98a', // Laranja claro
  '#ffc8b8', // Laranja muito claro
  '#ff5722', // Laranja escuro
]

export default function DashboardPage() {
  const { data: leads = [], isLoading } = useLeads()
  const { data: stages = [], isLoading: isLoadingStages } = usePipelineStages()

  const metrics = useMemo(() => {
    const totalLeads = leads.length
    const leadsByStatus = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Identificar etapas finais (fechado/perdido) dinamicamente
    const finalStages = stages.filter(stage => 
      stage.slug.toLowerCase().includes('fechado') || 
      stage.slug.toLowerCase().includes('perdido')
    ).map(stage => stage.slug)

    const valorPotencial = leads
      .filter((lead) => !finalStages.includes(lead.status))
      .reduce((sum, lead) => sum + (lead.valor_estimado || 0), 0)

    // Calcular conversão baseado em etapas "fechado"
    const fechadoStage = stages.find(s => s.slug.toLowerCase().includes('fechado'))
    const leadsFechados = fechadoStage ? (leadsByStatus[fechadoStage.slug] || 0) : 0
    const conversao = totalLeads > 0
      ? (leadsFechados / totalLeads) * 100
      : 0

    // Encontrar etapa de negociação dinamicamente
    const negociacaoStage = stages.find(s => 
      s.slug.toLowerCase().includes('negociacao') || 
      s.slug.toLowerCase().includes('negociação')
    )

    return {
      totalLeads,
      leadsByStatus,
      valorPotencial,
      conversao,
      negociacaoCount: negociacaoStage ? (leadsByStatus[negociacaoStage.slug] || 0) : 0,
      finalStages,
    }
  }, [leads, stages])

  // Gerar dados do gráfico baseado nas etapas do pipeline
  const chartData = useMemo(() => {
    // Ordenar etapas por ordem
    const sortedStages = [...stages].sort((a, b) => a.order - b.order)
    
    return sortedStages.map((stage, index) => {
      const count = metrics.leadsByStatus[stage.slug] || 0
      // Identificar cor baseado no tipo de etapa
      let color = PRIMARY_ORANGE
      const slugLower = stage.slug.toLowerCase()
      
      if (slugLower.includes('perdido')) {
        color = '#ef4444' // Vermelho para perdido
      } else if (slugLower.includes('fechado')) {
        color = '#22c55e' // Verde para fechado
      } else {
        // Usar tons de laranja para outras etapas
        color = orangeShades[index % orangeShades.length] || PRIMARY_ORANGE
      }

      return {
        name: stage.name,
        value: count,
        color: stage.color || color,
      }
    })
  }, [stages, metrics.leadsByStatus])

  if (isLoading || isLoadingStages) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total de Leads"
          value={metrics.totalLeads}
          icon={Users}
          description="Leads cadastrados"
        />
        <MetricsCard
          title="Valor Potencial"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(metrics.valorPotencial)}
          icon={DollarSign}
          description="No pipeline"
        />
        <MetricsCard
          title="Taxa de Conversão"
          value={`${metrics.conversao.toFixed(1)}%`}
          icon={TrendingUp}
          description="Leads fechados"
        />
        <MetricsCard
          title="Em Negociação"
          value={metrics.negociacaoCount}
          icon={Phone}
          description="Leads em negociação"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leads por Etapa</CardTitle>
            <CardDescription>Distribuição de leads em cada etapa do funil</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: 'Leads',
                  color: PRIMARY_ORANGE,
                },
              }}
              className="h-[300px]"
            >
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  name="Quantidade"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
            <CardDescription>Percentual de leads em cada status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={Object.fromEntries(
                chartData.map((item) => [
                  item.name,
                  {
                    label: item.name,
                    color: item.color || PRIMARY_ORANGE,
                  },
                ])
              )}
              className="h-[300px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={chartData.filter((d) => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => 
                    percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                  }
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                >
                  {chartData.filter((d) => d.value > 0).map((entry, index) => {
                    const dataItem = chartData.find(d => d.name === entry.name)
                    const color = dataItem?.color || PRIMARY_ORANGE
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={color}
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      />
                    )
                  })}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

