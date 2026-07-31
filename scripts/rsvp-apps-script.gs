/**
 * RSVP backend — Google Apps Script.
 *
 * Paste this whole file into Extensions → Apps Script on a Google Sheet you
 * own, then deploy it as a Web App. Full step-by-step is in README.md § RSVP.
 *
 * Why Apps Script rather than a real backend: it is free forever, it needs no
 * account beyond the Google one you already have, and the responses land in a
 * spreadsheet you can sort, filter and hand to the caterer. For a wedding
 * that is strictly better than a database.
 */

/** Must match the tab name in your Sheet. */
var SHEET_NAME = 'RSVPs'

var HEADERS = [
  'Timestamp',
  'Name',
  'Attending',
  'Guests',
  'Dietary / Notes',
  'Message',
  'Invited As',
  'Submitted At (client)',
]

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents)
    var sheet = getSheet_()

    sheet.appendRow([
      new Date(),
      String(payload.name || '').slice(0, 200),
      payload.attending === 'yes' ? 'YES' : 'NO',
      Number(payload.guests) || 0,
      String(payload.dietary || '').slice(0, 500),
      String(payload.message || '').slice(0, 1000),
      String(payload.invitedAs || ''),
      String(payload.submittedAt || ''),
    ])

    return json_({ ok: true })
  } catch (error) {
    // Log it so a malformed submission is debuggable from the Executions tab
    // rather than silently disappearing.
    console.error(error)
    return json_({ ok: false, error: String(error) })
  }
}

/**
 * Apps Script does not answer CORS preflight requests, which is why the client
 * sends `Content-Type: text/plain` — that keeps the request "simple" and skips
 * the preflight entirely. This GET handler just makes the deployment easy to
 * smoke-test in a browser.
 */
function doGet() {
  return json_({ ok: true, message: 'RSVP endpoint is live.' })
}

function getSheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = spreadsheet.getSheetByName(SHEET_NAME)

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME)
  }

  // Write and freeze the header row the first time anything arrives.
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS)
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold')
    sheet.setFrozenRows(1)
  }

  return sheet
}

function json_(object) {
  return ContentService.createTextOutput(JSON.stringify(object)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
