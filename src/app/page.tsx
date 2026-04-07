'use client';

import { useState, useEffect, useRef } from 'react';
import { NextBusInfo } from '@/types/commute';
import { useCurrentTime, useTestMode } from '@/hooks/useUserSettings';
import { getAllNextBuses } from '@/lib/commute-calculator';

function BusCard({ info }: { info: NextBusInfo }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMotorcycle = info.transportType === 'motorcycle';

  const getStatusColor = () => {
    if (!info.isOperating) return 'bg-gray-100 border-gray-300';
    if (info.waitMinutes <= 3) return 'bg-green-50 border-green-400';
    if (info.waitMinutes <= 10) return 'bg-yellow-50 border-yellow-400';
    return 'bg-blue-50 border-blue-300';
  };

  const getStatusBg = () => {
    if (!info.isOperating) return 'text-gray-500';
    if (info.waitMinutes <= 3) return 'text-green-600';
    if (info.waitMinutes <= 10) return 'text-yellow-600';
    return 'text-blue-600';
  };

  // 自动滚动到当前时间位置
  useEffect(() => {
    if (scrollRef.current && !isMotorcycle) {
      const currentElement = scrollRef.current.querySelector('[data-is-current="true"]') as HTMLElement;
      if (currentElement) {
        const containerWidth = scrollRef.current.offsetWidth;
        const elementLeft = currentElement.offsetLeft;
        const elementWidth = currentElement.offsetWidth;
        scrollRef.current.scrollTo({
          left: elementLeft - containerWidth / 2 + elementWidth / 2,
          behavior: 'smooth'
        });
      }
    }
  });

  return (
    <div className={`rounded-xl border-2 p-4 transition-all ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {isMotorcycle ? '🛵' : '🚌'}
          </span>
          <div>
            <h3 className="font-bold text-gray-900">
              {info.transportName.split('（')[0]}
            </h3>
            <span className="text-xs text-gray-500">
              {info.price === 0 ? '免费' : `${info.price}元`}
            </span>
            {info.note && (
              <span className="ml-1 text-xs text-orange-500">({info.note})</span>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">
            {info.isOperating ? '下一班' : '状态'}
          </div>
          <div className={`text-2xl font-bold ${getStatusBg()}`}>
            {info.nextBusTime}
          </div>
        </div>
      </div>

      {/* 发车时间横向滚动列表 */}
      {!isMotorcycle && info.allDepartures.length > 0 && (
        <div className="mb-3">
          {/* 上一班/等车/下下班标记 */}
          <div className="flex overflow-x-auto gap-1 mb-1 scrollbar-hide" ref={scrollRef}>
            {info.allDepartures.map((dep) => (
              <div key={dep.time} className="flex flex-col items-center flex-shrink-0">
                {/* 标记 */}
                <div className="h-5 flex items-center">
                  {dep.isPrev && <span className="text-xs text-gray-500">上一班</span>}
                  {dep.isNext && <span className="text-xs text-green-600 font-medium">等车</span>}
                  {dep.isNextNext && <span className="text-xs text-gray-500">下下一班</span>}
                </div>
                {/* 时间 */}
                <div
                  data-is-current={dep.isNext}
                  className={`
                    px-2 py-1 rounded text-sm font-medium min-w-[50px] text-center
                    ${dep.isPrev ? 'bg-gray-100 text-gray-500' : ''}
                    ${dep.isNext ? 'bg-green-100 text-green-700 border-2 border-green-400' : ''}
                    ${dep.isNextNext ? 'bg-blue-50 text-blue-600' : ''}
                    ${!dep.isPrev && !dep.isNext && !dep.isNextNext ? 'bg-white/50 text-gray-600' : ''}
                  `}
                >
                  {dep.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 摩的不显示时间线 */}
      {isMotorcycle && info.isOperating && (
        <div className="text-center py-2 bg-white/50 rounded-lg">
          <span className="text-gray-600">随时可乘坐</span>
        </div>
      )}

      {!info.isOperating && (
        <div className="text-center py-2 bg-gray-200/50 rounded-lg">
          <span className="text-gray-500 text-sm">
            {info.status === 'off-duty' ? '今日已停运' : '当前无服务'}
          </span>
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

  useEffect(() => {
    if (!initialized) return;
    
    const time = getEffectiveTime();
    const date = getEffectiveDate();
    const infos = getAllNextBuses(time, date);
    setBusInfos(infos);
  }, [initialized, getEffectiveTime, getEffectiveDate]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* 标题 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">公交到站时间</h1>
          <p className="text-sm text-gray-600">实时显示各线路下一班公交车</p>
        </div>

        {/* 当前时间 */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">{currentDate} {currentDayOfWeek}</div>
            <div className="text-4xl font-bold text-blue-600">
              {isTestMode && useCustomTime ? customTime : currentTime}
            </div>
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
        <div className="space-y-3">
          {busInfos.map((info) => (
            <BusCard key={info.transportType} info={info} />
          ))}
        </div>

        {/* 底部信息 */}
        <div className="mt-6 text-center text-xs text-gray-400">
          数据仅供参考，请以实际为准
        </div>
      </div>
    </div>
  );
}
