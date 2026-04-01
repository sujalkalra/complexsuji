import React from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Activity } from 'lucide-react';

// Generate continuous data for the background regions and standard lines
const generateData = () => {
  const data = [];
  // Using 1 to 50 for n to get a smooth curve without exploding values too early
  for (let n = 1; n <= 100; n++) {
    // Math functions for standard curves
    const o1 = 10; // offset slightly from 0
    const oLogN = 10 * Math.log2(n + 1);
    const oN = 2 * n;
    const oNLogN = n * Math.log2(n + 1) * 0.5;
    const oN2 = Math.pow(n, 2) * 0.1;
    const o2N = Math.pow(1.1, n); // scaled down base for 2^n so it fits in the chart
    const oFact = Math.pow(1.2, n); // scaled down for factorial/exponential

    data.push({
      n,
      'O(1)': o1,
      'O(log n)': oLogN,
      'O(n)': oN,
      'O(n log n)': oNLogN,
      'O(n^2)': oN2,
      'O(2^n)': o2N,
      'O(n!)': oFact,
      // Create stacked areas to fill background regions. We use a max Y value of 100 for visualization.
      // We fill up to 100 from highest to lowest boundary to create regions.
      horribleBoundary: 100, // Top area
      badBoundary: oN2 < 100 ? oN2 : 100,
      fairBoundary: oNLogN < 100 ? oNLogN : 100,
      goodBoundary: oN < 100 ? oN : 100,
      excellentBoundary: oLogN < 100 ? oLogN : 100,
    });
  }
  return data;
};

const data = generateData();

// Parsing predicted complexity into two separated variables: time and space
interface ComplexityChartProps {
  predictedComplexity?: string; // Expects something like "Time: O(n), Space: O(1)" or just "O(n)"
  timeComplexity?: string;
  spaceComplexity?: string;
}

const parseComplexity = (compStr: string) => {
  if (!compStr) return null;
  const p = compStr.toLowerCase();

  if (p.includes('1') || p.includes('c')) return 'O(1)';
  if (p.includes('log n') && !p.includes('n log')) return 'O(log n)';
  if (p.includes('n log n') || p.includes('nlogn')) return 'O(n log n)';
  if (p.includes('n^2') || p.includes('n*n')) return 'O(n^2)';
  if (p.includes('2^n')) return 'O(2^n)';
  if (p.includes('n!') || p.includes('factorial')) return 'O(n!)';
  if (p.includes('n') && !p.match(/n\^|2\^/)) return 'O(n)';

  return null;
};

