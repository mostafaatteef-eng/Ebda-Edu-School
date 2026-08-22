export function formatDateArabic(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('ar-EG', {
      month: 'numeric',
      day: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatTimeArabic(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return isoString;
  }
}

export function getWorkloadStatus(target: number, actual: number): {
  status: 'below' | 'optimal' | 'overload';
  labelAr: string;
  badgeClass: string;
  variance: number;
  percentage: number;
} {
  const variance = actual - target;
  const percentage = target > 0 ? Math.round((actual / target) * 100 * 10) / 10 : 0;

  if (actual < target - 1) {
    return {
      status: 'below',
      labelAr: 'أقل من المستهدف (Underloaded)',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      variance,
      percentage,
    };
  } else if (actual > target + 2) {
    return {
      status: 'overload',
      labelAr: 'عبء زائد (Overloaded)',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      variance,
      percentage,
    };
  } else {
    return {
      status: 'optimal',
      labelAr: 'نصاب مثالي (Optimal)',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      variance,
      percentage,
    };
  }
}
