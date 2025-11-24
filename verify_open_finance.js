const http = require('http');

const BASE_URL = 'http://localhost:3000/openfinance';

function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(BASE_URL + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsedData = data ? JSON.parse(data) : {};
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({ status: res.statusCode, data: parsedData });
                    } else {
                        reject({ status: res.statusCode, data: parsedData });
                    }
                } catch (e) {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({ status: res.statusCode, data });
                    } else {
                        reject({ status: res.statusCode, data });
                    }
                }
            });
        });

        req.on('error', (e) => reject({ message: e.message }));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runVerification() {
    try {
        console.log("Starting Verification...");

        // 1. Create Customer
        console.log("\n1. Creating Customer...");
        const customerRes = await request('POST', '/customers', {
            name: "Test User",
            cpf: "12345678901",
            email: "test@example.com"
        }).catch(e => {
            if (e.status === 409) {
                console.log("Customer already exists, trying lookup...");
                return request('GET', '/customers/lookup/by-cpf/12345678901');
            }
            throw e;
        });

        const customerId = customerRes.data._id;
        console.log("Customer ID:", customerId);

        // 2. Create Account
        console.log("\n2. Creating Account...");
        const accountRes = await request('POST', '/accounts', {
            customerId: customerId,
            type: "checking",
            branch: "001",
            number: "12345" + Math.floor(Math.random() * 1000) // Randomize to avoid duplicate error
        });
        const accountId = accountRes.data._id;
        console.log("Account created:", accountId);

        // 3. Create Transaction
        console.log("\n3. Creating Transaction...");
        await request('POST', '/transactions', {
            accountId: accountId,
            amount: 100.00,
            type: "credit",
            description: "Initial Deposit",
            category: "Deposit"
        });
        console.log("Transaction created.");

        // 4. Test Lookup
        console.log("\n4. Testing Lookup by CPF...");
        const lookupRes = await request('GET', '/customers/lookup/by-cpf/12345678901');
        console.log("Lookup result:", lookupRes.data);

        // 5. Test Protection (Should Fail)
        console.log("\n5. Testing Protection (Should Fail)...");
        try {
            await request('GET', `/customers/${customerId}`);
            console.error("ERROR: Request should have failed!");
        } catch (error) {
            console.log("Success: Request failed as expected with status:", error.status);
        }

        // 6. Create Consent
        console.log("\n6. Creating Consent...");
        const consentRes = await request('POST', '/consents', {
            customerId: customerId,
            permissions: ["CUSTOMER_DATA_READ", "ACCOUNTS_READ", "BALANCES_READ"]
        });
        const consentId = consentRes.data._id;
        console.log("Consent created:", consentId);

        // 7. Test Access (Should Succeed)
        console.log("\n7. Testing Access with Consent...");
        const customerDataRes = await request('GET', `/customers/${customerId}`);
        console.log("Customer Data accessed:", customerDataRes.data._id);

        const accountsRes = await request('GET', `/customers/${customerId}/accounts`);
        console.log("Accounts accessed:", accountsRes.data.length);

        const balanceRes = await request('GET', `/accounts/${accountId}/balance`);
        console.log("Balance accessed:", balanceRes.data);

        // Test Transactions Access (Should Succeed if permission logic allows)
        console.log("Testing Transactions Access...");
        try {
            const transactionsRes = await request('GET', `/transactions/${accountId}`);
            console.log("Transactions accessed:", transactionsRes.data.length);
        } catch (e) {
            console.log("Transactions access failed (might be permission issue):", e.status, e.data);
        }

        // 8. Revoke Consent
        console.log("\n8. Revoking Consent...");
        await request('DELETE', `/consents/${consentId}`);
        console.log("Consent revoked.");

        // 9. Test Protection Again (Should Fail)
        console.log("\n9. Testing Protection Again (Should Fail)...");
        try {
            await request('GET', `/customers/${customerId}`);
            console.error("ERROR: Request should have failed!");
        } catch (error) {
            console.log("Success: Request failed as expected with status:", error.status);
        }

        console.log("\nVerification Complete!");

    } catch (error) {
        console.error("Verification failed:", error.message || error);
        if (error.data) {
            console.error("Response data:", error.data);
        }
    }
}

runVerification();
