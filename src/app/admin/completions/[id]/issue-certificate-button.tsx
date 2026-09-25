"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Award } from "lucide-react";

import { issueCertificate } from "./actions";

type Props = {
  enrollmentId: string;
};

export default function IssueCertificateButton({
  enrollmentId,
}: Props) {
const router = useRouter();
  const [error, setError] = useState<
    string | null
  >(null);

  const [isPending, startTransition] =
    useTransition();

  function handleIssueCertificate() {
    setError(null);

    startTransition(async () => {
      const result = await issueCertificate(
        enrollmentId
      );

      if (!result.success) {
        setError(
          result.error ??
            "Certificate could not be issued."
        );

        return;
      }
router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        className="button"
        disabled={isPending}
        onClick={handleIssueCertificate}
      >
        <Award
          size={18}
          style={{
            verticalAlign: "middle",
            marginRight: "8px",
          }}
        />

        {isPending
          ? "Issuing Certificate..."
          : "Issue Certificate"}
      </button>

      {error && (
        <p
          style={{
            marginTop: "12px",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}