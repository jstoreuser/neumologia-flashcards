"use strict";
/**
 * Cloud Functions — index.ts
 *
 * Central export point. All functions are exported from here.
 * Only add a function here when it is ready for deployment.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAdminRole = exports.deleteUserProfile = exports.createUserProfile = void 0;
var on_create_1 = require("./auth/on-create");
Object.defineProperty(exports, "createUserProfile", { enumerable: true, get: function () { return on_create_1.createUserProfile; } });
var on_delete_1 = require("./auth/on-delete");
Object.defineProperty(exports, "deleteUserProfile", { enumerable: true, get: function () { return on_delete_1.deleteUserProfile; } });
var set_admin_1 = require("./admin/set-admin");
Object.defineProperty(exports, "setAdminRole", { enumerable: true, get: function () { return set_admin_1.setAdminRole; } });
