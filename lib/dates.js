// Date utilities for ShopLedger (Indian DD/MM/YYYY format)

function pad2(n) {
  return ('0' + n).slice(-2);
}

exports.today = function () {
  var d = new Date();
  return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear();
};

// Accepts either DD/MM/YYYY or YYYY-MM-DD and normalizes for chronological comparison (YYYY-MM-DD)
exports.normalizeDateKey = function (str) {
  if (!str) return '';
  var s = String(str).trim();
  if (s.indexOf('/') !== -1) {
    var p = s.split('/');
    if (p.length === 3) {
      return p[2] + '-' + pad2(p[1]) + '-' + pad2(p[0]);
    }
  } else if (s.indexOf('-') !== -1) {
    var p = s.split('-');
    if (p.length === 3) {
      if (p[0].length === 4) {
        return p[0] + '-' + pad2(p[1]) + '-' + pad2(p[2]);
      }
      return p[2] + '-' + pad2(p[1]) + '-' + pad2(p[0]);
    }
  }
  return s;
};

exports.getFiscalYear = function (dateStr) {
  if (!dateStr) return 'FY21-22';
  var s = String(dateStr).trim();
  var month, year;
  if (s.indexOf('/') !== -1) {
    var parts = s.split('/');
    if (parts.length === 3) {
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    }
  } else if (s.indexOf('-') !== -1) {
    var parts = s.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        month = parseInt(parts[1], 10);
        year = parseInt(parts[0], 10);
      } else {
        month = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
      }
    }
  }
  if (!month || !year) return 'FY21-22';
  if (month >= 4) {
    return 'FY' + String(year).slice(-2) + '-' + String(year + 1).slice(-2);
  }
  return 'FY' + String(year - 1).slice(-2) + '-' + String(year).slice(-2);
};
