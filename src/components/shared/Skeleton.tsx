import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

const BaseSkeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width, 
  height 
}) => {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] rounded-ios-2xl ${className}`}
      style={style}
    />
  );
};

export const TaskSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-ios-2xl p-4 border-l-4 border-l-slate-200 space-y-3">
      <div className="flex items-start gap-4">
        <BaseSkeleton className="w-6 h-6 rounded-lg" />
        <div className="flex-1 space-y-2">
          <BaseSkeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <BaseSkeleton className="h-3 w-16 rounded-full" />
            <BaseSkeleton className="h-3 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC<{ lines?: number }> = ({ lines = 2 }) => {
  return (
    <div className="bg-white rounded-ios-2xl p-4 space-y-3">
      <BaseSkeleton className="h-5 w-2/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <BaseSkeleton key={i} className="h-3 w-full" />
      ))}
    </div>
  );
};

export const ListSkeleton: React.FC<{ count?: number; itemHeight?: string }> = ({ 
  count = 3, 
  itemHeight = 'h-16' 
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`bg-white rounded-ios-2xl p-4 ${itemHeight}`}>
          <div className="flex items-center gap-4">
            <BaseSkeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <BaseSkeleton className="h-4 w-3/4" />
              <BaseSkeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const CalendarSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Calendar header */}
      <div className="flex justify-between items-center">
        <BaseSkeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <BaseSkeleton className="h-8 w-8 rounded-lg" />
          <BaseSkeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="aspect-square bg-white rounded-lg p-2 space-y-1">
            <BaseSkeleton className="h-4 w-4" />
            {i % 7 === 0 && <BaseSkeleton className="h-2 w-full" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Skeleton = BaseSkeleton;

