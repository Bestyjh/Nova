"use client";

import { Printer } from "lucide-react";

export default function PrintCertificateButton() {
  return (
    <button
      type="button"
      className="button compact"
      onClick={() => window.print()}
    >
      <Printer
        size={18}
        style={{
          verticalAlign: "middle",
          marginRight: "8px",
        }}
      />
      Print / Save as PDF
    </button>
  );
}