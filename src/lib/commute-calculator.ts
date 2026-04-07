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

// 计算下一班车时间
function calculateNextBusTime(
  currentTimeMinutes: number,
  firstBusTime: string,
  lastBusTime: string,
  intervals: any[]
): string | null {
  const firstBusMinutes = TimeUtils.timeToMinutes(firstBusTime);
  const lastBusMinutes = TimeUtils.timeToMinutes(lastBusTime);

  // 如果当前时间早于首班，返回首班时间
  if (currentTimeMinutes < firstBusMinutes) {
    return firstBusTime;
  }

  // 如果当前时间晚于末班，返回null（无车）
  if (currentTimeMinutes > lastBusMinutes) {
    return null;
  }

  // 在运营时间内，计算下一班车
  for (const interval of intervals) {
    const startMinutes = TimeUtils.timeToMinutes(interval.startTime);
    const endMinutes = TimeUtils.timeToMinutes(interval.endTime);

    // 如果当前时间在此时间区间内
    if (currentTimeMinutes >= startMinutes && currentTimeMinutes <= endMinutes) {
      // 检查是否有特殊班次
      if (interval.specialBuses && interval.specialBuses.length > 0) {
        for (const busTime of interval.specialBuses) {
          const busMinutes = TimeUtils.timeToMinutes(busTime);
          if (busMinutes >= currentTimeMinutes) {
            return busTime;
          }
        }
      }

      // 计算常规班次
      const elapsed = currentTimeMinutes - startMinutes;
      const busesElapsed = Math.floor(elapsed / interval.intervalMinutes);
      const nextBusMinutes = startMinutes + (busesElapsed + 1) * interval.intervalMinutes;

      // 如果下一班车超出区间，检查下一个区间
      if (nextBusMinutes > endMinutes) {
        continue;
      }

      return TimeUtils.minutesToTime(nextBusMinutes);
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
      nextBusTime: '随时',
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
      nextBusTime: '-',
      waitMinutes: 0,
      isOperating: false,
      status: 'no-service'
    };
  }

  const nextBusTime = calculateNextBusTime(
    currentTimeMinutes,
    schedule.firstBusTime,
    schedule.lastBusTime,
    schedule.intervals
  );

  // 如果当前时间无车
  if (!nextBusTime) {
    return {
      transportType,
      transportName: config.name,
      price: config.price,
      currentTime,
      nextBusTime: '已停运',
      waitMinutes: 0,
      isOperating: false,
      status: 'off-duty'
    };
  }

  const nextBusMinutes = TimeUtils.timeToMinutes(nextBusTime);
  const waitMinutes = Math.max(0, nextBusMinutes - currentTimeMinutes);

  return {
    transportType,
    transportName: config.name,
    price: config.price,
    currentTime,
    nextBusTime,
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
