type ContentBlock = {
  type?: string;
  text?: string;
  url?: string;
  label?: string;
};

type StructuredContent = {
  version?: number;
  blocks?: ContentBlock[];
};

type LessonContentProps = {
  content: unknown;
};

export default function LessonContent({
  content,
}: LessonContentProps) {
  if (!content) {
    return (
      <p>No lesson content has been added yet.</p>
    );
  }

  // Backward compatibility:
  // existing lessons may contain a plain string
  // with <br> tags.
  if (typeof content === "string") {
    const text = content.replace(
      /<br\s*\/?>/gi,
      "\n"
    );

    return (
      <div
        style={{
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
        }}
      >
        {text}
      </div>
    );
  }

  if (
    typeof content !== "object" ||
    Array.isArray(content)
  ) {
    return <p>Unsupported lesson content.</p>;
  }

  const structured =
    content as StructuredContent;

  if (!Array.isArray(structured.blocks)) {
    return <p>Unsupported lesson content.</p>;
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "18px",
        lineHeight: 1.7,
      }}
    >
      {structured.blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <h3 key={index}>
                {block.text ?? ""}
              </h3>
            );

          case "paragraph":
            return (
              <p key={index}>
                {block.text ?? ""}
              </p>
            );

          case "callout":
            return (
              <aside
                key={index}
                style={{
                  padding: "16px",
                  borderLeft:
                    "4px solid currentColor",
                }}
              >
                {block.text ?? ""}
              </aside>
            );

          case "link":
            if (!block.url) {
              return null;
            }

            return (
              <p key={index}>
                <a
                  href={block.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {block.label ||
                    block.text ||
                    block.url}
                </a>
              </p>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}