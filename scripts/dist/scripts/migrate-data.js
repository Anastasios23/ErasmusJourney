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
var client_1 = require("@prisma/client");
var universities_1 = require("../src/data/universities");
var universityAgreements_1 = require("../src/data/universityAgreements");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var universityMap, _i, CYPRUS_UNIVERSITIES_1, uni, university, _a, _b, faculty, createdFaculty, _c, _d, department, createdDepartment, _e, _f, program, agreementsCount, allDepartments, allUniversities, _loop_1, _g, UNIVERSITY_AGREEMENTS_1, agreement, bcrypt_1, hashedAdminPassword, hashedDemoPassword, error_1;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    console.log("🚀 Starting data migration...");
                    _h.label = 1;
                case 1:
                    _h.trys.push([1, 34, 35, 37]);
                    // Clear existing data in correct order (respecting foreign keys)
                    console.log("🧹 Clearing existing data...");
                    return [4 /*yield*/, prisma.application.deleteMany()];
                case 2:
                    _h.sent();
                    return [4 /*yield*/, prisma.story.deleteMany()];
                case 3:
                    _h.sent();
                    return [4 /*yield*/, prisma.agreement.deleteMany()];
                case 4:
                    _h.sent();
                    return [4 /*yield*/, prisma.program.deleteMany()];
                case 5:
                    _h.sent();
                    return [4 /*yield*/, prisma.department.deleteMany()];
                case 6:
                    _h.sent();
                    return [4 /*yield*/, prisma.faculty.deleteMany()];
                case 7:
                    _h.sent();
                    return [4 /*yield*/, prisma.university.deleteMany()];
                case 8:
                    _h.sent();
                    return [4 /*yield*/, prisma.user.deleteMany()];
                case 9:
                    _h.sent();
                    console.log("✅ Existing data cleared");
                    // Migrate Universities
                    console.log("🏫 Migrating universities...");
                    universityMap = new Map();
                    _i = 0, CYPRUS_UNIVERSITIES_1 = universities_1.CYPRUS_UNIVERSITIES;
                    _h.label = 10;
                case 10:
                    if (!(_i < CYPRUS_UNIVERSITIES_1.length)) return [3 /*break*/, 22];
                    uni = CYPRUS_UNIVERSITIES_1[_i];
                    return [4 /*yield*/, prisma.university.create({
                            data: {
                                code: uni.id.toUpperCase(),
                                name: uni.name,
                                shortName: uni.shortName,
                                type: uni.type === "public" ? "PUBLIC" : "PRIVATE",
                                country: "Cyprus",
                                city: uni.faculties[0] ? "Nicosia" : "Cyprus", // Default to Nicosia
                            },
                        })];
                case 11:
                    university = _h.sent();
                    universityMap.set(uni.id, university.id);
                    console.log("  \u2713 Created university: ".concat(uni.name));
                    _a = 0, _b = uni.faculties;
                    _h.label = 12;
                case 12:
                    if (!(_a < _b.length)) return [3 /*break*/, 21];
                    faculty = _b[_a];
                    return [4 /*yield*/, prisma.faculty.create({
                            data: {
                                name: faculty.name,
                                universityId: university.id,
                            },
                        })];
                case 13:
                    createdFaculty = _h.sent();
                    _c = 0, _d = faculty.departments;
                    _h.label = 14;
                case 14:
                    if (!(_c < _d.length)) return [3 /*break*/, 20];
                    department = _d[_c];
                    return [4 /*yield*/, prisma.department.create({
                            data: {
                                name: department.name,
                                facultyId: createdFaculty.id,
                            },
                        })];
                case 15:
                    createdDepartment = _h.sent();
                    _e = 0, _f = department.programs;
                    _h.label = 16;
                case 16:
                    if (!(_e < _f.length)) return [3 /*break*/, 19];
                    program = _f[_e];
                    return [4 /*yield*/, prisma.program.create({
                            data: {
                                name: program.name,
                                level: program.level.toUpperCase(),
                                duration: program.duration,
                                type: program.type
                                    ? program.type.toUpperCase().replace("-", "_")
                                    : null,
                                ects: program.ects,
                                departmentId: createdDepartment.id,
                            },
                        })];
                case 17:
                    _h.sent();
                    _h.label = 18;
                case 18:
                    _e++;
                    return [3 /*break*/, 16];
                case 19:
                    _c++;
                    return [3 /*break*/, 14];
                case 20:
                    _a++;
                    return [3 /*break*/, 12];
                case 21:
                    _i++;
                    return [3 /*break*/, 10];
                case 22:
                    console.log("\u2705 Migrated ".concat(universities_1.CYPRUS_UNIVERSITIES.length, " universities"));
                    // Migrate University Agreements
                    console.log("🤝 Migrating university agreements...");
                    agreementsCount = 0;
                    return [4 /*yield*/, prisma.department.findMany({
                            include: {
                                faculty: {
                                    include: {
                                        university: true,
                                    },
                                },
                            },
                        })];
                case 23:
                    allDepartments = _h.sent();
                    return [4 /*yield*/, prisma.university.findMany()];
                case 24:
                    allUniversities = _h.sent();
                    _loop_1 = function (agreement) {
                        var homeUniversity_1, homeDepartment, partnerUniversity, error_2;
                        return __generator(this, function (_j) {
                            switch (_j.label) {
                                case 0:
                                    _j.trys.push([0, 4, , 5]);
                                    homeUniversity_1 = allUniversities.find(function (u) {
                                        return u.name === agreement.homeUniversity ||
                                            u.shortName === agreement.homeUniversity;
                                    });
                                    if (!homeUniversity_1) {
                                        console.warn("  \u26A0\uFE0F  Home university not found: ".concat(agreement.homeUniversity));
                                        return [2 /*return*/, "continue"];
                                    }
                                    homeDepartment = allDepartments.find(function (d) {
                                        return d.faculty.university.id === homeUniversity_1.id &&
                                            (d.name
                                                .toLowerCase()
                                                .includes(agreement.homeDepartment.toLowerCase()) ||
                                                agreement.homeDepartment
                                                    .toLowerCase()
                                                    .includes(d.name.toLowerCase()));
                                    });
                                    if (!homeDepartment) {
                                        console.warn("  \u26A0\uFE0F  Home department not found: ".concat(agreement.homeDepartment, " at ").concat(agreement.homeUniversity));
                                        return [2 /*return*/, "continue"];
                                    }
                                    partnerUniversity = allUniversities.find(function (u) { return u.name === agreement.partnerUniversity; });
                                    if (!!partnerUniversity) return [3 /*break*/, 2];
                                    return [4 /*yield*/, prisma.university.create({
                                            data: {
                                                code: "PARTNER_".concat(agreementsCount),
                                                name: agreement.partnerUniversity,
                                                shortName: agreement.partnerUniversity.substring(0, 10),
                                                type: "PUBLIC", // Default for partner universities
                                                country: agreement.partnerCountry,
                                                city: agreement.partnerCity,
                                            },
                                        })];
                                case 1:
                                    // Create partner university if it doesn't exist
                                    partnerUniversity = _j.sent();
                                    _j.label = 2;
                                case 2: 
                                // Create agreement
                                return [4 /*yield*/, prisma.agreement.create({
                                        data: {
                                            homeUniversityId: homeUniversity_1.id,
                                            homeDepartmentId: homeDepartment.id,
                                            partnerUniversityId: partnerUniversity.id,
                                            partnerCity: agreement.partnerCity,
                                            partnerCountry: agreement.partnerCountry,
                                            agreementType: agreement.agreementType
                                                ? agreement.agreementType.toUpperCase()
                                                : "BOTH",
                                            notes: agreement.notes,
                                            isActive: true,
                                        },
                                    })];
                                case 3:
                                    // Create agreement
                                    _j.sent();
                                    agreementsCount++;
                                    return [3 /*break*/, 5];
                                case 4:
                                    error_2 = _j.sent();
                                    console.error("  \u274C Error creating agreement: ".concat(error_2));
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    };
                    _g = 0, UNIVERSITY_AGREEMENTS_1 = universityAgreements_1.ALL_UNIVERSITY_AGREEMENTS;
                    _h.label = 25;
                case 25:
                    if (!(_g < UNIVERSITY_AGREEMENTS_1.length)) return [3 /*break*/, 28];
                    agreement = UNIVERSITY_AGREEMENTS_1[_g];
                    return [5 /*yield**/, _loop_1(agreement)];
                case 26:
                    _h.sent();
                    _h.label = 27;
                case 27:
                    _g++;
                    return [3 /*break*/, 25];
                case 28:
                    console.log("\u2705 Migrated ".concat(agreementsCount, " university agreements"));
                    // Create sample users
                    console.log("👤 Creating sample users...");
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("bcryptjs"); })];
                case 29:
                    bcrypt_1 = _h.sent();
                    return [4 /*yield*/, bcrypt_1.hash("admin123", 12)];
                case 30:
                    hashedAdminPassword = _h.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: "admin@erasmus.cy",
                                firstName: "Admin",
                                lastName: "User",
                                password: hashedAdminPassword,
                                role: "ADMIN",
                                nationality: "Cyprus",
                                homeCountry: "Cyprus",
                                homeCity: "Nicosia",
                            },
                        })];
                case 31:
                    _h.sent();
                    return [4 /*yield*/, bcrypt_1.hash("demo", 12)];
                case 32:
                    hashedDemoPassword = _h.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: "demo",
                                firstName: "Demo",
                                lastName: "User",
                                password: hashedDemoPassword,
                                role: "USER",
                                nationality: "Cyprus",
                                homeCountry: "Cyprus",
                                homeCity: "Nicosia",
                            },
                        })];
                case 33:
                    _h.sent();
                    console.log("✅ Sample users created:");
                    console.log("   - Admin: admin@erasmus.cy / admin123");
                    console.log("   - Demo: demo / demo");
                    console.log("🎉 Data migration completed successfully!");
                    return [3 /*break*/, 37];
                case 34:
                    error_1 = _h.sent();
                    console.error("❌ Migration failed:", error_1);
                    throw error_1;
                case 35: return [4 /*yield*/, prisma.$disconnect()];
                case 36:
                    _h.sent();
                    return [7 /*endfinally*/];
                case 37: return [2 /*return*/];
            }
        });
    });
}
main().catch(function (e) {
    console.error(e);
    process.exit(1);
});
