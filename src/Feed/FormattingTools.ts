function div(a: number, b: number) {
  return ~~(a / b);
}
function mod(a: number, b: number) {
  return a - ~~(a / b) * b;
}
const dms = [60, 60, 24, 30, 12, 365];
function dec(data: any): any[] {
  let d = data;
  if (d < 1000) {
    d = 1000;
  }
  const pt = [];
  let acc = div(d, 1000);
  for (let i = 0; i < dms.length; i = i + 1) {
    pt[i] = mod(acc, dms[i]);
    acc = div(acc, dms[i]);
  }
  let k;
  for (k = pt.length - 1; k >= 0; k = k - 1) {
    if (pt[k] !== 0) {
      break;
    }
  }
  return [pt, k];
}
const localeData = {
  locale: 'en',
  currency: 'USD',
  delimiters: {
    thousands: ',',
    decimal: '.',
  },
  plural: {
    'n=1': 'one',
    '1<n': 'other',
  },
  fields: {
    year: {
      displayName: 'year',
      relative: {
        0: 'this year',
        1: 'next year',
        '-1': 'last year',
      },
      relativeTime: {
        future: {
          one: 'in ? year',
          other: 'in ? years',
        },
        past: {
          one: '? year ago',
          other: '? years ago',
        },
      },
    },
    month: {
      displayName: 'month',
      relative: {
        0: 'this month',
        1: 'next month',
        '-1': 'last month',
      },
      relativeTime: {
        future: {
          one: 'in ? month',
          other: 'in ? months',
        },
        past: {
          one: '? month ago',
          other: '? months ago',
        },
      },
    },
    day: {
      displayName: 'day',
      relative: {
        0: 'today',
        1: 'tomorrow',
        '-1': 'yesterday',
      },
      relativeTime: {
        future: {
          one: 'in ? day',
          other: 'in ? days',
        },
        past: {
          one: '? day ago',
          other: '? days ago',
        },
      },
    },
    hour: {
      displayName: 'hour',
      relative: {
        0: 'this hour',
      },
      relativeTime: {
        future: {
          one: 'in ? hour',
          other: 'in ? hours',
        },
        past: {
          one: '? hour ago',
          other: '? hours ago',
        },
      },
    },
    minute: {
      displayName: 'minute',
      relative: {
        0: 'this minute',
      },
      relativeTime: {
        future: {
          one: 'in ? minute',
          other: 'in ? minutes',
        },
        past: {
          one: '? minute ago',
          other: '? minutes ago',
        },
      },
    },
    second: {
      displayName: 'second',
      relative: {
        0: 'now',
      },
      relativeTime: {
        future: {
          one: 'in ? second',
          other: 'in ? seconds',
        },
        past: {
          one: '? second ago',
          other: '? seconds ago',
        },
      },
    },
  },
};
function checkN(h: any, n: any) {
  return (h === 'n' ? n : h);
}
function comp(lh: any, op: any, rh: any, n: any) {
  switch (op) {
    case '>':
      return checkN(lh, n) > checkN(rh, n);
    case '<':
      return checkN(lh, n) < checkN(rh, n);
    case '=':
      return +checkN(lh, n) === +checkN(rh, n);
  }
}
function matchExpression(exp: any, n: any) {
  const ez: any[] = [];
  let nex = 0;
  for (let i = 0; i < exp.length; i += 1) {
    const c = exp.charAt(i);
    if (c === '<' || c === '>' || c === '=') {
      if (ez.length > 0) {
        ez[ez.length - 1].rh = exp.substring(nex, i);
      }
      ez.push({
        lh: exp.substring(nex, i),
        op: c,
      });
      nex = i + 1;
    }
  }
  ez[ez.length - 1].rh = exp.substring(nex, exp.length);
  return ez.every(a => comp(a.lh, a.op, a.rh, n));
}
function getPluralKey(n: number) {
  const pls = localeData.plural as any;
  for (const key of Object.keys(pls)) {
    if (matchExpression(key, n)) {
      return pls[key];
    }
  }
  return 'other';
}
export function formatRelative(value: any) {
  try {
    const dt = new Date(value);
    const date = dt.getTime();
    const now = Date.now();
    const offset = dt.getTimezoneOffset() * 60 * 1000;
    const d = (date - now) + offset;
    const sign = Math.sign(d);
    const dx = dec(Math.abs(d));
    const idx = dx[1];
    const a = dx[0][idx];
    const dmn = ['second', 'minute', 'hour', 'day', 'month', 'year'];
    return ((localeData as any).fields[dmn[dx[1]]]['relativeTime'][sign > 0 ? 'future' : 'past'][getPluralKey(a)] as string).replace('?', a)
  } catch (e) {
    return ""
  }
}
function round(num: number, d: number) {
  const a = Math.pow(10, d);
  return Math.round(num * a) / a;
}
export function formatNumber(v: any){
  let value = v;
  if (typeof value === 'undefined' || value === null) {
    return '';
  }
  const fx = 2;
  value = parseFloat(value.toString());
  const sign = Math.sign(value);
  value = sign * value;
  const price = round(value, fx);
  const nm = price.toString();
  let op = '';
  let s = 0;
  const m = nm.length - 1;
  const deci = '.';
  const thz = ',';
  for (let i = m; i > -1; i -= 1) {
    s += 1;
    const l = m - i;
    const c = nm.charAt(i);
    if (c === '.') {
      s = 0;
      op = deci + op;
    } else {
      op = nm[i] + op;
      if (s >= 3 && i !== 0 && l >= fx) {
        op = thz + op;
        s = 0;
      }
    }
  }
  return op;
}