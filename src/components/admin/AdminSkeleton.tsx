"use client";

function Bone({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`rounded-lg skeleton-shimmer ${className}`} style={style} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Bone className="h-8 w-48" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <Bone className="h-12 w-12 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Bone className="h-3 w-20" />
                <Bone className="h-7 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <Bone className="h-5 w-36 mb-4" />
          <div className="flex items-end gap-3 h-48">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center flex-1 gap-2">
                <Bone className="h-3 w-12" />
                <Bone className="w-full max-w-[40px] rounded-t-md" style={{ height: `${40 + Math.random() * 80}px` }} />
                <Bone className="h-3 w-8" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <Bone className="h-5 w-28 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between"><Bone className="h-3 w-16" /><Bone className="h-3 w-6" /></div>
                <Bone className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <Bone className="h-5 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50">
                <div className="flex items-center gap-3"><Bone className="h-3 w-24" /><Bone className="h-3 w-20" /></div>
                <div className="flex items-center gap-3"><Bone className="h-3 w-16" /><Bone className="h-5 w-16 rounded-full" /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <Bone className="h-5 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                <div className="space-y-1"><Bone className="h-3 w-36" /><Bone className="h-2.5 w-20" /></div>
                <Bone className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Bone key={i} className="h-3 flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-4 py-3.5">
            <div className="flex items-center gap-4">
              {Array.from({ length: columns }).map((_, c) => (
                <Bone key={c} className={`h-3.5 ${c === 0 ? "w-10 h-10 rounded-lg flex-shrink-0" : "flex-1"}`} style={c === 0 ? undefined : { width: `${50 + Math.random() * 40}%` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-5">
      <Bone className="h-5 w-40" />
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Bone className="h-3 w-24" />
          <Bone className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <Bone className="h-10 w-28 rounded-lg" />
        <Bone className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bone className="h-8 w-8 rounded-lg" />
        <Bone className="h-6 w-48" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 space-y-4">
            <Bone className="h-5 w-32" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <Bone className="h-3.5 w-32" />
                <Bone className="h-3.5 w-20" />
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 space-y-3">
            <Bone className="h-5 w-24" />
            <Bone className="h-20 w-full rounded-lg" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 space-y-3">
            <Bone className="h-5 w-28" />
            <Bone className="h-10 w-full rounded-lg" />
            <Bone className="h-10 w-full rounded-lg" />
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 space-y-3">
            <Bone className="h-5 w-24" />
            <Bone className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Bone className="h-8 w-48" />
      <Bone className="h-4 w-80" />
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Bone className="h-3 w-28" />
            <Bone className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
