sap.ui.define([
    "helphub/test/mockdata/data"
], function (MockData) {
    "use strict";

    QUnit.module("controller/BaseController — apiFetch", {
        beforeEach: function () {
            this._originalFetch = window.fetch;
            // Set up mock storage (name and key must match BaseController.js)
            window.HelpHubStorage = {
                get: function (key, cb) {
                    if (key === "helpmate_token")         { cb(MockData.ACCESS_TOKEN); }
                    else if (key === "helphub_refresh_token") { cb(MockData.REFRESH_TOKEN); }
                    else                                   { cb(null); }
                },
                set: function () {},
                clear: function () {}
            };
        },
        afterEach: function () {
            window.fetch = this._originalFetch;
        }
    });

    // Helper: build a minimal apiFetch-owning controller context
    function makeCtx(fetchImpl) {
        window.fetch = fetchImpl;
        return {
            getRouter: function () {
                return { navTo: function () {} };
            },
            apiFetch: sap.ui.require("helphub/controller/BaseController").prototype
                ? null   // handled below
                : null
        };
    }

    QUnit.test("apiFetch attaches Authorization Bearer header from stored token", function (assert) {
        var done = assert.async();
        var sCapturedAuth = null;

        window.fetch = function (url, opts) {
            sCapturedAuth = opts && opts.headers && opts.headers["Authorization"];
            return Promise.resolve({
                status: 200,
                json: function () { return Promise.resolve({ success: true }); }
            });
        };

        sap.ui.require(["helphub/controller/BaseController"], function (BaseController) {
            var oCtrl = {
                getRouter: function () { return { navTo: function () {} }; },
                apiFetch: BaseController.prototype.apiFetch
            };
            oCtrl.apiFetch.call(oCtrl, "http://localhost:3000/api/test")
                .then(function () {
                    assert.ok(sCapturedAuth, "Authorization header was set");
                    assert.strictEqual(
                        sCapturedAuth,
                        "Bearer " + MockData.ACCESS_TOKEN,
                        "Bearer token matches stored token"
                    );
                    done();
                });
        });
    });

    QUnit.test("apiFetch resolves with parsed JSON on 200", function (assert) {
        var done = assert.async();
        window.fetch = function () {
            return Promise.resolve({
                status: 200,
                json: function () { return Promise.resolve({ success: true, data: "hello" }); }
            });
        };
        sap.ui.require(["helphub/controller/BaseController"], function (BaseController) {
            var oCtrl = {
                getRouter: function () { return { navTo: function () {} }; },
                apiFetch: BaseController.prototype.apiFetch
            };
            oCtrl.apiFetch.call(oCtrl, "http://localhost:3000/api/test")
                .then(function (oData) {
                    assert.strictEqual(oData.data, "hello", "resolves with parsed JSON body");
                    done();
                });
        });
    });

    QUnit.test("apiFetch retries with refreshed token on 401 response", function (assert) {
        var done = assert.async();
        var iCallCount = 0;

        window.fetch = function (url) {
            iCallCount++;
            if (url.indexOf("/auth/refresh") >= 0) {
                return Promise.resolve({
                    status: 200,
                    json: function () { return Promise.resolve({ success: true, accessToken: "new-token-xyz" }); }
                });
            }
            if (iCallCount === 1) {
                // First call returns 401
                return Promise.resolve({
                    status: 401,
                    json: function () { return Promise.resolve({ error: "expired" }); }
                });
            }
            // Retry call succeeds
            return Promise.resolve({
                status: 200,
                json: function () { return Promise.resolve({ success: true, retried: true }); }
            });
        };

        sap.ui.require(["helphub/controller/BaseController"], function (BaseController) {
            var oCtrl = {
                getRouter: function () { return { navTo: function () {} }; },
                apiFetch: BaseController.prototype.apiFetch
            };
            oCtrl.apiFetch.call(oCtrl, "http://localhost:3000/api/protected")
                .then(function (oData) {
                    assert.ok(oData.retried, "retried after 401 and succeeded");
                    done();
                });
        });
    });

    QUnit.test("apiFetch rejects and navigates to login when refresh fails", function (assert) {
        var done = assert.async();
        var bNavigated = false;

        window.fetch = function (url) {
            if (url.indexOf("/auth/refresh") >= 0) {
                return Promise.resolve({
                    status: 200,
                    json: function () { return Promise.resolve({ success: false }); } // refresh failed
                });
            }
            return Promise.resolve({
                status: 401,
                json: function () { return Promise.resolve({ error: "expired" }); }
            });
        };

        sap.ui.require(["helphub/controller/BaseController"], function (BaseController) {
            var oCtrl = {
                getRouter: function () {
                    return {
                        navTo: function (sTarget) { bNavigated = (sTarget === "login"); }
                    };
                },
                apiFetch: BaseController.prototype.apiFetch
            };
            oCtrl.apiFetch.call(oCtrl, "http://localhost:3000/api/protected")
                .catch(function () {
                    assert.ok(bNavigated, "navigated to login after refresh failure");
                    done();
                });
        });
    });
});
