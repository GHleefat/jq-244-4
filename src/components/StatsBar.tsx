import { useMemo } from 'react';
import { Package, ArrowRightLeft, Clock, AlertTriangle } from 'lucide-react';
import { useToolStore } from '@/store/toolStore';

export default function StatsBar() {
  const tools = useToolStore((state) => state.tools);
  const getStats = useToolStore((state) => state.getStats);

  const stats = useMemo(() => getStats(), [tools, getStats]);

  const items = [
    { label: '在库', value: stats.available, icon: Package, color: 'text-forest-600', bg: 'bg-forest-50', border: 'border-forest-200' },
    { label: '借出中', value: stats.borrowed, icon: ArrowRightLeft, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: '即将到期', value: stats.dueSoon, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: '已过期', value: stats.overdue, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={`${item.bg} ${item.border} border rounded-xl p-3 md:p-4 flex items-center gap-3 transition-all hover:scale-[1.02] hover:shadow-card`}
          >
            <div className={`${item.bg} p-2 rounded-lg`}>
              <Icon className={`w-5 h-5 md:w-6 md:h-6 ${item.color}`} strokeWidth={2} />
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-display font-bold text-wood-800">
                {item.value}
              </div>
              <div className="text-xs md:text-sm text-wood-600 font-medium">
                {item.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
