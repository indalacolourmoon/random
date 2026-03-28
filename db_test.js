"use strict";
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var promise_1 = require("mysql2/promise");
var dotenv = require("dotenv");
dotenv.config();
function checkDb() {
    return __awaiter(this, void 0, void 0, function () {
        var pool, submissions, issues, rows, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pool = promise_1.default.createPool({
                        host: process.env.DB_HOST,
                        user: process.env.DB_USER,
                        password: process.env.DB_PASSWORD,
                        database: process.env.DB_NAME,
                        port: parseInt(process.env.DB_PORT || '3306'),
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 9]);
                    console.log("Checking submissions...");
                    return [4 /*yield*/, pool.query('SELECT id, paper_id, status, submission_mode, issue_id FROM submissions WHERE paper_id = "IJITEST-2026-001"')];
                case 2:
                    submissions = (_a.sent())[0];
                    console.log("Submission found:", submissions);
                    if (!(submissions.length > 0)) return [3 /*break*/, 5];
                    console.log("\nChecking volumes_issues for issue_id =", submissions[0].issue_id);
                    return [4 /*yield*/, pool.query('SELECT * FROM volumes_issues WHERE id = ?', [submissions[0].issue_id])];
                case 3:
                    issues = (_a.sent())[0];
                    console.log("Issue found:", issues);
                    console.log("\nRunning the exact query from getArchivePapers()...");
                    return [4 /*yield*/, pool.query("\n                SELECT \n                    s.id, s.paper_id, s.status, s.submission_mode,\n                    vi.volume_number, \n                    vi.issue_number \n                FROM submissions s\n                JOIN volumes_issues vi ON s.issue_id = vi.id\n                WHERE s.status = 'published' \n                AND s.submission_mode = 'archive'\n            ")];
                case 4:
                    rows = (_a.sent())[0];
                    console.log("Archive query returned rows:", rows.length);
                    console.log(rows);
                    _a.label = 5;
                case 5: return [3 /*break*/, 9];
                case 6:
                    e_1 = _a.sent();
                    console.error(e_1);
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, pool.end()];
                case 8:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
checkDb();
