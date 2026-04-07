import { TransportConfig, TransportType, DayType, ShiftType } from '@/types/commute';

// 交通配置数据
export const TRANSPORT_CONFIGS: TransportConfig[] = [
  {
    id: TransportType.SHUTTLE_B,
    name: 'B线班车（免费）',
    price: 0,
    type: 'shuttle',
    routes: [
      // B线 早班 - 周一至周五
      {
        dayType: DayType.WEEKDAY,
        shiftType: ShiftType.MORNING,
        firstBusTime: '07:30',
        lastBusTime: '09:15',
        intervals: [
          {
            startTime: '07:30',
            endTime: '09:00',
            intervalMinutes: 8
          },
          {
            startTime: '09:00',
            endTime: '09:15',
            intervalMinutes: 8,
            specialBuses: ['09:07', '09:15']
          }
        ]
      },
      // B线 晚班 - 周一至周五
      {
        dayType: DayType.WEEKDAY,
        shiftType: ShiftType.EVENING,
        firstBusTime: '17:30',
        lastBusTime: '21:00',
        intervals: [
          {
            startTime: '17:30',
            endTime: '19:30',
            intervalMinutes: 8
          },
          {
            startTime: '19:30',
            endTime: '21:00',
            intervalMinutes: 30
          }
        ]
      },
      // B线 早班 - 周六
      {
        dayType: DayType.SATURDAY,
        shiftType: ShiftType.MORNING,
        firstBusTime: '07:30',
        lastBusTime: '09:02',
        intervals: [
          {
            startTime: '07:30',
            endTime: '09:02',
            intervalMinutes: 23
          }
        ]
      },
      // B线 晚班 - 周六
      {
        dayType: DayType.SATURDAY,
        shiftType: ShiftType.EVENING,
        firstBusTime: '17:30',
        lastBusTime: '19:30',
        intervals: [
          {
            startTime: '17:30',
            endTime: '19:30',
            intervalMinutes: 23
          }
        ]
      }
    ]
  },
  {
    id: TransportType.SHUTTLE_C,
    name: 'C线班车（免费）',
    price: 0,
    type: 'shuttle',
    routes: [
      // C线 早班 - 周一至周五
      {
        dayType: DayType.WEEKDAY,
        shiftType: ShiftType.MORNING,
        firstBusTime: '07:30',
        lastBusTime: '09:15',
        intervals: [
          {
            startTime: '07:30',
            endTime: '09:06',
            intervalMinutes: 8
          },
          {
            startTime: '09:06',
            endTime: '09:15',
            intervalMinutes: 9
          }
        ]
      },
      // C线 晚班 - 周一至周五
      {
        dayType: DayType.WEEKDAY,
        shiftType: ShiftType.EVENING,
        firstBusTime: '17:30',
        lastBusTime: '21:30',
        intervals: [
          {
            startTime: '17:30',
            endTime: '18:50',
            intervalMinutes: 8
          },
          {
            startTime: '18:50',
            endTime: '19:00',
            intervalMinutes: 10
          },
          {
            startTime: '19:00',
            endTime: '19:30',
            intervalMinutes: 15
          },
          {
            startTime: '19:30',
            endTime: '21:30',
            intervalMinutes: 40
          }
        ]
      },
      // C线 早班 - 周六
      {
        dayType: DayType.SATURDAY,
        shiftType: ShiftType.MORNING,
        firstBusTime: '07:30',
        lastBusTime: '09:10',
        intervals: [
          {
            startTime: '07:30',
            endTime: '09:10',
            intervalMinutes: 20
          }
        ]
      },
      // C线 晚班 - 周六
      {
        dayType: DayType.SATURDAY,
        shiftType: ShiftType.EVENING,
        firstBusTime: '17:30',
        lastBusTime: '19:30',
        intervals: [
          {
            startTime: '17:30',
            endTime: '19:30',
            intervalMinutes: 20
          }
        ]
      }
    ]
  },
  {
    id: TransportType.BUS_533,
    name: '533路公交（2元）',
    price: 2,
    type: 'bus',
    routes: [
      // 533路 - 每天运营
      {
        dayType: DayType.WEEKDAY,
        shiftType: ShiftType.MORNING,
        firstBusTime: '06:00',
        lastBusTime: '21:30',
        intervals: [
          {
            startTime: '06:00',
            endTime: '21:30',
            intervalMinutes: 10
          }
        ]
      },
      {
        dayType: DayType.WEEKDAY,
        shiftType: ShiftType.EVENING,
        firstBusTime: '06:00',
        lastBusTime: '21:30',
        intervals: [
          {
            startTime: '06:00',
            endTime: '21:30',
            intervalMinutes: 10
          }
        ]
      },
      {
        dayType: DayType.SATURDAY,
        shiftType: ShiftType.MORNING,
        firstBusTime: '06:00',
        lastBusTime: '21:30',
        intervals: [
          {
            startTime: '06:00',
            endTime: '21:30',
            intervalMinutes: 10
          }
        ]
      },
      {
        dayType: DayType.SATURDAY,
        shiftType: ShiftType.EVENING,
        firstBusTime: '06:00',
        lastBusTime: '21:30',
        intervals: [
          {
            startTime: '06:00',
            endTime: '21:30',
            intervalMinutes: 10
          }
        ]
      }
    ]
  },
  {
    id: TransportType.MOTORCYCLE,
    name: '摩的三轮车（约6元）',
    price: 6,
    type: 'motorcycle',
    routes: [] // 摩的不需要班次，随时有
  }
];

// 根据交通方式ID获取配置
export function getTransportConfig(id: TransportType): TransportConfig | undefined {
  return TRANSPORT_CONFIGS.find(config => config.id === id);
}

// 获取所有交通方式选项
export function getAllTransportConfigs(): TransportConfig[] {
  return TRANSPORT_CONFIGS;
}
