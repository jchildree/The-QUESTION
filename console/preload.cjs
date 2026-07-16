"use strict";

const { contextBridge } = require("electron");

// Stub - will be populated in a later task
contextBridge.exposeInMainWorld("electronAPI", {});
