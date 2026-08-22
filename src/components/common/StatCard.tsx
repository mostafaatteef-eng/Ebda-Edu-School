import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
    label: string;
  };
  badge?: {
    text: string;
    variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  };
  accentColor?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon,
  trend,
  badge,
  accentColor = '#25A09F',
  onClick,
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-3xl bg-white p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-slate-300 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-bold text-slate-500">{title}</span>
        {badge ? (
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              badge.variant === 'secondary'
                ? 'bg-[#F35024]/10 text-[#F35024]'
                : badge.variant === 'success'
                ? 'bg-emerald-50 text-emerald-700'
                : badge.variant === 'warning'
                ? 'bg-amber-50 text-amber-700'
                : badge.variant === 'danger'
                ? 'bg-rose-50 text-rose-700'
                : 'bg-[#25A09F]/10 text-[#25A09F]'
            }`}
          >
            {badge.text}
          </span>
        ) : (
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="my-3">
        <div className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
          {value}
        </div>
        {subtitle && <p className="text-xs text-slate-400 font-medium mt-1">{subtitle}</p>}
      </div>

      {trend ? (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            {trend.type === 'positive' && (
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            )}
            {trend.type === 'negative' && (
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
            )}
            {trend.type === 'neutral' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
            <span
              className={`font-bold ${
                trend.type === 'positive'
                  ? 'text-emerald-600'
                  : trend.type === 'negative'
                  ? 'text-rose-600'
                  : 'text-slate-500'
              }`}
            >
              {trend.value}
            </span>
          </div>
          <span className="text-slate-400 text-[11px]">{trend.label}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: '85%', backgroundColor: accentColor }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
