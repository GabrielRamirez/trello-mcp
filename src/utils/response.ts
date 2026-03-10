export function textResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function errorResult(msg: string) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: msg }],
  };
}

/**
 * Standardized error handler for tool callbacks.
 * Detects permission/plan errors (401/403) and returns a friendly message.
 */
export function handleToolError(err: unknown) {
  if (err instanceof Error) {
    const msg = err.message;
    // Detect Trello plan/permission restrictions
    if (
      msg.includes("401") ||
      msg.includes("403") ||
      msg.includes("unauthorized") ||
      msg.includes("not found")
    ) {
      // Check if it's a feature gated behind a paid plan
      if (msg.includes("403")) {
        return errorResult(
          `Access denied: This feature may require a Trello Premium or Enterprise plan, ` +
          `or your token may lack the necessary permissions.\n\nDetails: ${msg}`,
        );
      }
    }
    return errorResult(msg);
  }
  return errorResult(String(err));
}
