"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Ticket } from "@/components/pos/types";
import { toast } from "react-hot-toast";

export default function PrintReceiptPage() {
  const { id } = useParams();
  const router = useRouter();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function loadOrder() {
      try {
        if (!id) throw new Error("Order ID missing");

        const res = await fetch(`/api/orders/${id}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to load order");

        const data = await res.json();
        setTicket(data);
      } catch (err: any) {
        setError(err.message || "Failed to load receipt");
      }
    }

    loadOrder();
  }, [id]);

  useEffect(() => {
    if (!ticket) return;

    const isIframe =
      typeof window !== "undefined" &&
      window.location.search.includes("iframe=true");

    toast.success("Sending to printer…", {
      id: "print-start",
      duration: 2000,
    });

    const timer = setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.error("Print error:", e);
        toast.error("Print failed");
      }

      if (isIframe) {
        setTimeout(() => {
          window.parent.postMessage({ printed: true }, "*");
        }, 300);
        toast.success("Print completed", { id: "print-done", duration: 2000 });
        return;
      }

      setTimeout(() => {
        router.push("/pos?clear=true");
      }, 500);
    }, 300);

    return () => clearTimeout(timer);
  }, [ticket, router]);

  if (error) {
    return (
      <div className="p-8">
        <h2 className="text-red-600 font-bold mb-2">Error</h2>
        <p className="text-gray-700">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded"
          onClick={() => router.push("/pos")}
        >
          Back to POS
        </button>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center text-gray-600">Loading receipt…</div>
    );
  }

  const subtotal = ticket.items.reduce((a, i) => a + i.price * i.qty, 0);
  const total = subtotal - (ticket.discount || 0);

  return (
    <div id="invoice-modal" className="p-6 print:p-0">
      <div
        id="invoice-content"
        className="bg-white mx-auto font-mono text-[10px] leading-tight print:text-[9px]"
        style={{
          width: "42mm",        // <--- 42mm inner width
          padding: "2mm 1mm",   // small padding top/bottom + 1mm sides
        }}
      >
        {/* Header */}
        <div className="text-center mb-2">
          <h2 className="font-bold text-[16px] leading-none mb-1">
            Kem Cho Momos
          </h2>
          <p className="text-[7px] leading-tight break-words">
            Krishna complex, Dungri road,
            Dharasana, Valsad, Gujarat 396375
          </p>
        </div>

        {/* Date / Time / Order */}
        <div className="border-t border-dotted border-gray-400 mt-1 pt-1 text-[9px] mb-2">
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
          {/* <div className="flex justify-between">
            <span>Order #:</span>
            <span className="font-bold break-all max-w-[26mm] text-right">
              {ticket._id}
            </span>
          </div> */}
          {/* <div className="flex justify-between">
            <span>Customer:</span>
            <span className="max-w-[26mm] text-right truncate">
              {ticket.customer || "Walk-in"}
            </span>
          </div> */}
        </div>

        {/* Items */}
        <table className="w-full text-[9px] mb-2">
          <thead>
            <tr className="border-t border-b border-dotted border-gray-400">
              <th className="py-[1px] text-left col-qty">Qty</th>
              <th className="py-[1px] text-left col-item">Item</th>
              <th className="py-[1px] text-right col-amt">Amt</th>
            </tr>
          </thead>
          <tbody>
            {ticket.items.map((item, idx) => (
              <tr key={idx} className="align-top">
                <td className="col-qty py-[1px]">{item.qty}</td>
                <td className="col-item py-[1px] pr-[1px] break-words">
                  {item.name}
                </td>
                <td className="col-amt py-[1px] text-right whitespace-nowrap">
                  {(item.price * item.qty).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        {ticket.discount > 0 && (
          <div className="border-t border-dotted border-gray-400 pt-1 text-[9px] space-y-[2px] mb-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹ {subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Discount</span>
              <span>- ₹ {ticket.discount.toFixed(2)}</span>
            </div>
          </div>
        )}


        <div className="flex justify-between font-bold text-[12px] border-t border-black pt-1">
          <span>Total</span>
          <span>₹ {total.toFixed(2)}</span>
        </div>

        {/* Footer */}
        <div className="text-center text-[9px] mt-2 pt-1 border-t border-dotted border-gray-400">
          <p className="font-semibold leading-tight">
            Thank you for visiting!
          </p>
          <p>Visit again 🙂</p>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: 58mm auto;
            margin: 0;
          }

          html, body {
            margin: 0;
            padding: 0;
          }

          body * {
            visibility: hidden;
          }

          #invoice-content,
          #invoice-content * {
            visibility: visible;
          }

          #invoice-content {
            position: static;
            width: 42mm !important;  /* safe inner width */
            margin: 0;
            padding: 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          .col-qty {
            width: 5mm;
          }

          .col-item {
            width: 25mm;
          }

          .col-amt {
            width: 10mm;
            text-align: right;
            white-space: nowrap;
          }

          #invoice-content,
          #invoice-content * {
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
        }
      `}</style>
    </div>
  );
}