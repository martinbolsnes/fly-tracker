'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
const chartDataLine = [
  { month: 'Jan', catches: 18 },
  { month: 'Feb', catches: 30 },
  { month: 'Mar', catches: 23 },
  { month: 'Apr', catches: 73 },
  { month: 'May', catches: 20 },
  { month: 'Jun', catches: 21 },
];

const chartDataPie = [
  { species: 'brown', count: 27, fill: 'var(--color-brown)' },
  { species: 'seatrout', count: 20, fill: 'var(--color-seatrout)' },
  { species: 'salmon', count: 18, fill: 'var(--color-salmon)' },
  { species: 'bass', count: 17, fill: 'var(--color-bass)' },
  { species: 'pike', count: 9, fill: 'var(--color-pike)' },
];

const chartDataBar = [
  { weather: 'Sunny', catches: 18 },
  { weather: 'Rainy', catches: 30 },
  { weather: 'Cloudy', catches: 23 },
  { weather: 'Snowy', catches: 7 },
];

const chartConfigLine = {
  catches: {
    label: 'Catches',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const chartConfigPie = {
  count: {
    label: 'Count',
  },
  brown: {
    label: 'Brown Trout',
    color: 'hsl(var(--chart-landing-1))',
  },
  seatrout: {
    label: 'Seatrout',
    color: 'hsl(var(--chart-landing-2))',
  },
  salmon: {
    label: 'Salmon',
    color: 'hsl(var(--chart-landing-3))',
  },
  bass: {
    label: 'Bass',
    color: 'hsl(var(--chart-landing-4))',
  },
  pike: {
    label: 'Pike',
    color: 'hsl(var(--chart-landing-5))',
  },
} satisfies ChartConfig;

const chartConfigBar = {
  catches: {
    label: 'Catches',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function FeaturesLandingPage() {
  return (
    <div className='flex flex-col gap-4'>
      <Card className='border border-border'>
        <CardHeader>
          <CardTitle>Catches over Time</CardTitle>
          <CardDescription>January - June 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfigLine}
            className='container mx-auto h-[300px]'
          >
            <LineChart
              accessibilityLayer
              data={chartDataLine}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey='catches'
                type='monotone'
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: 'hsl(var(--primary))',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className='flex flex-col border border-border'>
        <CardHeader className='items-center pb-0'>
          <CardTitle>Top 5 Species</CardTitle>
          <CardDescription>Since Start</CardDescription>
        </CardHeader>
        <CardContent className='flex-1 pb-0'>
          <ChartContainer
            config={chartConfigPie}
            className='mx-auto aspect-square max-h-[500px]'
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey='count' hideLabel />}
              />
              <Pie data={chartDataPie} dataKey='count' />
              <ChartLegend
                content={<ChartLegendContent nameKey='species' />}
                className='-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center'
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className='border border-border'>
        <CardHeader>
          <CardTitle>Weather Impact</CardTitle>
          <CardDescription>Since Start</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfigBar}
            className='mx-auto max-h-[500px]'
          >
            <BarChart accessibilityLayer data={chartDataBar}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='weather'
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.trim()}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey='catches' fill='hsl(var(--primary))' radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
