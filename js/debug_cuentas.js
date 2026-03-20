import { getCuentas, createCuenta, getWorkspaceId } from './api.js';

async function debugAccounts() {
    const wid = getWorkspaceId();
    console.log("Checking accounts for workspace:", wid);
    try {
        const accounts = await getCuentas(wid);
        console.log("Existing accounts:", accounts);
        if (accounts.length === 0) {
            console.log("No accounts found. Creating a default 'Efectivo' account...");
            const newAcc = await createCuenta(wid, 'Efectivo', 'AHORROS', 'COP', 0);
            console.log("Created account:", newAcc);
        }
    } catch (e) {
        console.error("Account debug error:", e);
    }
}

// Running manually via console if needed or as a one-timer
// debugAccounts();
