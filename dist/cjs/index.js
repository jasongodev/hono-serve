"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serve = exports.getRuntime = void 0;
var hono_1 = require("hono");
var nextjs_1 = require("hono/nextjs");
function getRuntime() {
    var _a, _b;
    var global = globalThis;
    if ((global === null || global === void 0 ? void 0 : global.Deno) !== undefined) {
        return 'deno';
    }
    if ((global === null || global === void 0 ? void 0 : global.Bun) !== undefined) {
        return 'bun';
    }
    if (typeof (global === null || global === void 0 ? void 0 : global.WebSocketPair) === 'function') {
        return 'workerd';
    }
    if (typeof (global === null || global === void 0 ? void 0 : global.EdgeRuntime) === 'string') {
        return 'edge-light';
    }
    var onFastly = false;
    try {
        var env = require('fastly:env').env;
        if (env instanceof Function)
            onFastly = true;
    }
    catch (_c) { }
    if (onFastly) {
        return 'fastly';
    }
    if ((global === null || global === void 0 ? void 0 : global.__lagon__) !== undefined) {
        return 'lagon';
    }
    if (((_b = (_a = global === null || global === void 0 ? void 0 : global.process) === null || _a === void 0 ? void 0 : _a.release) === null || _b === void 0 ? void 0 : _b.name) === 'node') {
        return 'node';
    }
    return 'other';
}
exports.getRuntime = getRuntime;
var serve = function (app, options) { return __awaiter(void 0, void 0, void 0, function () {
    var runtime, _a, serve_1;
    var _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                runtime = getRuntime();
                if (runtime === 'workerd')
                    return [2, app];
                _a = runtime;
                switch (_a) {
                    case 'bun': return [3, 1];
                    case 'edge-light': return [3, 2];
                    case 'node': return [3, 3];
                    case 'fastly': return [3, 6];
                }
                return [3, 7];
            case 1: return [2, {
                    port: (_c = (_b = options === null || options === void 0 ? void 0 : options.bun) === null || _b === void 0 ? void 0 : _b.port) !== null && _c !== void 0 ? _c : 3000,
                    fetch: app.fetch
                }];
            case 2: return [2, (0, nextjs_1.handle)(app, (_e = (_d = options === null || options === void 0 ? void 0 : options.nextjs) === null || _d === void 0 ? void 0 : _d.path) !== null && _e !== void 0 ? _e : '/api')];
            case 3:
                if (!(global.process.env.VERCEL === '1')) return [3, 4];
                return [2, function (vRequest, vResponse) { return __awaiter(void 0, void 0, void 0, function () {
                        var subApp, stdRequest, honoResponse, _a, _b, _c, _d;
                        var _e, _f;
                        return __generator(this, function (_g) {
                            switch (_g.label) {
                                case 0:
                                    subApp = new hono_1.Hono().route((_f = (_e = options === null || options === void 0 ? void 0 : options.vercel) === null || _e === void 0 ? void 0 : _e.path) !== null && _f !== void 0 ? _f : '/api', app);
                                    stdRequest = new Request("https://".concat(global.process.env.VERCEL_URL).concat(vRequest.url), {
                                        method: vRequest.method,
                                        body: vRequest.body
                                    });
                                    Object.keys(vRequest.headers).forEach(function (name) {
                                        stdRequest.headers.set(name, vRequest.headers[name]);
                                    });
                                    return [4, subApp.fetch(stdRequest)];
                                case 1:
                                    honoResponse = _g.sent();
                                    honoResponse.headers.forEach(function (value, name) {
                                        vResponse.setHeader(name, value);
                                    });
                                    _b = (_a = vResponse
                                        .status(honoResponse.status))
                                        .send;
                                    _d = (_c = Buffer).from;
                                    return [4, honoResponse.arrayBuffer()];
                                case 2: return [2, _b.apply(_a, [_d.apply(_c, [_g.sent()])])];
                            }
                        });
                    }); }];
            case 4: return [4, Promise.resolve().then(function () { return __importStar(require('@hono/node-server')); })];
            case 5:
                serve_1 = (_f.sent()).serve;
                return [2, serve_1(app)];
            case 6:
                app.fire();
                _f.label = 7;
            case 7: return [2, app];
        }
    });
}); };
exports.serve = serve;
