import {
  TransportType,
  DayType,
  ShiftType,
  NextBusInfo
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

  // 摩的处理 - 随时可乘坐
  if (transportType === TransportType.MOTORCYCLE) {
    return {
      transportType,
      transportName: config.name,
      price: config.price,
      currentTime,
      prevBusTime: '-',
      nextBusTime: '随时',
      nextNextBusTime: '-',
      waitMinutes: 0,
      isOperating: true,
      status: 'ok'
    };
  }

  // 班车/公交处理
  const schedule = config.routes.find(
    (r: any) => r.dayType === dayType && r.shiftType === shiftType
  );

  // 如果没有找到时刻表
  if (!schedule) {
    return {
      transportType,
      transportName: config.name,
      price: config.price,
      currentTime,
      prevBusTime: '-',
      nextBusTime: '-',
      nextNextBusTime: '-',
      waitMinutes: 0,
      isOperating: false,
      status: 'no-service'
    };
  }

  const busTimes = calculateBusTimes(
    currentTimeMinutes,
    schedule.firstBusTime,
    schedule.lastBusTime,
    schedule.intervals
  );

  // 如果当前时间无车
  if (!busTimes.nextBusTime) {
    return {
      transportType,
      transportName: config.name,
      price: config.price,
      currentTime,
      prevBusTime: '-',
      nextBusTime: '已停运',
      nextNextBusTime: '-',
      waitMinutes: 0,
      isOperating: false,
      status: 'off-duty'
    };
  }

  const nextBusMinutes = TimeUtils.timeToMinutes(busTimes.nextBusTime);
  const waitMinutes = Math.max(0, nextBusMinutes - currentTimeMinutes);

  return {
    transportType,
    transportName: config.name,
    price: config.price,
    currentTime,
    prevBusTime: busTimes.prevBusTime || '-',
    nextBusTime: busTimes.nextBusTime,
    nextNextBusTime: busTimes.nextNextBusTime || '-',
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
    TransportType.MOTORCYCLE
  ];

  return types
    .map(type => getNextBus(type, currentTime, currentDate))
    .filter((info): info is NextBusInfo => info !== null);
}
