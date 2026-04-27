import { KitchenOrder } from "@/types/kitchen";

export const mockKitchenOrders: KitchenOrder[] = [
  {
    id: "0046",
    tableId: 3,
    status: "pendiente",
    items: [
      { quantity: 2, name: "Milanesa napolitana", price: 8500 },
      { quantity: 1, name: "Ensalada mixta", price: 3200 },
      { quantity: 2, name: "Papas fritas", price: 4800 },
    ],
    createdAt: "13:05",
  },
  {
    id: "0047",
    tableId: 7,
    status: "pendiente",
    items: [
      { quantity: 1, name: "Bife de chorizo", price: 7200 },
      { quantity: 2, name: "Vino tinto copa", price: 3000 },
    ],
    note: "El bife bien cocido por favor",
    createdAt: "13:10",
  },
  {
    id: "0048",
    tableId: 1,
    status: "preparacion",
    items: [
      { quantity: 3, name: "Pizza mozzarella", price: 5500 },
      { quantity: 2, name: "Cerveza artesanal", price: 6300 },
    ],
    createdAt: "12:50",
    startedAt: "13:00",
  },
  {
    id: "0049",
    tableId: 5,
    status: "preparacion",
    items: [
      { quantity: 2, name: "Ravioles al pesto", price: 14400 },
      { quantity: 1, name: "Tiramisú", price: 5000 },
    ],
    note: "Cumpleaños - traer postre con velita",
    createdAt: "12:45",
    startedAt: "12:55",
  },
  {
    id: "0043",
    tableId: 2,
    status: "servido",
    items: [
      { quantity: 2, name: "Lomo completo", price: 17000 },
      { quantity: 1, name: "Flan con dulce de leche", price: 3600 },
    ],
    createdAt: "11:30",
    startedAt: "11:40",
    finishedAt: "12:10",
  },
  {
    id: "0044",
    tableId: 6,
    status: "servido",
    items: [
      { quantity: 1, name: "Empanadas x6", price: 3200 },
      { quantity: 2, name: "Agua con gas", price: 1200 },
    ],
    createdAt: "11:45",
    startedAt: "11:50",
    finishedAt: "12:15",
  },
];