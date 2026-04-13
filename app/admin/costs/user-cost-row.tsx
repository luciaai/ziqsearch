'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ApiCall {
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  timestamp: string;
}

interface UserCostRowProps {
  userId: string;
  name: string;
  email: string;
  isPro: boolean;
  searchCount: number;
  monthlyRevenue: number;
  monthlyCost: number;
  profit: number;
  status: 'profit' | 'break-even' | 'loss';
  apiCalls: ApiCall[];
}

export function UserCostRow({
  name,
  email,
  isPro,
  searchCount,
  monthlyRevenue,
  monthlyCost,
  profit,
  status,
  apiCalls,
}: UserCostRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="border-b hover:bg-muted/30 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <td className="p-4">
          <div className="flex items-center gap-2">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {status === 'loss' && <span className="text-2xl">🔴</span>}
            {status === 'break-even' && <span className="text-2xl">🟡</span>}
            {status === 'profit' && <span className="text-2xl">🟢</span>}
          </div>
        </td>
        <td className="p-4">
          <div className="font-medium">{name}</div>
          <div className="text-sm text-muted-foreground">{email}</div>
        </td>
        <td className="p-4">
          {isPro ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              Pro
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              Free
            </span>
          )}
        </td>
        <td className="p-4 text-right text-muted-foreground">{searchCount}</td>
        <td className="p-4 text-right font-medium text-green-600">${monthlyRevenue.toFixed(2)}</td>
        <td className="p-4 text-right font-medium text-red-600">${monthlyCost.toFixed(2)}</td>
        <td className="p-4 text-right">
          <span
            className={`font-bold ${
              profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-600' : 'text-yellow-600'
            }`}
          >
            ${profit.toFixed(2)}
          </span>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-muted/20">
          <td colSpan={7} className="p-4">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Detailed API Usage This Month</h4>
              
              {apiCalls.length === 0 ? (
                <p className="text-sm text-muted-foreground">No API calls this month</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-background border-b">
                      <tr>
                        <th className="text-left p-2 font-medium">Date & Time</th>
                        <th className="text-left p-2 font-medium">Model</th>
                        <th className="text-left p-2 font-medium">Provider</th>
                        <th className="text-right p-2 font-medium">Input Tokens</th>
                        <th className="text-right p-2 font-medium">Output Tokens</th>
                        <th className="text-right p-2 font-medium">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiCalls.map((call, idx) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="p-2 text-muted-foreground">
                            {new Date(call.timestamp).toLocaleString()}
                          </td>
                          <td className="p-2 font-mono text-xs">{call.model}</td>
                          <td className="p-2">{call.provider}</td>
                          <td className="p-2 text-right text-muted-foreground">
                            {call.inputTokens.toLocaleString()}
                          </td>
                          <td className="p-2 text-right text-muted-foreground">
                            {call.outputTokens.toLocaleString()}
                          </td>
                          <td className="p-2 text-right font-medium">${call.cost.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Model breakdown */}
              {apiCalls.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-semibold text-sm mb-2">Cost by Model</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(
                      apiCalls.reduce(
                        (acc, call) => {
                          acc[call.model] = (acc[call.model] || 0) + call.cost;
                          return acc;
                        },
                        {} as Record<string, number>
                      )
                    )
                      .sort(([, a], [, b]) => b - a)
                      .map(([model, cost]) => (
                        <div key={model} className="bg-background border rounded p-2">
                          <div className="text-xs text-muted-foreground truncate">{model}</div>
                          <div className="font-semibold">${cost.toFixed(2)}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
