// 交通方式枚举
export enum TransportType {
  SHUTTLE_B = 'shuttle_b', // B线班车
  SHUTTLE_C = 'shuttle_c', // C线班车
  BUS_533 = 'bus_533',     // 533路公交
  MOTORCYCLE = 'motorcycle' // 摩的三轮车
}

// 天类型
export enum DayType {
  WEEKDAY = 'weekday',     // 周一至周五
  SATURDAY = 'saturday'    // 周六
}

// 班次类型
export enum ShiftType {
  MORNING = 'morning',     // 早班
  EVENING = 'evening'      // 晚班
}

// 班车/公交配置
export interface TransportConfig {
  id: TransportType;
  name: string;            // 显示名称
  price: number;           // 费用
  type: 'shuttle' | 'bus' | 'motorcycle'; // 交通类型
  routes: RouteSchedule[]; // 班次时刻表
  note?: string;           // 备注信息
}

// 路线班次时刻表
export interface RouteSchedule {
  dayType: DayType;        // 天类型
  shiftType: ShiftType;    // 班次类型
  firstBusTime: string;    // 首班发车时间 HH:mm
  lastBusTime: string;     // 末班发车时间 HH:mm
  intervals: IntervalRule[]; // 发车间隔规则
}

// 发车间隔规则（支持多段不同间隔）
export interface IntervalRule {
  startTime: string;       // 生效开始时间 HH:mm
  endTime: string;         // 生效结束时间 HH:mm
  intervalMinutes: number; // 发车间隔（分钟）
  specialBuses?: string[]; // 特定班次（如"9:07, 9:15"）
}

// 下一班信息
export interface NextBusInfo {
  transportType: TransportType;
  transportName: string;
  price: number;
  note?: string;               // 备注信息
  currentTime: string;          // 当前时间
  prevBusTime: string;         // 上一班车时间 HH:mm
  nextBusTime: string;         // 下一班车时间 HH:mm
  nextNextBusTime: string;     // 下下班时间 HH:mm
  waitMinutes: number;         // 等车时间（分钟）
  isOperating: boolean;        // 是否在运营中
  status: 'ok' | 'no-service' | 'off-duty'; // 状态
}
