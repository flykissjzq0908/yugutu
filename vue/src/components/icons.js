// 与旧版工具栏一致的线性图标（stroke 风格，随 currentColor 变色）
function svg(body) {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
    'width="100%" height="100%">' + body + '</svg>';
}

export const icons = {
  new: svg('<path d="M12 5v14M5 12h14"/>'),
  clear: svg('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'),
  undo: svg('<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'),
  redo: svg('<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>'),
  history: svg('<path d="M12 8v4l3 2"/><circle cx="12" cy="12" r="8"/>'),
  save: svg('<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h8V3M8 21v-6h8v6"/>'),
  data: svg('<circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M12 7v4M5 17v-3h14v3"/>'),
  preview: svg('<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>'),
  theme: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  guide: svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
  import: svg('<path d="M12 3v12M7 8l5-5 5 5"/><path d="M4 17v2h16v-2"/>'),
  exportJson: svg('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 21h16"/>'),
  export: svg('<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4"/>')
};
