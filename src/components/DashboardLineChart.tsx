import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area
} from "recharts";

interface LineOption {
  key: string;
  label: string;
  color: string;
  visible: boolean;
}

interface DashboardLineChartProps {
  data: any[];
  lines: LineOption[];
  onToggleLine: (key: string) => void;
  periodType: "day" | "week" | "month";
  onChangePeriod: (type: "day" | "week" | "month") => void;
  chartTitle?: string;
}

const periodLabels = {
  day: "일별",
  week: "주별",
  month: "월별"
};

// 커스텀 Tooltip
function CustomTooltip({ active, payload, label, ...rest }: any) {
  if (!active || !payload || !payload.length) return null;
  // dataKey 기준으로 중복 제거
  const shown = new Set();
  const filtered = payload.filter((entry: any) => {
    if (shown.has(entry.dataKey)) return false;
    shown.add(entry.dataKey);
    return true;
  });
  // lines prop을 rest에서 추출 (parent에서 넘겨줌)
  const lines = rest.lines || [];
  return (
    <div className="rounded-lg bg-black/90 px-4 py-3 shadow-xl border border-white/10 min-w-[120px]">
      <div className="text-sm font-bold text-white mb-2">{label}</div>
      {filtered.map((entry: any, idx: number) => {
        // entry.name과 lines.label을 매칭하여 컬러 추출
        const lineColor = (lines.find((l: any) => l.label === entry.name) || {}).color || entry.color;
        return (
          <div key={idx} className="flex items-center gap-2 mb-1">
            <span className="inline-block rounded-full align-middle" style={{ background: lineColor, width: 6, height: 6, minWidth: 6, minHeight: 6, marginRight: 6 }}></span>
            <span className="text-sm text-white flex-1">{entry.name}</span>
            <span className="text-sm font-bold text-white text-right" style={{ minWidth: 40 }}>{Math.floor(entry.value)}%</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardLineChart({
  data,
  lines,
  onToggleLine,
  periodType,
  onChangePeriod,
  chartTitle
}: DashboardLineChartProps) {
  const activeLabels = lines.map(l => l.label).join(', ');
  const chartTitleToUse = chartTitle || (activeLabels.includes('플레이스') ? '네이버 플레이스 추이' : '네이버 쇼핑 추이');

  // mock 데이터 생성 (데이터 없을 때만)
  const mockData = React.useMemo(() => {
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dateStr = `${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
      const row: any = { date: dateStr };
      lines.forEach(line => {
        row[line.key] = Math.round((Math.random() * 60 + 20) * 10) / 10; // 20~80% 랜덤
      });
      return row;
    });
  }, [lines]);

  const chartData = (data && data.length > 0) ? data : mockData;

  // gradient id 생성
  const getGradientId = (color: string, idx: number) => `line-gradient-${idx}`;

  return (
    <div className="bg-[#18181b] rounded-2xl p-8 shadow-lg mb-8 border border-white/10">
      {/* 차트 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
        <div className="text-xl font-bold text-white tracking-tight mb-2 sm:mb-0">
          {chartTitleToUse}
          <sup className="ml-2 text-xs text-gray-400 sup-top-align">*소수점 이하 절사</sup>
        </div>
        {/* periodType 버튼 */}
        <div className="flex gap-1 bg-transparent rounded-lg">
          {[
            { key: 'day', label: '일간' },
            { key: 'week', label: '주간' },
            { key: 'month', label: '월간' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onChangePeriod(key as 'day' | 'week' | 'month')}
              className={`
                px-4 py-1 rounded-full border transition
                ${periodType === key
                  ? 'border-blue-500 bg-blue-50/10 text-blue-400 font-bold'
                  : 'border-transparent text-gray-400 hover:border-gray-600 hover:bg-white/5'}
              `}
              type="button"
              style={{ minWidth: 56 }}
            >
              {label}
            </button>
          ))}
        </div>
        {/* 미니멀 범례 */}
        <div className="flex gap-3">
          {lines.map((line, idx) => (
            <label key={line.key} className="flex flex-col items-center cursor-pointer select-none group min-w-[32px]">
              <span
                className={`inline-block w-2 h-2 rounded-full mb-1 transition-all duration-150 ${line.visible ? '' : 'opacity-30 grayscale'} group-hover:scale-125`}
                style={{ background: '#fff', border: `2px solid ${line.color}` }}
              ></span>
              <input
                type="checkbox"
                checked={line.visible}
                onChange={() => onToggleLine(line.key)}
                className="hidden"
              />
              <span className={`text-[11px] font-semibold ${line.visible ? 'text-white' : 'text-gray-500'}`}>{line.label}</span>
            </label>
          ))}
        </div>
      </div>
      {/* 차트 */}
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 24, right: 48, left: 48, bottom: 0 }}>
          <defs>
            {lines.filter(l => l.visible).map((line, idx) => (
              <linearGradient key={line.key} id={getGradientId(line.color, idx)} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff" stopOpacity={0.7} />
                <stop offset="100%" stopColor={line.color} stopOpacity={0.1} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="#444" strokeDasharray="0" vertical={false} horizontal={true} strokeWidth={0.25} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={0}
            type="category"
            allowDuplicatedCategory={false}
            tickMargin={16}
            tick={(props) => {
              const { x, y, payload, index } = props;
              const textAnchor = index === 0 ? 'start' : index === 6 ? 'end' : 'middle';
              return (
                <text
                  x={x}
                  y={y + 18}
                  textAnchor={textAnchor}
                  fill="#e4e4e7"
                  fontSize={11}
                  style={{ pointerEvents: 'none' }}
                >
                  {payload.value}
                </text>
              );
            }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
            tickFormatter={() => ''}
            tick={{ fill: "#e4e4e7", fontSize: 13 }}
            axisLine={false}
            tickLine={false}
            width={40}
            interval={0}
          />
          <Tooltip content={<CustomTooltip lines={lines} />} cursor={{ stroke: '#fff', strokeWidth: 1, strokeDasharray: '2 2' }} />
          {/* Area + Line */}
          {lines.filter(l => l.visible).map((line, idx) => (
            <React.Fragment key={line.key}>
              <Area
                key={line.key + '-area'}
                type="monotone"
                dataKey={line.key}
                stroke="none"
                fill={`url(#${getGradientId(line.color, idx)})`}
                fillOpacity={1}
                isAnimationActive={false}
                connectNulls
              />
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke="#fff"
                strokeWidth={1}
                dot={false}
                isAnimationActive={false}
                connectNulls
                style={{ filter: `drop-shadow(0 0 6px ${line.color}cc)` }}
                activeDot={false}
              />
            </React.Fragment>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}