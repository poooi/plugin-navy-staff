import _ from 'lodash'

// ship types dated 20170106, beginning with id=1
// const shipTypes = ["海防艦", "駆逐艦", "軽巡洋艦", "重雷装巡洋艦",
// "重巡洋艦", "航空巡洋艦", "軽空母", "戦艦", "戦艦", "航空戦艦", "正規空母",
// "超弩級戦艦", "潜水艦", "潜水空母", "補給艦", "水上機母艦", "揚陸艦", "装甲空母",
// "工作艦", "潜水母艦", "練習巡洋艦", "補給艦"]
// attention, SHIP_TYPES uses api_id

export const SHIP_TYPES = [
  {
    name: 'DD',
    id: [2],
  },
  {
    name: 'CL',
    id: [3, 4, 21],
  },
  {
    name: 'CA',
    id: [5, 6],
  },
  {
    name: 'BB',
    id: [8, 9, 10, 12],
  },
  {
    name: 'CV',
    id: [7, 11, 18],
  },
  {
    name: 'SS',
    id: [13, 14],
  },
  {
    name: 'Others',
    id: [1, 15, 16, 17, 19, 20, 22],
  },
]

export const SHIP_TYPES_REVERSED = _(SHIP_TYPES)
  .flatMap(({ id }, index) =>
    _(id)
      .map(type => [type, index])
      .value(),
  )
  .fromPairs()
  .value()
