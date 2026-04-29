"use client";

import { useRef, useState } from "react";
import { Clock, Users, Printer, UtensilsCrossed, CreditCard } from "lucide-react";
import { mockTickets } from "@/utils/cashierMockData";

type Ticket = (typeof mockTickets)[number];

export default function TicketsTab() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket>(mockTickets[0]);
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket #${selectedTicket.id}</title>
          <style>
            body { font-family: monospace; padding: 20px; font-size: 13px; }
            h2 { text-align: center; margin-bottom: 4px; }
            p { margin: 2px 0; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; }
            .total { font-weight: bold; font-size: 15px; }
            .center { text-align: center; color: #555; }
          </style>
        </head>
        <body>
          <h2>GastroFlow</h2>
          <p class="center">Mesa ${selectedTicket.tableId} · ${selectedTicket.persons} personas</p>
          <p class="center">${selectedTicket.closedAt}</p>
          <div class="divider"></div>
          ${selectedTicket.items
            .map(
              (item) => `
            <div class="row">
              <span>${item.quantity}x ${item.name}</span>
              <span>$${item.price.toLocaleString("es-AR")}</span>
            </div>`
            )
            .join("")}
          <div class="divider"></div>
          <div class="row"><span>Subtotal</span><span>$${selectedTicket.subtotal.toLocaleString("es-AR")}</span></div>
          <div class="row"><span>IVA (15%)</span><span>$${selectedTicket.iva.toLocaleString("es-AR")}</span></div>
          <div class="divider"></div>
          <div class="row total"><span>Total</span><span>$${selectedTicket.total.toLocaleString("es-AR")}</span></div>
          <div class="divider"></div>
          <p class="center">¡Gracias por su visita!</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {/* Lista de tickets */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Tickets del día
        </p>
        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
          {mockTickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={`w-full text-left rounded-xl border p-3 transition-all hover:shadow-sm ${
                selectedTicket.id === ticket.id
                  ? "border-orange-300 bg-orange-50"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-800">
                  #{ticket.id}
                </span>
                <span className="text-xs font-semibold text-gray-700">
                  ${ticket.total.toLocaleString("es-AR")}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <UtensilsCrossed size={10} />
                  Mesa {ticket.tableId}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {ticket.closedAt}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={10} />
                  {ticket.persons} pers.
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detalle del ticket */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col">
        <div ref={printRef}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Ticket #{selectedTicket.id}
              </p>
              <p className="text-xs text-gray-400">Mesa {selectedTicket.tableId}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {selectedTicket.closedAt}
              </span>
              <span className="flex items-center gap-1">
                <Users size={11} />
                {selectedTicket.persons} pers.
              </span>
            </div>
          </div>

          {/* Método de pago */}
          <div className="flex items-center gap-2 mb-4 bg-gray-50 rounded-xl px-3 py-2">
            <CreditCard size={13} className="text-gray-400" />
            <span className="text-xs text-gray-500">
              Método de pago:{" "}
              <span className="font-semibold text-gray-700 capitalize">
                {selectedTicket.paymentMethod}
              </span>
            </span>
          </div>

          {/* Items */}
          <div className="flex-1 space-y-2 mb-4">
            {selectedTicket.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-600">
                <span>
                  <span className="font-medium text-gray-700">{item.quantity}</span>{" "}
                  {item.name}
                </span>
                <span>${item.price.toLocaleString("es-AR")}</span>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="border-t border-gray-100 pt-3 space-y-1.5 mb-4">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Subtotal</span>
              <span>${selectedTicket.subtotal.toLocaleString("es-AR")}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>IVA (15%)</span>
              <span>${selectedTicket.iva.toLocaleString("es-AR")}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-800">
              <span>Total</span>
              <span>${selectedTicket.total.toLocaleString("es-AR")}</span>
            </div>
          </div>
        </div>

        {/* Botón imprimir */}
        <button
          onClick={handlePrint}
          className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors mt-auto"
        >
          <Printer size={15} />
          Imprimir ticket
        </button>
      </div>
    </div>
  );
}