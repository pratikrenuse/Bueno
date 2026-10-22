// A tool page's questions and answers, captured from its prerendered static block before React
// replaced it (seo/StaticPage.jsx, captureStaticBlock), so SiteFooter can show visitors the same
// text that crawlers read in the HTML. Empty on any other page, and after in-app navigation,
// because the block only exists on the page a visitor landed on.
let TOOL_FAQ = null;
export function setToolFaq(path, html) { TOOL_FAQ = { path, html }; }
export function toolFaqFor(pathname) {
  return TOOL_FAQ && TOOL_FAQ.path === pathname ? TOOL_FAQ.html : '';
}
