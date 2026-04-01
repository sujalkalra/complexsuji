import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Activity } from 'lucide-react';

// Generates data points for common complexities
const generateData = () => {
  const data = [];
  for (let n = 1; n <= 10; n++) {
    data.push({
      n,
      'O(1)': 1,
      'O(log n)': Math.log2(n),
      'O(n)': n,
      'O(n log n)': n * Math.log2(n),
      'O(n^2)': Math.pow(n, 2),
      'O(2^n)': Math.pow(2, n),
    });
  }
  return data;
};

const data = generateData();

const complexities = [
  { key: 'O(1)', color: '#10b981', label: 'Constant' },
  { key: 'O(log n)', color: '#3b82f6', label: 'Logarithmic' },
  { key: 'O(n)', color: '#f59e0b', label: 'Linear' },
  { key: 'O(n log n)', color: '#f97316', label: 'Log-Linear' },
  { key: 'O(n^2)', color: '#ef4444', label: 'Quadratic' },
  { key: 'O(2^n)', color: '#991b1b', label: 'Exponential' },
];

interface ComplexityChartProps {
  predictedComplexity?: string;
}

// Function to loosely match the predicted complexity to standard keys
const matchComplexity = (predicted: string) => {
  if (!predicted) return null;
  const p = predicted.toLowerCase();

  if (p.includes('1') || p.includes('c')) return 'O(1)';
  if (p.includes('log n') && !p.includes('n log')) return 'O(log n)';
  if (p.includes('n log n') || p.includes('nlogn')) return 'O(n log n)';
  if (p.includes('n^2') || p.includes('n*n')) return 'O(n^2)';
  if (p.includes('2^n')) return 'O(2^n)';
  if (p.includes('n') && !p.match(/n\^|2\^/)) return 'O(n)';

  return null;
};

export default function ComplexityChart({ predictedComplexity }: ComplexityChartProps) {
  const matchedKey = predictedComplexity ? matchComplexity(predictedComplexity) : null;

  return (
    <Card className="overflow-hidden border-border/40 analysis-card mt-6">
      <CardHeader className="bg-primary/10 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Big-O Complexity Chart</CardTitle>
        </div>
        <CardDescription>
          Visualizing your algorithm's efficiency against standard complexities
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="n"
                label={{ value: 'Elements (n)', position: 'insideBottomRight', offset: -10 }}
                tick={{fill: 'currentColor', opacity: 0.7}}
                stroke="currentColor"
              />
              <YAxis
                label={{ value: 'Operations', angle: -90, position: 'insideLeft' }}
                domain={[0, 100]} // Cap the Y axis so O(n^2) and O(2^n) don't dwarf others early on
                tick={{fill: 'currentColor', opacity: 0.7}}
                stroke="currentColor"
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              {complexities.map((comp) => (
                <Line
                  key={comp.key}
                  type="monotone"
                  dataKey={comp.key}
                  stroke={comp.color}
                  strokeWidth={matchedKey === comp.key ? 4 : 2}
                  dot={false}
                  opacity={matchedKey ? (matchedKey === comp.key ? 1 : 0.2) : 1}
                  isAnimationActive={true}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          {complexities.map((comp) => (
            <div
              key={comp.key}
              className={`flex items-center gap-2 text-sm ${matchedKey && matchedKey !== comp.key ? 'opacity-40' : 'opacity-100 font-medium'}`}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: comp.color }}
              />
              <span>{comp.key}</span>
            </div>
          ))}
        </div>

        {matchedKey && (
          <div className="mt-4 p-3 bg-secondary/50 rounded-md text-center text-sm border border-border">
            Based on your code, the analysis suggests <strong className="text-primary">{predictedComplexity}</strong>, which aligns closely with the <strong style={{color: complexities.find(c => c.key === matchedKey)?.color}}>{matchedKey}</strong> curve.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
