// The single place in the app that is allowed to turn an untrusted string into
// HTML that we are willing to inject with dangerouslySetInnerHTML. Keep it as
// one pure function: every note body passes through here when the sanitizer is
// on, and nothing else touches raw HTML.

// Formatting tags we are happy to render. Everything else is removed.
const ALLOWED_TAGS = new Set([
  'B', 'I', 'STRONG', 'EM', 'U', 'P', 'BR',
  'UL', 'OL', 'LI', 'H1', 'H2', 'H3',
  'A', 'SPAN', 'DIV', 'CODE', 'PRE', 'BLOCKQUOTE',
]);

// Tags whose whole subtree must be thrown away (their text content is code or
// otherwise dangerous). Everything not in ALLOWED_TAGS and not here is simply
// "unwrapped": we drop the tag but keep its (already sanitized) children.
const DANGEROUS_TAGS = new Set([
  'SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH',
  'LINK', 'META', 'BASE', 'TEMPLATE', 'NOSCRIPT', 'IMG', 'VIDEO', 'AUDIO',
]);

// Per-tag attribute whitelist. Anything not listed is dropped, which is how we
// strip every on* event handler (onerror, onload, onclick, ...) on every tag.
const ALLOWED_ATTRS: Record<string, string[]> = {
  A: ['href', 'title'],
};

const isSafeUrl = (url: string): boolean => {
  const value = url.trim().toLowerCase();
  // javascript: and (in an href) data: / vbscript: can execute code.
  return !value.startsWith('javascript:')
    && !value.startsWith('data:')
    && !value.startsWith('vbscript:');
};

const sanitizeChildren = (source: Node, target: Node, doc: Document): void => {
  source.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      target.appendChild(doc.createTextNode(child.textContent ?? ''));
      return;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const element = child as Element;
    const tag = element.tagName.toUpperCase();

    if (DANGEROUS_TAGS.has(tag)) {
      // Drop the element AND its subtree. This is why
      // "<script>evil()</script>safe" becomes "safe": the script node and the
      // "evil()" text inside it are removed, the trailing "safe" text stays.
      return;
    }

    if (!ALLOWED_TAGS.has(tag)) {
      // Unknown but not dangerous: drop the tag, keep its sanitized children.
      sanitizeChildren(element, target, doc);
      return;
    }

    const clean = doc.createElement(tag.toLowerCase());
    const allowedAttrs = ALLOWED_ATTRS[tag] ?? [];

    Array.from(element.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on')) {
        return; // never keep event handlers
      }
      if (!allowedAttrs.includes(name)) {
        return;
      }
      if ((name === 'href' || name === 'src') && !isSafeUrl(attr.value)) {
        return;
      }
      clean.setAttribute(name, attr.value);
    });

    sanitizeChildren(element, clean, doc);
    target.appendChild(clean);
  });
};

/**
 * Takes raw HTML and returns HTML that is safe to inject. Never throws:
 * non-string input yields '', and any parse failure degrades to ''.
 */
export const sanitizeHtml = (input: unknown): string => {
  if (typeof input !== 'string') {
    return '';
  }

  try {
    const doc = new DOMParser().parseFromString(input, 'text/html');
    const container = doc.createElement('div');
    sanitizeChildren(doc.body, container, doc);
    return container.innerHTML;
  } catch {
    return '';
  }
};

export default sanitizeHtml;
