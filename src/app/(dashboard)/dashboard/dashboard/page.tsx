'use client'

export const dynamic = 'force-dynamic'

import { useLeads } from '@/hooks/useLeads'
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

  const metrics = useMemo(() => {
    const totalLeads = leads.length
    const leadsByStatus = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const valorPotencial = leads
      .filter((lead) => lead.status !== 'fechado' && lead.status !== 'perdido')
      .reduce((sum, lead) => sum + (lead.valor_estimado || 0), 0)

    const conversao = totalLeads > 0
      ? ((leadsByStatus['fechado'] || 0) / totalLeads) * 100
      : 0

    return {
      totalLeads,
      leadsByStatus,
      valorPotencial,
      conversao,
    }
  }, [leads])

  const chartData = [
    { name: 'Prospecção', value: metrics.leadsByStatus['prospecção'] || 0, color: PRIMARY_ORANGE },
    { name: 'Contato Realizado', value: metrics.leadsByStatus['contato_realizado'] || 0, color: orangeShades[1] },
    { name: 'Reunião Agendada', value: metrics.leadsByStatus['reuniao_agendada'] || 0, color: orangeShades[2] },
    { name: 'Negociação', value: metrics.leadsByStatus['negociacao'] || 0, color: orangeShades[3] },
    { name: 'Fechado', value: metrics.leadsByStatus['fechado'] || 0, color: orangeShades[4] },
    { name: 'Perdido', value: metrics.leadsByStatus['perdido'] || 0, color: '#ef4444' }, // Vermelho para perdido
  ]

  if (isLoading) {
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
          value={metrics.leadsByStatus['negociacao'] || 0}
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
                  fill={PRIMARY_ORANGE}
                  radius={[4, 4, 0, 0]}
                  name="Quantidade"
                />
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

