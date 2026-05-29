// ============================================================
// Google Apps Script — 入会 / プラン変更 → スプレッドシート連携
// プラン変更・休会・大会などの追加時はリポジトリの docs/member-services.md を参照
// ============================================================
//
// 【セットアップ手順】
//
// 1. Google スプレッドシートを新規作成する
//    - 1行目（ヘッダー）に以下を入力（入会用・先頭シートまたは「入会」シート）:
//      A1: 入会申込日 … R1: 備考（README の表どおり）
//
// 2. プラン変更用シート「プラン変更」は、初回のプラン変更送信時に自動作成されます。
//    手動で用意する場合は 1 行目を次のとおりにしてください:
//      申請日時 | 氏名 | メールアドレス | 電話番号 | 現コース | 希望コース | 希望反映 | 備考 | 休会開始希望月 | 再開予定月 | 休会理由
//
// 3. メニュー「拡張機能」→「Apps Script」を開き、下記を貼り付けて保存
//
// 4.「デプロイ」→「新しいデプロイ」→ ウェブアプリ（実行: 自分 / アクセス: 全員）
//
// 5. 表示された URL を index.html / plan-change.html / leave-request.html の SCRIPT_URL に設定
//
// ============================================================

// 管理通知を受け取りたいGmailアドレスを設定してください。
// 空文字のままなら管理通知は送信せず、お客さん向け確認メールとシート保存だけ行います。
var OWNER_EMAIL_OVERRIDE_ = 'ccj.osaka@gmail.com';

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var raw = JSON.parse(e.postData.contents);

    if (raw.formType === 'plan_change' && raw.payload) {
      handlePlanChange_(ss, raw);
    } else if (raw.formType === 'leave_request' && raw.payload) {
      handleLeaveRequest_(ss, raw);
    } else {
      handleEnrollmentLegacy_(ss, raw);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/** 入会（従来どおりフラット JSON） */
function handleEnrollmentLegacy_(ss, data) {
  var sheet = ss.getSheetByName('入会');
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }

  var row = [
    data['入会申込日'],
    data['コース'],
    data['氏名'],
    data['フリガナ'],
    data['生年月日'],
    data['電話番号'],
    data['予備電話番号'] || '',
    data['メールアドレス'],
    data['予備メールアドレス'] || '',
    data['郵便番号'],
    data['住所1'],
    data['住所2'],
    data['保護者氏名'],
    data['支払い方法'],
    data['年会費規定同意'] || '',
    data['個人情報取扱同意'] || '',
    data['規約バージョン'] || '',
    data['備考'] || ''
  ];

  sheet.appendRow(row);
  sendConfirmationEmail(data);
  sendOwnerEnrollmentNotification_(data);
}

var PLAN_CHANGE_HEADERS_ = [
  '申請日時',
  '氏名',
  'メールアドレス',
  '電話番号',
  '現コース',
  '希望コース',
  '希望反映',
  '備考',
  '休会開始希望月',
  '再開予定月',
  '休会理由'
];

var LEAVE_REQUEST_HEADERS_ = [
  '申請日時',
  '氏名',
  'メールアドレス',
  '電話番号',
  '退会希望月',
  '最終参加予定日',
  '退会理由',
  '備考'
];

/** プラン変更（formType + payload） */
function handlePlanChange_(ss, root) {
  var p = root.payload;
  var sheet = ss.getSheetByName('プラン変更');
  if (!sheet) {
    sheet = ss.insertSheet('プラン変更');
    sheet.appendRow(PLAN_CHANGE_HEADERS_);
  } else {
    ensureHeaders_(sheet, PLAN_CHANGE_HEADERS_);
  }

  var ts = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');
  var row = [
    ts,
    p['氏名'] || '',
    p['メールアドレス'] || '',
    p['電話番号'] || '',
    p['現コース'] || '',
    p['希望コース'] || '',
    p['希望反映'] || '',
    p['備考'] || '',
    p['休会開始希望月'] || '',
    p['再開予定月'] || '',
    p['休会理由'] || ''
  ];
  sheet.appendRow(row);
  sendPlanChangeConfirmationEmail_(p);
  sendOwnerPlanChangeNotification_(p);
}

function ensureHeaders_(sheet, expectedHeaders) {
  var lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) {
    sheet.appendRow(expectedHeaders);
    return;
  }

  var existingHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  expectedHeaders.forEach(function(header) {
    if (existingHeaders.indexOf(header) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
      existingHeaders.push(header);
    }
  });
}

