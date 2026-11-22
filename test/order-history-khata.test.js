var test = require('node:test');
var assert = require('node:assert/strict');

var orders = require('../lib/orders');
var dates = require('../lib/dates');
var ledger = require('../lib/ledger');

function mockDb() {
  return {
    nextOrderId: 1009,
    nextSettlementId: 101,
    orders: [
      { id: 1001, date: '28/12/2021', customer: 'Meera Joshi', total: 676.9 },
      { id: 1004, date: '30/01/2022', customer: 'Kalyani Foods', total: 2194.5 },
      { id: 1008, date: '15/03/2022', customer: 'Walk-in', total: 500 }
    ],
    customers: [
      {
        id: 1,
        name: 'Meera Joshi',
        openingBalance: 450,
        totalBilled: 1982.01,
        totalSettled: 1200,
        balance: 1232.01
      }
    ],
    settlements: []
  };
}

test('dates.normalizeDateKey formats DD/MM/YYYY into chronological YYYY-MM-DD', function () {
  assert.equal(dates.normalizeDateKey('15/03/2022'), '2022-03-15');
  assert.equal(dates.normalizeDateKey('2022-03-15'), '2022-03-15');
});

test('orders.list sorts orders newest first chronologically', function () {
  var db = mockDb();
  var sorted = orders.list(db);

  // Newest order (15/03/2022) must be first, oldest (28/12/2021) must be last
  assert.equal(sorted[0].id, 1008, 'Order #1008 should be first');
  assert.equal(sorted[1].id, 1004, 'Order #1004 should be second');
  assert.equal(sorted[2].id, 1001, 'Order #1001 should be last');
});

test('orders.list filters correctly by date range across calendar years', function () {
  var db = mockDb();
  // Filter for Jan 2022 only
  var filtered = orders.list(db, { from: '2022-01-01', to: '2022-01-31' });

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 1004);
});

test('ledger.recordSettlement adds numerical settlement amount without string concatenation', function () {
  var db = mockDb();

  // Simulate payload where amount is passed as string '500'
  var res = ledger.recordSettlement(db, 1, '500', 'upi', 'Monthly payment');
  assert.equal(res.ok, true);

  var customer = db.customers[0];
  // 1200 + 500 must equal 1700, NOT '1200500'
  assert.equal(customer.totalSettled, 1700);
  // Balance: opening (450) + billed (1982.01) - settled (1700) = 732.01
  assert.equal(customer.balance, 732.01);
});
