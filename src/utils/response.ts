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