export default function ComplexityChart({ predictedComplexity, timeComplexity, spaceComplexity }: ComplexityChartProps) {
  // If explicitly provided, use those, otherwise try to parse from predictedComplexity
  let matchedTimeKey = timeComplexity ? parseComplexity(timeComplexity) : null;
  let matchedSpaceKey = spaceComplexity ? parseComplexity(spaceComplexity) : null;

  if (predictedComplexity && !timeComplexity && !spaceComplexity) {
    // Naive parsing if only a single string is provided
    const lower = predictedComplexity.toLowerCase();
    if (lower.includes('time') && lower.includes('space')) {
        const timePart = lower.split('space')[0];
        const spacePart = lower.split('space')[1];
        matchedTimeKey = parseComplexity(timePart);
        matchedSpaceKey = parseComplexity(spacePart);
    } else {
        matchedTimeKey = parseComplexity(predictedComplexity);
    }
  }

  // The custom lines to draw for Time (Green) and Space (Blue)
  // We'll map the matched key to its corresponding data key to draw the line

  return (
    <Card className="overflow-hidden border-border/40 analysis-card mt-6">
      <CardHeader className="bg-card pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Big-O Complexity Chart</CardTitle>
        </div>
        <CardDescription>
          Visualizing your algorithm's efficiency
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">

        {/* Top Legend matching the image */}
        <div className="flex flex-wrap gap-2 justify-center mb-4 text-xs font-bold text-black">
            <div className="px-2 py-1 bg-[#ff8a8a] border border-black">Horrible</div>
            <div className="px-2 py-1 bg-[#ffb74d] border border-black">Bad</div>
            <div className="px-2 py-1 bg-[#fff176] border border-black">Fair</div>
            <div className="px-2 py-1 bg-[#dce775] border border-black">Good</div>
            <div className="px-2 py-1 bg-[#81c784] border border-black">Excellent</div>
        </div>

        <div className="h-[400px] w-full bg-white rounded-md border-2 border-black overflow-hidden relative p-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              {/* Background Regions */}
              <Area type="monotone" dataKey="horribleBoundary" stroke="none" fill="#ff8a8a" isAnimationActive={false} />
              <Area type="monotone" dataKey="badBoundary" stroke="none" fill="#ffb74d" isAnimationActive={false} />
              <Area type="monotone" dataKey="fairBoundary" stroke="none" fill="#fff176" isAnimationActive={false} />
              <Area type="monotone" dataKey="goodBoundary" stroke="none" fill="#dce775" isAnimationActive={false} />
              <Area type="monotone" dataKey="excellentBoundary" stroke="none" fill="#81c784" isAnimationActive={false} />

              <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#000" />
              <XAxis
                dataKey="n"
                label={{ value: 'Elements', position: 'insideBottom', offset: -5, fill: '#000', fontSize: 16, fontWeight: 'bold', fontStyle: 'italic' }}
                tick={false}
                stroke="#000"
                strokeWidth={2}
                axisLine={{ strokeWidth: 2 }}
              />
              <YAxis
                label={{ value: 'Operations', angle: -90, position: 'insideLeft', offset: 10, fill: '#000', fontSize: 16, fontWeight: 'bold', fontStyle: 'italic' }}
                domain={[0, 100]}
                tick={false}
                stroke="#000"
                strokeWidth={2}
                axisLine={{ strokeWidth: 2 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                labelFormatter={() => ''}
              />

              {/* Standard Lines */}
              <Line type="monotone" dataKey="O(1)" stroke="#000" strokeWidth={1} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="O(log n)" stroke="#000" strokeWidth={1} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="O(n)" stroke="#000" strokeWidth={1} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="O(n log n)" stroke="#000" strokeWidth={1} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="O(n^2)" stroke="#000" strokeWidth={1} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="O(2^n)" stroke="#000" strokeWidth={1} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="O(n!)" stroke="#000" strokeWidth={1} dot={false} isAnimationActive={false} />

              {/* Highlighted Time and Space Complexity Lines */}
              {matchedTimeKey && (
                  <Line
                    type="monotone"
                    dataKey={matchedTimeKey}
                    stroke="#10b981" // Green for time
                    strokeWidth={5}
                    dot={false}
                    isAnimationActive={true}
                    name={`Time: ${matchedTimeKey}`}
                  />
              )}
              {matchedSpaceKey && matchedSpaceKey !== matchedTimeKey && (
                  <Line
                    type="monotone"
                    dataKey={matchedSpaceKey}
                    stroke="#3b82f6" // Blue for space
                    strokeWidth={4}
                    strokeDasharray="5 5" // Dashed line for space if different
                    dot={false}
                    isAnimationActive={true}
                    name={`Space: ${matchedSpaceKey}`}
                  />
              )}
               {matchedSpaceKey && matchedSpaceKey === matchedTimeKey && (
                  <Line
                    type="monotone"
                    dataKey={matchedSpaceKey}
                    stroke="#3b82f6" // Blue for space
                    strokeWidth={2}
                    strokeDasharray="3 3" // Dashed line for space overlapping
                    dot={false}
                    isAnimationActive={true}
                    name={`Space: ${matchedSpaceKey}`}
                  />
              )}
            </ComposedChart>
          </ResponsiveContainer>

          {/* Custom Labels on Chart similar to image */}
          <div className="absolute top-[5%] left-[10%] text-black text-sm font-bold">O(n!)</div>
          <div className="absolute top-[5%] left-[18%] text-black text-sm font-bold">O(2^n)</div>
          <div className="absolute top-[15%] left-[30%] text-black text-sm font-bold">O(n^2)</div>
          <div className="absolute top-[45%] right-[15%] text-black text-sm font-bold">O(n log n)</div>
          <div className="absolute bottom-[18%] right-[5%] text-black text-sm font-bold">O(n)</div>
          <div className="absolute bottom-[2%] right-[5%] text-black text-sm font-bold">O(log n), O(1)</div>
        </div>

        <div className="mt-4 flex flex-col items-center gap-2">
            <div className="flex gap-6">
                <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-emerald-500 rounded-sm"></span>
                    <span className="text-sm font-mono text-muted-foreground">Time Complexity: {matchedTimeKey || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-blue-500 rounded-sm border-2 border-dashed border-white/50"></span>
                    <span className="text-sm font-mono text-muted-foreground">Space Complexity: {matchedSpaceKey || 'Unknown'}</span>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
