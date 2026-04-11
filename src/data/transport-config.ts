import { TransportConfig, TransportType, DayType, ShiftType } from '@/types/commute';

// 交通配置数据
export const TRANSPORT_CONFIGS: TransportConfig[] = [
  {
    id: TransportType.SHUTTLE_B,
    name: 'B线班车',
    price: '免费',
    type: 'shuttle',
    icon: '🚌',
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
    name: 'C线班车',
    price: '免费',
    type: 'shuttle',
    icon: '🚌',
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
    name: '533路公交',
    price: '2元',
    type: 'bus',
    icon: '🚌',
    note: '约15分钟/班',
    routes: [
      // 533路 - 每天运营
      {
        dayType: DayType.WEEKDAY,
        shiftType: ShiftType.MORNING,
        firstBusTime: '06:00',
        lastBusTime: '19:30',
        intervals: [
          {
            startTime: '06:00',
            endTime: '19:30',
            intervalMinutes: 15
          }
        ]
      },
      {
        dayType: DayType.WEEKDAY,
        shiftType: ShiftType.EVENING,
        firstBusTime: '06:00',
        lastBusTime: '19:30',
        intervals: [
          {
            startTime: '06:00',
            endTime: '19:30',
            intervalMinutes: 15
          }
        ]
      },
      {
        dayType: DayType.SATURDAY,
        shiftType: ShiftType.MORNING,
        firstBusTime: '06:00',
        lastBusTime: '19:30',
        intervals: [
          {
            startTime: '06:00',
            endTime: '19:30',
            intervalMinutes: 15
          }
        ]
      },
      {
        dayType: DayType.SATURDAY,
        shiftType: ShiftType.EVENING,
        firstBusTime: '06:00',
        lastBusTime: '19:30',
        intervals: [
          {
            startTime: '06:00',
            endTime: '19:30',
            intervalMinutes: 15
          }
        ]
      },
      {
        dayType: DayType.SUNDAY,
        shiftType: ShiftType.MORNING,
        firstBusTime: '06:00',
        lastBusTime: '19:30',
        intervals: [
          {
            startTime: '06:00',
            endTime: '19:30',
            intervalMinutes: 15
          }
        ]
      },
      {
        dayType: DayType.SUNDAY,
        shiftType: ShiftType.EVENING,
        firstBusTime: '06:00',
        lastBusTime: '19:30',
        intervals: [
          {
            startTime: '06:00',
            endTime: '19:30',
            intervalMinutes: 15
          }
        ]
      }
    ]
  },
  {
    id: TransportType.MOTORCYCLE,
    name: '摩的三轮车',
    price: '6块',
    type: 'motorcycle',
    icon: '🛺'
  },
  {
    id: TransportType.SHARED_BICYCLE,
    name: '共享自行车',
    price: '30分钟内1.5元',
    type: 'bicycle',
    icon: '🚲'
  },
  {
    id: TransportType.SHARED_ELECTRIC_SCOOTER,
    name: '共享电瓶车',
    price: '20分钟内2.5元',
    type: 'electric-scooter',
    icon: '🛵'
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
