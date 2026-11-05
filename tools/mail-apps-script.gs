/**
 * 會考數學總複習：老師發公告時，用老師自己的 Gmail 寄信給全班。
 * 部署方式：部署 → 新增部署作業 → 類型「網頁應用程式」
 *   執行身分：我；誰可以存取：所有人
 * 安全性：只有「該班級的老師本人（Firebase 登入）」呼叫時才會寄信。
 */
const API_KEY = 'AIzaSyCgzoDn1YcH5a75qcmnpgGNPuLPLtWVmPQ';
const PROJECT = 'juniorhighschoolmath';

function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents);
    if (!req.idToken || !req.code || !req.text) return out({ ok: false, err: '資料不完整' });

    // 1. 驗證登入的是誰
    const lk = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + API_KEY, {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({ idToken: req.idToken })
    });
    const users = JSON.parse(lk.getContentText()).users;
    if (!users || !users.length) return out({ ok: false, err: '登入驗證失敗，請重新登入' });
    const uid = users[0].localId;

    // 2. 確認是這個班級的老師
    const base = 'https://firestore.googleapis.com/v1/projects/' + PROJECT + '/databases/(default)/documents';
    const hdr = { Authorization: 'Bearer ' + req.idToken };
    const c = JSON.parse(UrlFetchApp.fetch(base + '/classes/' + encodeURIComponent(req.code), { headers: hdr, muteHttpExceptions: true }).getContentText());
    if (!c.fields || !c.fields.teacher || c.fields.teacher.stringValue !== uid) return out({ ok: false, err: '只有這個班級的老師可以寄信' });
    const cname = c.fields.name ? c.fields.name.stringValue : '';

    // 3. 找出班上學生的 Gmail
    const q = UrlFetchApp.fetch(base + ':runQuery', {
      method: 'post', contentType: 'application/json', headers: hdr, muteHttpExceptions: true,
      payload: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'users' }], where: { compositeFilter: { op: 'AND', filters: [
        { fieldFilter: { field: { fieldPath: 'cls' }, op: 'EQUAL', value: { stringValue: req.code } } },
        { fieldFilter: { field: { fieldPath: 'tch' }, op: 'EQUAL', value: { stringValue: uid } } }
      ] } } } })
    });
    const rows = JSON.parse(q.getContentText());
    if (!Array.isArray(rows)) return out({ ok: false, err: '讀取學生名單失敗' });
    const emails = rows.filter(function (r) { return r.document && r.document.fields && r.document.fields.email; })
      .map(function (r) { return r.document.fields.email.stringValue; })
      .filter(function (x) { return /^[^@\s]+@[^@\s]+$/.test(x); });
    if (!emails.length) return out({ ok: true, n: 0 });

    // 4. 檢查今日額度後寄出（學生放在密件副本，彼此看不到信箱）
    const left = MailApp.getRemainingDailyQuota();
    if (left < emails.length) return out({ ok: false, err: '今天的寄信額度不夠（剩 ' + left + ' 封，需要 ' + emails.length + ' 封）' });
    const link = /^https:\/\/roie-1000\.github\.io\//.test(req.link || '') ? req.link : 'https://roie-1000.github.io/juniorhighschoolmath/#class';
    MailApp.sendEmail({
      to: Session.getEffectiveUser().getEmail(),
      bcc: emails.join(','),
      subject: '【' + cname + '】老師公告',
      body: String(req.text).slice(0, 2000) + '\n\n——\n這封信由「會考數學總複習」網站寄出。\n看全部公告：' + link,
      name: '會考數學・' + cname
    });
    return out({ ok: true, n: emails.length });
  } catch (err) {
    return out({ ok: false, err: String(err) });
  }
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
