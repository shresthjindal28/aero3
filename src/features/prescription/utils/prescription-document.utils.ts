const LAYOUT_STYLE_PATTERN =
  /\b(?:max-width|min-width|width|margin(?:-left|-right|-top|-bottom)?|left|right|top|bottom|transform|position)\s*:\s*[^;]+;?/gi;

const CENTERING_MARGIN_PATTERN =
  /\bmargin\s*:\s*(?:\d+px\s+)?auto\b[^;]*/gi;

export function sanitizePrescriptionHtml(html: string): string {
  if (!html.trim()) {
    return html;
  }

  if (typeof document === "undefined") {
    return stripLayoutStylesFromHtmlString(html);
  }

  const template = document.createElement("template");
  template.innerHTML = unwrapPrescriptionDocument(html);

  template.content.querySelectorAll("style").forEach((node) => node.remove());

  template.content.querySelectorAll<HTMLElement>("*").forEach((node) => {
    sanitizePrescriptionNode(node);
  });

  return template.innerHTML;
}

export function normalizePrescriptionDocument(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("*").forEach((node) => {
    sanitizePrescriptionNode(node);
  });

  sanitizePrescriptionNode(root);
}

function sanitizePrescriptionNode(node: HTMLElement) {
  if (isWatermarkNode(node)) {
    node.remove();
    return;
  }

  const tag = node.tagName.toLowerCase();
  if (tag === "html" || tag === "head" || tag === "body") {
    unwrapElement(node);
    return;
  }

  stripLayoutStyles(node);

  if (node.style.position === "fixed") {
    node.remove();
  }
}

function unwrapElement(node: HTMLElement) {
  const parent = node.parentNode;
  if (!parent) return;

  while (node.firstChild) {
    parent.insertBefore(node.firstChild, node);
  }
  parent.removeChild(node);
}

function stripLayoutStyles(node: HTMLElement) {
  const style = node.style;

  if (
    style.position === "absolute" ||
    style.position === "fixed" ||
    style.transform
  ) {
    if (isLikelyOverlay(node)) {
      node.remove();
      return;
    }
  }

  const widthValue = parseCssPixels(style.width);
  const maxWidthValue = parseCssPixels(style.maxWidth);
  const minWidthValue = parseCssPixels(style.minWidth);
  const hasConstrainedWidth =
    (Number.isFinite(widthValue) && widthValue > 0) ||
    (Number.isFinite(maxWidthValue) && maxWidthValue > 0) ||
    (Number.isFinite(minWidthValue) && minWidthValue > 0) ||
    (Boolean(style.maxWidth) &&
      style.maxWidth !== "none" &&
      style.maxWidth !== "100%") ||
    (Boolean(style.minWidth) && style.minWidth !== "0" && style.minWidth !== "0px");
  const hasCentering =
    style.marginLeft === "auto" ||
    style.marginRight === "auto" ||
    style.margin.includes("auto");

  if (hasConstrainedWidth || hasCentering) {
    style.maxWidth = "none";
    style.minWidth = "0";
    style.width = "100%";
    style.margin = "0";
    style.marginLeft = "0";
    style.marginRight = "0";
    style.left = "";
    style.right = "";
    style.transform = "";
  }

  if (style.position === "absolute" || style.position === "fixed") {
    style.position = "static";
    style.left = "";
    style.right = "";
    style.top = "";
    style.bottom = "";
  }
}

function isLikelyOverlay(node: HTMLElement): boolean {
  const text = (node.textContent ?? "").trim().toUpperCase();
  const opacity = Number.parseFloat(node.style.opacity || "1");
  const fontSize = Number.parseFloat(node.style.fontSize || "0");

  return (
    opacity < 0.35 ||
    node.style.transform.includes("rotate") ||
    fontSize >= 36 ||
    (text.includes("PRESCRIPTION") &&
      (text.includes("KEEP") || text.includes("SAFELY")))
  );
}

function isWatermarkNode(node: HTMLElement): boolean {
  const text = (node.textContent ?? "").trim().toUpperCase();
  const style = node.style;
  const opacity = Number.parseFloat(style.opacity || "1");
  const fontSize = Number.parseFloat(style.fontSize || "0");
  const isDecorativeText =
    text.includes("PRESCRIPTION") &&
    (text.includes("KEEP") || text.includes("SAFELY") || text.length < 48);
  const isRotatedOverlay = style.transform.includes("rotate") && opacity < 0.3;
  const isFixedOverlay = style.position === "fixed" && opacity < 0.3;
  const isAbsoluteOverlay =
    style.position === "absolute" &&
    (opacity < 0.3 || style.transform.includes("rotate") || fontSize >= 40);

  return (
    isDecorativeText ||
    isRotatedOverlay ||
    isFixedOverlay ||
    isAbsoluteOverlay
  );
}

function unwrapPrescriptionDocument(html: string): string {
  const trimmed = html.trim();
  const bodyMatch = trimmed.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    return bodyMatch[1].trim();
  }

  return trimmed
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<\/?html[^>]*>/gi, "")
    .replace(/<head[\s\S]*?<\/head>/gi, "");
}

function stripLayoutStylesFromHtmlString(html: string): string {
  return unwrapPrescriptionDocument(html)
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\sstyle="([^"]*)"/gi, (_match, styleValue: string) => {
      const cleaned = cleanInlineStyleAttribute(styleValue);
      return cleaned ? ` style="${cleaned}"` : "";
    });
}

function cleanInlineStyleAttribute(styleValue: string): string {
  return styleValue
    .replace(LAYOUT_STYLE_PATTERN, "")
    .replace(CENTERING_MARGIN_PATTERN, "")
    .replace(/;;+/g, ";")
    .replace(/^\s*;|;\s*$/g, "")
    .trim();
}

function parseCssPixels(value: string): number {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)px$/i);
  return match ? Number.parseFloat(match[1]) : Number.NaN;
}
