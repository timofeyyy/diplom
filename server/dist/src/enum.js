"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppAlias = exports.TokenStatus = void 0;
var TokenStatus;
(function (TokenStatus) {
    TokenStatus[TokenStatus["INVALID"] = 0] = "INVALID";
    TokenStatus[TokenStatus["EXISTS"] = 1] = "EXISTS";
    TokenStatus[TokenStatus["NOTEXISTS"] = -1] = "NOTEXISTS";
})(TokenStatus || (exports.TokenStatus = TokenStatus = {}));
var AppAlias;
(function (AppAlias) {
    AppAlias["JAIL"] = "unauthorized users";
})(AppAlias || (exports.AppAlias = AppAlias = {}));