/** 退会のお手続きフォーム（formType + payload） */
function handleLeaveRequest_(ss, root) {
  var p = root.payload;
  var sheet = ss.getSheetByName('退会手続き');
  if (!sheet) {
    sheet = ss.insertSheet('退会手続き');
    sheet.appendRow(LEAVE_REQUEST_HEADERS_);
  }

  var ts = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');
  var row = [
    ts,
    p['氏名'] || '',
    p['メールアドレス'] || '',
    p['電話番号'] || '',
    p['退会希望月'] || '',
    p['最終参加予定日'] || '',
    p['退会理由'] || '',
    p['備考'] || ''
  ];
  sheet.appendRow(row);
  sendOwnerLeaveRequestNotification_(p);
}

function getOwnerEmail_() {
  return OWNER_EMAIL_OVERRIDE_;
}

function sendOwnerNotification_(subject, body, replyTo) {
  try {
    var ownerEmail = getOwnerEmail_();
    if (!ownerEmail) return;

    var options = {};
    if (replyTo) {
      options.replyTo = replyTo;
    }
    MailApp.sendEmail(ownerEmail, subject, body, options);
  } catch (error) {
    console.error('管理者通知メールの送信に失敗しました: ' + error.toString());
  }
}

/**
 * 申し込み者に確認メールを自動送信する（任意機能）
 * 不要な場合は handleEnrollmentLegacy_ 内の sendConfirmationEmail(data); を削除してください
 */
function buildInitialPaymentGuide_(courseName) {
  var annualFee = 3500;
  var monthlyFees = {
    'レギュラーコース': 6700,
    'アドバンスコース': 9400,
    'プロコース': 13000,
    'キッズクラス': 5000
  };

  if (courseName === 'ドロップイン') {
    return '\n'
      + '【初回にお支払いいただく費用の目安】\n'
      + '■ 参加費: 2,500円 / 回\n\n'
      + '※ ドロップインは都度払いです。年会費等の扱いは規約・運用案内をご確認ください。\n';
  }

  var monthlyFee = monthlyFees[courseName];
  if (!monthlyFee) {
    return '\n'
      + '【初回にお支払いいただく費用の目安】\n'
      + '■ 入会金: 5,000円 → キャンペーンにつき無料\n'
      + '■ 年会費: 3,500円\n'
      + '■ 初月会費: コースにより異なります\n\n'
      + '※ 詳細金額は担当者よりご案内いたします。\n';
  }

  return '\n'
    + '【初回にお支払いいただく費用の目安】\n'
    + '■ 入会金: 5,000円 → キャンペーンにつき無料\n'
    + '■ 年会費: 3,500円\n'
    + '■ 初月会費: ' + formatYen_(monthlyFee) + '\n'
    + '■ 初回合計: ' + formatYen_(annualFee + monthlyFee) + '\n\n'
    + '※ 年会費は入会時および毎年3月に3,500円をお支払いいただきます。\n'
    + '※ コースや開始時期により金額が変わる場合は、担当者よりご案内いたします。\n';
}

function formatYen_(amount) {
  return Number(amount).toLocaleString('ja-JP') + '円';
}

