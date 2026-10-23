export function csvCell(v){let s=v==null?'':String(v);if(/^[=+@\-\t\r]/.test(s)&&typeof v!=='number')s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
export function csvRow(row,columns){return columns.map(k=>csvCell(row[k])).join(',')+'\r\n';}
