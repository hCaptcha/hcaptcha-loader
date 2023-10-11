export function generateQuery(params) {
  return Object.entries(params)
    .filter(([, value]) => value || value === false)
    .map(([key, value]) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    }).join('&');
}

export function getFrame(element: Element) {
  const doc: any = (element && element.ownerDocument) || document;
  const win = doc.defaultView || doc.parentWindow || window;

  return { document: doc, window: win };
}

export function getMountElement(element: Element) {
  return element || document.head;
}
