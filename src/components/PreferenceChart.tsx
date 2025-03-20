import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ChartPreferencesType {
  [key: string]: number;
}

interface PreferenceChartProps {
  preferences: ChartPreferencesType | null;
  isLoading: boolean;
  rawResponse?: any;
  selectionHistory?: any[];
}

const PreferenceChart = ({ 
  preferences, 
  isLoading, 
  rawResponse,
  selectionHistory = []
}: PreferenceChartProps) => {
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>([]);
  const [topStylesData, setTopStylesData] = useState<{ style: string; score: number }[]>([]);

  useEffect(() => {
    if (preferences) {
      const data = Object.entries(preferences).map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2)),
      }));
      
      const sortedData = [...data].sort((a, b) => b.value - a.value);
      setChartData(sortedData);
    }

    if (rawResponse && rawResponse.top_styles) {
      const topStyles = Object.entries(rawResponse.top_styles).map(([key, value]) => {
        let style, score;
        if (Array.isArray(value)) {
          [style, score] = value;
        } else if (typeof value === 'object' && value !== null) {
          style = Object.keys(value)[0];
          score = value[style];
        } else {
          style = key;
          score = value;
        }
        
        return {
          style: typeof style === 'string' ? style.charAt(0).toUpperCase() + style.slice(1) : style,
          score: typeof score === 'number' ? Number(score.toFixed(2)) : score
        };
      });
      
      setTopStylesData(topStyles);
    }
  }, [preferences, rawResponse]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Style Preferences</CardTitle>
          <CardDescription>Loading your style profile...</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full animate-appear">
      <CardHeader>
        <CardTitle>Style Preferences</CardTitle>
        <CardDescription>Your current style profile based on your likes and dislikes</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {topStylesData.length > 0 && (
          <div className="mb-6 p-4 border rounded-md bg-slate-50">
            <h3 className="text-sm font-medium mb-2">Top Styles (from API)</h3>
            <div className="space-y-2">
              {topStylesData.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Badge variant={index === 0 ? "default" : "outline"} className="mr-2">
                      #{index + 1}
                    </Badge>
                    <span className="font-medium capitalize">{item.style}</span>
                  </div>
                  <span className="text-sm bg-white px-2 py-1 rounded border">
                    {item.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 25, right: 25, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 'dataMax']} />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip
                  formatter={(value) => [`${value}`, 'Preference Score']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '8px',
                    border: '1px solid rgba(229, 231, 235, 0.5)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#0071e3"
                  radius={[0, 4, 4, 0]}
                  animationDuration={1500}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <p>No preference data available yet</p>
            <p className="text-sm mt-2">Like or dislike more suggestions to build your profile</p>
          </div>
        )}

        {rawResponse && (
          <Accordion type="single" collapsible className="mt-6 border rounded-md">
            <AccordionItem value="raw-response">
              <AccordionTrigger className="px-4">
                Raw API Response Data
              </AccordionTrigger>
              <AccordionContent>
                <ScrollArea className="h-72 rounded-md border p-4">
                  <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(rawResponse, null, 2)}
                  </pre>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {selectionHistory && selectionHistory.length > 0 && (
          <Accordion type="single" collapsible className="mt-4 border rounded-md">
            <AccordionItem value="selection-history">
              <AccordionTrigger className="px-4">
                Selection History Details
              </AccordionTrigger>
              <AccordionContent>
                <ScrollArea className="h-72 rounded-md border">
                  <div className="p-4 space-y-4">
                    {selectionHistory.map((selection, index) => (
                      <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div className="font-semibold">Style:</div>
                          <div>{selection.style}</div>
                          
                          <div className="font-semibold">Feedback:</div>
                          <div>{selection.feedback}</div>
                          
                          <div className="font-semibold">Score Change:</div>
                          <div>{selection.score_change}</div>
                          
                          <div className="font-semibold">Current Score:</div>
                          <div>{selection.current_score}</div>
                          
                          <div className="font-semibold">Timestamp:</div>
                          <div>{new Date(selection.timestamp * 1000).toLocaleString()}</div>
                          
                          <div className="font-semibold">Image URL:</div>
                          <div className="truncate">{selection.image}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export default PreferenceChart;
