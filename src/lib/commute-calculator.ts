import {
  TransportType,
  DayType,
  ShiftType,
  NextBusInfo,
  DepartureTime
} from '@/types/commute';
import { getTransportConfig } from '@/data/transport-config';

// 时间处理工具函数
export class TimeUtils {
  // 将 "HH:mm" 或 "HH:mm:ss" 转换为分钟数
  static timeToMinutes(time: string): number {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 60 + minutes + (seconds ? seconds / 60 : 0);
  }

  // 将分钟数转换为 "HH:mm"
  static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = Math.floor(minutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // 获取当前是星期几（0-6, 0是周日）
  static getCurrentDayOfWeek(date: Date): number {
    return date.getDay();
  }

  // 根据日期判断天类型
  static getDayType(dayOfWeek: number): DayType {
    return dayOfWeek === 6 ? DayType.SATURDAY : DayType.WEEKDAY;
  }

  // 判断班次类型（根据当前时间）
  static getShiftType(currentMinutes: number): ShiftType {
    // 早班：06:00 - 12:00
    // 晚班：12:00 - 24:00
    const noon = 12 * 60;
    return currentMinutes < noon ? ShiftType.MORNING : ShiftType.EVENING;
  }
}

// 计算班车的所有班次时间
interface BusTimes {
  prevBusTime: string | null;
  nextBusTime: string | null;
  nextNextBusTime: string | null;
}

function calculateBusTimes(
  currentTimeMinutes: number,
  firstBusTime: string,
  lastBusTime: string,
  intervals: any[]
): BusTimes {
  const firstBusMinutes = TimeUtils.timeToMinutes(firstBusTime);
  const lastBusMinutes = TimeUtils.timeToMinutes(lastBusTime);

  const result: BusTimes = {
    prevBusTime: null,
    nextBusTime: null,
    nextNextBusTime: null
  };

  // 如果当前时间早于首班
  if (currentTimeMinutes < firstBusMinutes) {
    result.nextBusTime = firstBusTime;
    // 找第二班车
    const nextNext = calculateNextBusInInterval(currentTimeMinutes, firstBusMinutes, firstBusMinutes + (lastBusMinutes - firstBusMinutes), intervals, firstBusMinutes);
    result.nextNextBusTime = nextNext;
    return result;
  }

  // 如果当前时间晚于末班
  if (currentTimeMinutes > lastBusMinutes) {
    return result;
  }

  // 在运营时间内，遍历所有区间找上班时间
  for (const interval of intervals) {
    const startMinutes = TimeUtils.timeToMinutes(interval.startTime);
    const endMinutes = TimeUtils.timeToMinutes(interval.endTime);

    if (currentTimeMinutes >= startMinutes && currentTimeMinutes <= endMinutes) {
      // 检查特殊班次
      if (interval.specialBuses && interval.specialBuses.length > 0) {
        const specialBusMinutes = interval.specialBuses.map((t: string) => TimeUtils.timeToMinutes(t)).sort((a: number, b: number) => a - b);
        
        // 找上一班
        for (let i = specialBusMinutes.length - 1; i >= 0; i--) {
          if (specialBusMinutes[i] < currentTimeMinutes) {
            result.prevBusTime = TimeUtils.minutesToTime(specialBusMinutes[i]);
            break;
          }
        }
        
        // 找下一班和下下班
        for (let i = 0; i < specialBusMinutes.length; i++) {
          if (specialBusMinutes[i] >= currentTimeMinutes) {
            result.nextBusTime = TimeUtils.minutesToTime(specialBusMinutes[i]);
            if (i + 1 < specialBusMinutes.length) {
              result.nextNextBusTime = TimeUtils.minutesToTime(specialBusMinutes[i + 1]);
            }
            break;
          }
        }
        
        if (result.nextBusTime) return result;
      }

      // 常规班次计算
      const elapsed = currentTimeMinutes - startMinutes;
      const busesElapsed = Math.floor(elapsed / interval.intervalMinutes);
      const currentBusMinutes = startMinutes + busesElapsed * interval.intervalMinutes;
      
      // 上一班
      if (busesElapsed > 0) {
        result.prevBusTime = TimeUtils.minutesToTime(currentBusMinutes - interval.intervalMinutes);
      }
      
      // 下一班
      result.nextBusTime = TimeUtils.minutesToTime(currentBusMinutes + interval.intervalMinutes);
      
      // 下下班 - 检查是否超出当前区间
      if (currentBusMinutes + 2 * interval.intervalMinutes <= endMinutes) {
        result.nextNextBusTime = TimeUtils.minutesToTime(currentBusMinutes + 2 * interval.intervalMinutes);
      } else {
        // 尝试在下一个区间找
        const nextNext = findNextBusInLaterIntervals(currentTimeMinutes, intervals, startMinutes, endMinutes, interval.intervalMinutes);
        if (nextNext) {
          result.nextNextBusTime = nextNext;
        }
      }
      
      return result;
    }
  }

  return result;
}

// 在当前区间内找下一班和下下班
function calculateNextBusInInterval(
  currentMinutes: number,
  startMinutes: number,
  endMinutes: number,
  intervals: any[],
  originalStart: number
): string | null {
  for (const interval of intervals) {
    const iStart = TimeUtils.timeToMinutes(interval.startTime);
    const iEnd = TimeUtils.timeToMinutes(interval.endTime);
    
    // 找到下一个有班车的区间
    if (iStart > startMinutes) {
      // 特殊班次
      if (interval.specialBuses && interval.specialBuses.length > 0) {
        for (const busTime of interval.specialBuses) {
          const busMinutes = TimeUtils.timeToMinutes(busTime);
          if (busMinutes >= currentMinutes) {
            return busTime;
          }
        }
      }
      
      // 常规班次
      const elapsed = currentMinutes - iStart;
      if (elapsed < 0) {
        return TimeUtils.minutesToTime(iStart);
      }
      const busesElapsed = Math.floor(elapsed / interval.intervalMinutes);
      return TimeUtils.minutesToTime(iStart + (busesElapsed + 1) * interval.intervalMinutes);
    }
  }
  return null;
}

// 在后续区间找下一班
function findNextBusInLaterIntervals(
  currentMinutes: number,
  intervals: any[],
  currentStart: number,
  currentEnd: number,
  currentInterval: number
): string | null {
  for (const interval of intervals) {
    const iStart = TimeUtils.timeToMinutes(interval.startTime);
    const iEnd = TimeUtils.timeToMinutes(interval.endTime);
    
    if (iStart > currentEnd) {
      // 特殊班次
      if (interval.specialBuses && interval.specialBuses.length > 0) {
        for (const busTime of interval.specialBuses) {
          const busMinutes = TimeUtils.timeToMinutes(busTime);
          if (busMinutes >= iStart) {
            return busTime;
          }
        }
      }
      
      // 常规班次
      return TimeUtils.minutesToTime(iStart);
    }
  }
  return null;
}

// 生成某个区间的所有班次时间
function generateDeparturesInInterval(
  startMinutes: number,
  endMinutes: number,
  intervalMinutes: number,
  specialBuses?: string[]
): number[] {
  const departures: number[] = [];
  
  // 添加特殊班次
  if (specialBuses && specialBuses.length > 0) {
    for (const busTime of specialBuses) {
      const busMinutes = TimeUtils.timeToMinutes(busTime);
      if (busMinutes >= startMinutes && busMinutes <= endMinutes) {
        departures.push(busMinutes);
      }
    }
  }
  
  // 添加常规班次
  let current = startMinutes;
  while (current <= endMinutes) {
    departures.push(current);
    current += intervalMinutes;
  }
  
  // 去重并排序
  return [...new Set(departures)].sort((a, b) => a - b);
}

// 生成所有班次时间
function generateAllDepartures(
  firstBusTime: string,
  lastBusTime: string,
  intervals: any[]
): DepartureTime[] {
  const firstMinutes = TimeUtils.timeToMinutes(firstBusTime);
  const lastMinutes = TimeUtils.timeToMinutes(lastBusTime);
  const allMinutes: number[] = [];
  
  for (const interval of intervals) {
    const startMinutes = TimeUtils.timeToMinutes(interval.startTime);
    const endMinutes = TimeUtils.timeToMinutes(interval.endTime);
    const departures = generateDeparturesInInterval(
      startMinutes,
      endMinutes,
      interval.intervalMinutes,
      interval.specialBuses
    );
    allMinutes.push(...departures);
  }
  
  // 去重并排序
  const uniqueMinutes = [...new Set(allMinutes)].sort((a, b) => a - b);
  
  return uniqueMinutes.map(minutes => ({
    time: TimeUtils.minutesToTime(minutes),
    minutes,
    isPrev: false,
    isCurrent: false,
    isNext: false,
    isNextNext: false
  }));
}

// 标记上班状态
function markDepartures(departures: DepartureTime[], currentMinutes: number): DepartureTime[] {
  let prevIndex = -1;
  let nextIndex = -1;
  
  for (let i = 0; i < departures.length; i++) {
    if (departures[i].minutes <= currentMinutes) {
      prevIndex = i;
    }
    if (departures[i].minutes > currentMinutes && nextIndex === -1) {
      nextIndex = i;
      break;
    }
  }
  
  return departures.map((d, i) => ({
    ...d,
    isPrev: i === prevIndex,
    isCurrent: d.minutes <= currentMinutes && (i === prevIndex + 1 || (prevIndex === departures.length - 1 && i === prevIndex)),
    isNext: i === nextIndex,
    isNextNext: i === nextIndex + 1
  }));
}

// 获取下一班车信息
export function getNextBus(
  transportType: TransportType,
  currentTime: string,
  currentDate: Date = new Date()
): NextBusInfo | null {
  const config = getTransportConfig(transportType);
  if (!config) return null;

  const currentTimeMinutes = TimeUtils.timeToMinutes(currentTime);
  const dayOfWeek = TimeUtils.getCurrentDayOfWeek(currentDate);
  const dayType = TimeUtils.getDayType(dayOfWeek);
  const shiftType = TimeUtils.getShiftType(currentTimeMinutes);

  // 班车/公交/摩的处理
  const schedule = config.routes.find(
    (r: any) => r.dayType === dayType && r.shiftType === shiftType
  );

  // 如果没有找到时刻表
  if (!schedule) {
    return {
      transportType,
      transportName: config.name,
      price: config.price,
      note: config.note,
      currentTime,
      currentMinutes: currentTimeMinutes,
      allDepartures: [],
      prevBusTime: '-',
      nextBusTime: '-',
      nextNextBusTime: '-',
      waitMinutes: 0,
      isOperating: false,
      status: 'no-service'
    };
  }

  const allDepartures = generateAllDepartures(
    schedule.firstBusTime,
    schedule.lastBusTime,
    schedule.intervals
  );
  
  const markedDepartures = markDepartures(allDepartures, currentTimeMinutes);

  // 找到上一班、下一班、下下班
  let prevBusTime = '-';
  let nextBusTime = '-';
  let nextNextBusTime = '-';
  let waitMinutes = 0;
  
  for (let i = 0; i < markedDepartures.length; i++) {
    if (markedDepartures[i].isPrev) {
      prevBusTime = markedDepartures[i].time;
    }
    if (markedDepartures[i].isNext) {
      nextBusTime = markedDepartures[i].time;
      waitMinutes = Math.round(markedDepartures[i].minutes - currentTimeMinutes);
    }
    if (markedDepartures[i].isNextNext) {
      nextNextBusTime = markedDepartures[i].time;
    }
  }

  // 如果当前时间无车
  if (!nextBusTime) {
    return {
      transportType,
      transportName: config.name,
      price: config.price,
      note: config.note,
      currentTime,
      currentMinutes: currentTimeMinutes,
      allDepartures: markedDepartures,
      prevBusTime: '-',
      nextBusTime: '已停运',
      nextNextBusTime: '-',
      waitMinutes: 0,
      isOperating: false,
      status: 'off-duty'
    };
  }

  return {
    transportType,
    transportName: config.name,
    price: config.price,
    note: config.note,
    currentTime,
    currentMinutes: currentTimeMinutes,
    allDepartures: markedDepartures,
    prevBusTime,
    nextBusTime,
    nextNextBusTime,
    waitMinutes,
    isOperating: true,
    status: 'ok'
  };
}

// 获取所有交通方式的下一班车信息
export function getAllNextBuses(currentTime: string, currentDate: Date = new Date()): NextBusInfo[] {
  const types = [
    TransportType.SHUTTLE_B,
    TransportType.SHUTTLE_C,
    TransportType.BUS_533,
    TransportType.MOTORCYCLE,
    TransportType.SHARED_BICYCLE,
    TransportType.SHARED_ELECTRIC_SCOOTER
  ];

  return types
    .map(type => getNextBus(type, currentTime, currentDate))
    .filter((info): info is NextBusInfo => info !== null);
}