function sendConfirmationEmail(data) {
  var subject = '【CCJ.CAPOEIRA OSAKA】入会申し込みを受け付けました';
  var bankTransferUrl = 'https://www.nss-jp2.com/page_ex.jsp?CONTROLID=KTS0960&BUSINESSID=initDisp&DISPLAY_KEY_param=2k7XiZXZspuiZX';
  var organizationCode = '0944082';
  var paymentMethod = data['支払い方法'] || '';
  var bankTransferGuide = '';
  var initialPaymentGuide = buildInitialPaymentGuide_(data['コース']);

  if (paymentMethod.indexOf('口座振替') !== -1) {
    bankTransferGuide = '\n'
      + '【口座振替ご登録のお願い】\n'
      + '口座振替のお手続きについては、以下のページをご確認ください。\n'
      + bankTransferUrl + '\n\n'
      + 'お手続き時の団体コード（必須）: ' + organizationCode + '\n\n'
      + '別途ご提出いただく書類はございません。\n'
      + '引き落としは毎月27日前後（月末付近）を目安として行われます。\n'
      + 'お手続きはできるだけお早めに完了ください。完了のタイミングにより、初回の引き\n'
      + '落としが翌月以降となる場合があります。\n';
  }

  var body = data['氏名'] + ' 様\n\n'
    + 'この度は入会申し込みいただき、ありがとうございます。\n'
    + '以下の内容で受け付けいたしました。\n\n'
    + '━━━━━━━━━━━━━━━━━━━━\n'
    + '■ コース: ' + data['コース'] + '\n'
    + '■ 氏名: ' + data['氏名'] + '\n'
    + '■ フリガナ: ' + data['フリガナ'] + '\n'
    + '■ 生年月日: ' + data['生年月日'] + '\n'
    + '■ 電話番号: ' + data['電話番号'] + '\n'
    + (data['予備電話番号'] ? '■ 予備電話番号: ' + data['予備電話番号'] + '\n' : '')
    + '■ メールアドレス: ' + data['メールアドレス'] + '\n'
    + (data['予備メールアドレス'] ? '■ 予備メールアドレス: ' + data['予備メールアドレス'] + '\n' : '')
    + '■ 郵便番号: ' + data['郵便番号'] + '\n'
    + '■ 住所: ' + data['住所1'] + ' ' + (data['住所2'] || '') + '\n'
    + (data['保護者氏名'] ? '■ 保護者氏名: ' + data['保護者氏名'] + '\n' : '')
    + '■ 支払い方法: ' + data['支払い方法'] + '\n'
    + initialPaymentGuide + '\n'
    + '■ 規約同意: ' + (data['年会費規定同意'] || '同意') + '\n'
    + '■ 個人情報同意: ' + (data['個人情報取扱同意'] || '同意') + '\n'
    + (data['備考'] ? '■ 備考: ' + data['備考'] + '\n' : '')
    + '━━━━━━━━━━━━━━━━━━━━\n'
    + bankTransferGuide + '\n'
    + '【LINE公式へのご登録のお願い】\n'
    + '今後のご案内・連絡網としてLINE公式を利用しています。\n'
    + '該当するクラスのLINE公式にご登録ください。\n\n'
    + '■ 大人クラスにご参加の方\n'
    + 'https://lin.ee/NtABy10\n\n'
    + '■ 子供クラスにご参加の方\n'
    + 'https://lin.ee/9ESVrka\n\n'
    + '担当者よりご連絡を差し上げますので、\n'
    + 'しばらくお待ちくださいませ。\n\n'
    + 'ご不明な点がございましたら、\n'
    + 'お気軽にお問い合わせください。\n\n'
    + 'TEL: 050-3636-3410\n'
    + 'WEB: https://cordao.org/\n\n'
    + '━━━━━━━━━━━━━━━━━━━━\n'
    + 'CCJ.CAPOEIRA OSAKA\n'
    + 'コハダン・ジ・コンタス大阪\n'
    + '━━━━━━━━━━━━━━━━━━━━';

  MailApp.sendEmail(data['メールアドレス'], subject, body);
}

function sendOwnerEnrollmentNotification_(data) {
  var subject = '【管理通知】入会申し込み: ' + (data['氏名'] || '氏名未入力');
  var body = '入会申し込みが送信されました。\n'
    + 'スプレッドシートへの保存も完了しています。\n\n'
    + '━━━━━━━━━━━━━━━━━━━━\n'
    + '■ 入会申込日: ' + (data['入会申込日'] || '') + '\n'
    + '■ コース: ' + (data['コース'] || '') + '\n'
    + '■ 氏名: ' + (data['氏名'] || '') + '\n'
    + '■ フリガナ: ' + (data['フリガナ'] || '') + '\n'
    + '■ 生年月日: ' + (data['生年月日'] || '') + '\n'
    + '■ 電話番号: ' + (data['電話番号'] || '') + '\n'
    + (data['予備電話番号'] ? '■ 予備電話番号: ' + data['予備電話番号'] + '\n' : '')
    + '■ メールアドレス: ' + (data['メールアドレス'] || '') + '\n'
    + (data['予備メールアドレス'] ? '■ 予備メールアドレス: ' + data['予備メールアドレス'] + '\n' : '')
    + '■ 郵便番号: ' + (data['郵便番号'] || '') + '\n'
    + '■ 住所: ' + (data['住所1'] || '') + ' ' + (data['住所2'] || '') + '\n'
    + (data['保護者氏名'] ? '■ 保護者氏名: ' + data['保護者氏名'] + '\n' : '')
    + '■ 支払い方法: ' + (data['支払い方法'] || '') + '\n'
    + '■ 年会費規定同意: ' + (data['年会費規定同意'] || '') + '\n'
    + '■ 個人情報取扱同意: ' + (data['個人情報取扱同意'] || '') + '\n'
    + '■ 規約バージョン: ' + (data['規約バージョン'] || '') + '\n'
    + (data['備考'] ? '■ 備考: ' + data['備考'] + '\n' : '')
    + '━━━━━━━━━━━━━━━━━━━━\n';

  sendOwnerNotification_(subject, body, data['メールアドレス']);
}

