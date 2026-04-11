'use client';

import { useState, useEffect, useRef } from 'react';
import { NextBusInfo } from '@/types/commute';
import { useCurrentTime, useTestMode } from '@/hooks/useUserSettings';
import { getAllNextBuses } from '@/lib/commute-calculator';

function BusCard({ info }: { info: NextBusInfo }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isOnDemand = ['motorcycle', 'bicycle', 'electric-scooter'].includes(info.type);

  const getStatusColor = () => {
    if (!info.isOperating) return 'bg-slate-50 border-slate-200';
    if (info.waitMinutes <= 3) return 'bg-emerald-50 border-emerald-300';
    if (info.waitMinutes <= 10) return 'bg-amber-50 border-amber-300';
    return 'bg-blue-50 border-blue-200';
  };

  const getStatusBg = () => {
    if (!info.isOperating) return 'text-slate-400';
    if (info.waitMinutes <= 3) return 'text-emerald-600';
    if (info.waitMinutes <= 10) return 'text-amber-600';
    return 'text-blue-500';
  };

  const getIconText = () => {
    if (!info.isOperating) return 'text-slate-400';
    if (info.waitMinutes <= 3) return 'text-emerald-600';
    if (info.waitMinutes <= 10) return 'text-amber-600';
    return 'text-blue-600';
  };

  // 自动滚动到当前/下一班时间位置
  useEffect(() => {
    if (!scrollRef.current || isOnDemand || info.allDepartures.length === 0) return;

    const scrollContainer = scrollRef.current;

    // 找到下一班（isNext=true），如果没找到则用第一个（时间在所有班次之外）
    let targetIndex = info.allDepartures.findIndex(d => d.isNext);
    if (targetIndex === -1) targetIndex = 0;

    // 延迟滚动确保 DOM 已渲染
    const timer = setTimeout(() => {
      const containerWidth = scrollContainer.offsetWidth;
      const containerScrollWidth = scrollContainer.scrollWidth;
      const children = scrollContainer.children;
      if (children.length === 0 || targetIndex >= children.length) return;

      const targetElement = children[targetIndex] as HTMLElement;
      const elementWidth = targetElement.offsetWidth;
      const elementLeft = targetElement.offsetLeft;

      // 计算滚动位置使目标居中，边界保护
      let scrollLeft = elementLeft - containerWidth / 2 + elementWidth / 2;
      scrollLeft = Math.max(0, Math.min(scrollLeft, containerScrollWidth - containerWidth));

      scrollContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }, 150);

    return () => clearTimeout(timer);
  }, [info.allDepartures, info.currentMinutes, isOnDemand]);

  return (
    <div className={`rounded-2xl border-2 p-5 transition-all shadow-sm hover:shadow-md ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isOnDemand ? 'bg-orange-100' : getStatusColor().split(' ')[0]}`}>
            <span className={isOnDemand ? '' : getIconText()}>
              {info.icon ?? '🚌'}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">
              {info.transportName.split('（')[0]}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {info.price === '0' ? '免费' : `${info.price}元`}
              </span>
              {info.note && (
                <span className="ml-1 text-xs text-amber-500 font-medium">({info.note})</span>
              )}
            </div>
          </div>
        </div>

        {!isOnDemand && (
          <div className="text-right">
            <div className="text-xs text-slate-400 mb-1">
              {info.isOperating ? '下一班' : '状态'}
            </div>
            <div className={`text-3xl font-bold ${getStatusBg()}`}>
              {info.nextBusTime}
            </div>
          </div>
        )}
      </div>

      {/* 发车时间横向滚动列表 */}
      {!isOnDemand && info.allDepartures.length > 0 && (
        <div className="mb-2">
          {/* 上一班/等车/下下班标记 */}
          <div className="relative">
            {/* 时间线 */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-full mx-4" />
            <div className="flex overflow-x-auto gap-2 pt-6 pb-1 scrollbar-hide" ref={scrollRef} style={{ scrollSnapType: 'x proximity' }}>
              {info.allDepartures.map((dep, idx) => (
                <div key={dep.time} data-index={idx} className={`flex flex-col items-center flex-shrink-0 relative ${dep.isNext ? 'z-10' : ''}`} style={{ scrollSnapAlign: 'center' }}>
                  {/* 标记 */}
                  <div className="h-6 flex items-center mb-1">
                    {dep.isPrev && <span className="text-xs text-slate-400 font-medium">上一班</span>}
                    {dep.isNext && <span className="text-xs text-emerald-600 font-bold whitespace-nowrap">下一班{info.waitMinutes > 0 ? ` · ${info.waitMinutes}分钟` : ''}</span>}
                    {dep.isNextNext && <span className="text-xs text-blue-400 font-medium">下下一班</span>}
                  </div>
                  {/* 时间气泡 */}
                  <div
                    data-is-current={dep.isNext}
                    className={`
                      relative px-3 py-1.5 rounded-xl text-sm font-semibold min-w-[56px] text-center transition-all duration-200
                      ${dep.isPrev ? 'bg-slate-100 text-slate-400' : ''}
                      ${dep.isNext ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-110 z-10 ring-2 ring-emerald-400 ring-offset-1' : ''}
                      ${dep.isNextNext ? 'bg-blue-100 text-blue-600' : ''}
                      ${!dep.isPrev && !dep.isNext && !dep.isNextNext ? 'bg-white/80 text-slate-500 shadow-sm' : ''}
                    `}
                  >
                    {dep.time}
                  </div>
                  {/* 时间点圆点 */}
                  <div className={`absolute bottom-0 w-2.5 h-2.5 rounded-full border-2 transition-all ${dep.isNext ? 'bg-emerald-500 border-emerald-400 scale-150' : dep.isPrev ? 'bg-slate-300 border-slate-200' : dep.isNextNext ? 'bg-blue-400 border-blue-300' : 'bg-white border-slate-300'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 不显示时间线 */}
      {isOnDemand && info.isOperating && (
        <div className="text-center py-3 bg-white/60 rounded-xl">
          <span className="text-slate-500 font-medium">遇到了，别错过</span>
        </div>
      )}
    </div>
  );
}

function TestModePanel({ 
  useCustomTime, 
  onToggle,
  customTime,
  onCustomTimeChange,
  customDate,
  onCustomDateChange
}: {
  useCustomTime: boolean;
  onToggle: (v: boolean) => void;
  customTime: string;
  onCustomTimeChange: (v: string) => void;
  customDate: string;
  onCustomDateChange: (v: string) => void;
}) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          id="testMode"
          checked={useCustomTime}
          onChange={(e) => onToggle(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="testMode" className="text-sm font-medium text-yellow-800">
          测试模式：自定义时间
        </label>
      </div>
      
      {useCustomTime && (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={customDate}
            onChange={(e) => onCustomDateChange(e.target.value)}
            className="px-2 py-1 border border-yellow-300 rounded text-sm"
          />
          <input
            type="time"
            value={customTime}
            onChange={(e) => onCustomTimeChange(e.target.value)}
            className="px-2 py-1 border border-yellow-300 rounded text-sm"
          />
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { currentTime, currentDate, currentDayOfWeek } = useCurrentTime();
  const { 
    useCustomTime, 
    setUseCustomTime, 
    customTime, 
    setCustomTime, 
    customDate, 
    setCustomDate,
    getEffectiveTime,
    getEffectiveDate,
    isTestMode,
    initialized
  } = useTestMode();

  const [busInfos, setBusInfos] = useState<NextBusInfo[]>([]);

  // 检测页面可见性变化，切回前台时自动刷新
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const time = getEffectiveTime();
        const date = getEffectiveDate();
        const infos = getAllNextBuses(time, date);
        setBusInfos(infos);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [getEffectiveTime, getEffectiveDate]);

  useEffect(() => {
    if (!initialized) return;
    
    const time = getEffectiveTime();
    const date = getEffectiveDate();
    const infos = getAllNextBuses(time, date);
    setBusInfos(infos);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, getEffectiveTime, getEffectiveDate, currentTime]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* 标题 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-1">公交到站时间</h1>
          <p className="text-sm text-slate-500">实时显示各线路下一班公交车</p>
        </div>

        {/* 当前时间 */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-5 border border-slate-100">
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-2 font-medium">{currentDate} {currentDayOfWeek}</div>
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {isTestMode && useCustomTime ? customTime : currentTime}
            </div>
            {isTestMode && useCustomTime && (
              <div className="mt-2 text-xs text-amber-500 font-medium">测试模式</div>
            )}
          </div>
        </div>

        {/* 测试模式 */}
        {isTestMode && (
          <TestModePanel
            useCustomTime={useCustomTime}
            onToggle={setUseCustomTime}
            customTime={customTime}
            onCustomTimeChange={setCustomTime}
            customDate={customDate}
            onCustomDateChange={setCustomDate}
          />
        )}

        {/* 公交列表 */}
        <div className="space-y-4">
          {busInfos.map((info) => (
            <BusCard key={info.transportType} info={info} />
          ))}
        </div>

        {/* 底部信息 */}
        <div className="mt-8 text-center text-xs text-slate-300">
          数据仅供参考，请以实际为准
        </div>
      </div>
    </div>
  );
}
