import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '@/lib/utils';

interface DailyAvailabilityData {
  report_date: string;
  available_count: number;
}

interface RescueOption {
  id: string;
  name: string;
}

interface ChartData {
  date: string;
  fullDate: string;
  count: number;
}

// Filters Component
const ReportFilters = ({
  startDate,
  endDate,
  selectedRescueId,
  rescues,
  rescuesLoading,
  minDate,
  maxDate,
  onStartDateChange,
  onEndDateChange,
  onRescueChange,
}: {
  startDate: Date;
  endDate: Date;
  selectedRescueId: string;
  rescues?: RescueOption[];
  rescuesLoading: boolean;
  minDate: Date;
  maxDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onRescueChange: (value: string) => void;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Filters</CardTitle>
      <CardDescription>
        Customize the date range and rescue to view specific data
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Start Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !startDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && onStartDateChange(date)}
                disabled={(date) => date < minDate || date > maxDate || date > endDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium">End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !endDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && onEndDateChange(date)}
                disabled={(date) => date < minDate || date > maxDate || date < startDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Rescue Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Rescue</label>
          <Select
            value={selectedRescueId}
            onValueChange={onRescueChange}
            disabled={rescuesLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select rescue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rescues</SelectItem>
              {rescues?.map((rescue) => (
                <SelectItem key={rescue.id} value={rescue.id}>
                  {rescue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Summary Statistics Component
const SummaryStats = ({
  totalDogs,
  avgDogs,
  endDate,
  daysCount,
}: {
  totalDogs: number;
  avgDogs: number;
  endDate: Date;
  daysCount: number;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Current Available Dogs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{totalDogs}</div>
        <p className="text-xs text-muted-foreground mt-1">
          As of {format(endDate, 'PPP')}
        </p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Average Daily Count
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{avgDogs}</div>
        <p className="text-xs text-muted-foreground mt-1">
          Over {daysCount} days
        </p>
      </CardContent>
    </Card>
  </div>
);

// Chart Component
const AvailabilityChart = ({
  chartData,
  isLoading,
  error,
}: {
  chartData: ChartData[];
  isLoading: boolean;
  error: Error | null;
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-destructive">
        <div className="text-center">
          <p className="font-semibold">Error loading data</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="font-semibold">No data available</p>
          <p className="text-sm mt-1">
            Try adjusting your date range or rescue filter
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            name="Available Dogs"
            dot={{ fill: 'hsl(var(--primary))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const Reports = () => {
  // Date range state - default to last 30 days
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  // Rescue filter state
  const [selectedRescueId, setSelectedRescueId] = useState<string>('all');

  // Minimum date is Jan 1, 2026
  const minDate = new Date('2026-01-01');
  const maxDate = new Date();

  // Fetch rescues for filter dropdown
  const { data: rescues, isLoading: rescuesLoading } = useQuery<RescueOption[]>({
    queryKey: ['rescues-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rescues')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data as RescueOption[];
    },
  });

  // Fetch daily availability data
  const { data: availabilityData, isLoading: dataLoading, error } = useQuery<DailyAvailabilityData[]>({
    queryKey: ['daily-availability', startDate, endDate, selectedRescueId],
    queryFn: async () => {
      const rescueId = selectedRescueId === 'all' ? null : selectedRescueId;
      
      const { data, error } = await supabase
        .schema('dogadopt_api')
        .rpc('get_daily_dog_availability', {
          p_start_date: format(startDate, 'yyyy-MM-dd'),
          p_end_date: format(endDate, 'yyyy-MM-dd'),
          p_rescue_id: rescueId,
        });

      if (error) {
        console.error('Error fetching availability data:', error);
        throw error;
      }

      return data as DailyAvailabilityData[];
    },
  });

  // Transform data for chart
  const chartData: ChartData[] = availabilityData?.map(item => ({
    date: format(new Date(item.report_date), 'MMM dd'),
    fullDate: item.report_date,
    count: item.available_count,
  })) || [];

  // Calculate summary statistics
  const totalDogs = chartData.length > 0 ? chartData[chartData.length - 1].count : 0;
  const avgDogs = chartData.length > 0 
    ? Math.round(chartData.reduce((sum, item) => sum + item.count, 0) / chartData.length)
    : 0;

  return (
    <>
      <SEO
        title="Dog Availability Reports - DogAdopt.co.uk"
        description="View daily statistics and trends of dogs available for adoption across UK rescues."
        canonicalUrl="https://dogadopt.co.uk/reports"
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dog Availability Reports</h1>
                <p className="text-muted-foreground mt-1">
                  Track the number of dogs available for adoption over time
                </p>
              </div>
            </div>

            {/* Filters */}
            <ReportFilters
              startDate={startDate}
              endDate={endDate}
              selectedRescueId={selectedRescueId}
              rescues={rescues}
              rescuesLoading={rescuesLoading}
              minDate={minDate}
              maxDate={maxDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onRescueChange={setSelectedRescueId}
            />

            {/* Summary Statistics */}
            {!dataLoading && !error && chartData.length > 0 && (
              <SummaryStats
                totalDogs={totalDogs}
                avgDogs={avgDogs}
                endDate={endDate}
                daysCount={chartData.length}
              />
            )}

            {/* Chart Card */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Dog Availability Trend</CardTitle>
                <CardDescription>
                  Number of dogs available for adoption per day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AvailabilityChart
                  chartData={chartData}
                  isLoading={dataLoading}
                  error={error}
                />
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Reports;
