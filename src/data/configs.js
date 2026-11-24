const today = new Date();
const dateOffset = (days) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const businessConfigs = {
  salon: {
    id: "salon",
    name: "Студио за красота",
    shortName: "Салон",
    icon: "✦",
    description: "Записване на часове при специалисти",
    resourceLabel: "Специалист",
    unitLabel: "час",
    duration: 60,
    capacity: 1,
    opening: "09:00",
    closing: "18:00",
    step: 30,
    services: ["Подстригване", "Маникюр", "Козметична процедура"],
    resources: [
      { id: "stylist-1", name: "Мария Иванова", role: "Фризьор" },
      { id: "stylist-2", name: "Елена Петрова", role: "Маникюрист" },
      { id: "stylist-3", name: "Николай Георгиев", role: "Козметик" }
    ]
  },
  clinic: {
    id: "clinic",
    name: "Медицински кабинет",
    shortName: "Кабинет",
    icon: "✚",
    description: "Прегледи и консултации по график",
    resourceLabel: "Лекар",
    unitLabel: "преглед",
    duration: 30,
    capacity: 1,
    opening: "08:00",
    closing: "16:00",
    step: 30,
    services: ["Първичен преглед", "Контролен преглед", "Консултация"],
    resources: [
      { id: "doctor-1", name: "Д-р Анна Николова", role: "Общопрактикуващ лекар" },
      { id: "doctor-2", name: "Д-р Петър Димов", role: "Кардиолог" }
    ]
  },
  restaurant: {
    id: "restaurant",
    name: "Ресторант Градина",
    shortName: "Ресторант",
    icon: "⌂",
    description: "Резервации на маси за избран час",
    resourceLabel: "Маса",
    unitLabel: "резервация",
    duration: 90,
    capacity: 1,
    opening: "12:00",
    closing: "23:00",
    step: 30,
    services: ["Обяд", "Вечеря", "Специален повод"],
    resources: [
      { id: "table-1", name: "Маса 1 · 2 места", role: "Капацитет 2" },
      { id: "table-2", name: "Маса 2 · 4 места", role: "Капацитет 4" },
      { id: "table-3", name: "Маса 3 · 6 места", role: "Капацитет 6" },
      { id: "table-4", name: "Маса 4 · 4 места", role: "Капацитет 4" }
    ]
  }
};

export const initialBookings = [
  {
    id: "BK-1001", businessId: "salon", resourceId: "stylist-1",
    customer: "Ива Димитрова", service: "Подстригване",
    date: dateOffset(0), time: "10:00", duration: 60, people: 1, status: "confirmed"
  },
  {
    id: "BK-1002", businessId: "salon", resourceId: "stylist-2",
    customer: "Мила Стоянова", service: "Маникюр",
    date: dateOffset(0), time: "13:00", duration: 60, people: 1, status: "confirmed"
  },
  {
    id: "BK-1003", businessId: "clinic", resourceId: "doctor-1",
    customer: "Георги Тодоров", service: "Първичен преглед",
    date: dateOffset(0), time: "09:30", duration: 30, people: 1, status: "confirmed"
  },
  {
    id: "BK-1004", businessId: "restaurant", resourceId: "table-2",
    customer: "Семейство Иванови", service: "Обяд",
    date: dateOffset(0), time: "19:00", duration: 90, people: 4, status: "confirmed"
  }
];

export const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const toTime = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

export const makeId = () => `BK-${Math.floor(1000 + Math.random() * 9000)}`;
