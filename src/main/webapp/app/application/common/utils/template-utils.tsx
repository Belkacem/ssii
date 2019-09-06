const b64DecodeUnicode = (base64Str: string) =>
  decodeURIComponent(
    atob(base64Str)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );

export const getHtmlPage = (template: string) => {
  let result = '';
  if (template) {
    const html: string = b64DecodeUnicode(template);
    const dom: Document = new DOMParser().parseFromString(html, 'text/html');
    const body = dom.body;
    const style = dom.head.getElementsByTagName('style')[0];
    result = style.outerHTML + body.innerHTML;
  }
  return result;
};