/**
 * プラン変更申出の確認メール（任意・不要なら handlePlanChange_ 内の呼び出しを削除）
 */
function sendPlanChangeConfirmationEmail_(p) {
  var subject = '【CCJ.CAPOEIRA OSAKA】プラン変更・休会のお申し出を受け付けました';
  var body = (p['氏名'] || '会員') + ' 様\n\n'
    + 'プラン変更・休会のお申し出を以下の内容で受け付けました。\n'
    + '担当にて内容を確認のうえ、ご連絡いたします。\n\n'
    + '━━━━━━━━━━━━━━━━━━━━\n'
    + '■ 現コース: ' + (p['現コース'] || '') + '\n'
    + '■ 希望コース: ' + (p['希望コース'] || '') + '\n'
    + '■ 希望反映: ' + (p['希望反映'] || '') + '\n'
    + (p['休会開始希望月'] ? '■ 休会開始希望月: ' + p['休会開始希望月'] + '\n' : '')
    + (p['再開予定月'] ? '■ 再開予定月: ' + p['再開予定月'] + '\n' : '')
    + (p['休会理由'] ? '■ 休会理由: ' + p['休会理由'] + '\n' : '')
    + '■ 電話番号: ' + (p['電話番号'] || '') + '\n'
    + '■ メールアドレス: ' + (p['メールアドレス'] || '') + '\n'
    + (p['備考'] ? '■ 備考: ' + p['備考'] + '\n' : '')
    + '━━━━━━━━━━━━━━━━━━━━\n\n'
    + 'ご不明な点は TEL: 050-3636-3410 までお問い合わせください。\n\n'
    + 'CCJ.CAPOEIRA OSAKA\n'
    + 'コハダン・ジ・コンタス大阪\n';

  if (p['メールアドレス']) {
    MailApp.sendEmail(p['メールアドレス'], subject, body);
  }
}

function sendOwnerPlanChangeNotification_(p) {
  var subject = '【管理通知】プラン変更・休会: ' + (p['氏名'] || '氏名未入力');
  var body = 'プラン変更・休会のお申し出が送信されました。\n'
    + 'スプレッドシートへの保存も完了しています。\n\n'
    + '━━━━━━━━━━━━━━━━━━━━\n'
    + '■ 氏名: ' + (p['氏名'] || '') + '\n'
    + '■ 電話番号: ' + (p['電話番号'] || '') + '\n'
    + '■ メールアドレス: ' + (p['メールアドレス'] || '') + '\n'
    + '■ 現コース: ' + (p['現コース'] || '') + '\n'
    + '■ 希望コース: ' + (p['希望コース'] || '') + '\n'
    + '■ 希望反映: ' + (p['希望反映'] || '') + '\n'
    + (p['休会開始希望月'] ? '■ 休会開始希望月: ' + p['休会開始希望月'] + '\n' : '')
    + (p['再開予定月'] ? '■ 再開予定月: ' + p['再開予定月'] + '\n' : '')
    + (p['休会理由'] ? '■ 休会理由: ' + p['休会理由'] + '\n' : '')
    + (p['備考'] ? '■ 備考: ' + p['備考'] + '\n' : '')
    + '━━━━━━━━━━━━━━━━━━━━\n';

  sendOwnerNotification_(subject, body, p['メールアドレス']);
}

function sendOwnerLeaveRequestNotification_(p) {
  var subject = '【管理通知】退会手続き: ' + (p['氏名'] || '氏名未入力');
  var body = '退会手続きが送信されました。\n'
    + 'スプレッドシートへの保存も完了しています。\n\n'
    + '━━━━━━━━━━━━━━━━━━━━\n'
    + '■ 氏名: ' + (p['氏名'] || '') + '\n'
    + '■ 電話番号: ' + (p['電話番号'] || '') + '\n'
    + '■ メールアドレス: ' + (p['メールアドレス'] || '') + '\n'
    + '■ 退会希望月: ' + (p['退会希望月'] || '') + '\n'
    + '■ 最終参加予定日: ' + (p['最終参加予定日'] || '') + '\n'
    + '■ 退会理由: ' + (p['退会理由'] || '') + '\n'
    + (p['備考'] ? '■ 備考: ' + p['備考'] + '\n' : '')
    + '━━━━━━━━━━━━━━━━━━━━\n';

  sendOwnerNotification_(subject, body, p['メールアドレス']);
}

/**
 * GET リクエスト用（動作確認用）
 */
function doGet() {
  return ContentService
    .createTextOutput('CCJ.CAPOEIRA OSAKA フォーム API（入会・プラン変更・退会） is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}
