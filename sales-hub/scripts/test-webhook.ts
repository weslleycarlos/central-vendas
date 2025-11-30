import crypto from 'crypto';

async function main() {
    const secret = 'YOUR_APP_SECRET'; // Replace with actual secret from DB if known, or mock it
    // For now, we'll just send a request and see if it hits the endpoint. 
    // Since we don't know the exact secret used in the running app (it's in the DB), 
    // we might get a signature error, but that proves the endpoint is reachable.

    // Actually, let's just send a payload and see the response.

    const payload = JSON.stringify({
        code: 3, // ORDER_STATUS_UPDATE
        shop_id: 123456,
        timestamp: Math.floor(Date.now() / 1000),
        data: {
            ordersn: 'TEST_ORDER_' + Date.now()
        }
    });

    const url = 'http://localhost:3000/api/webhooks/shopee';

    // We can't easily generate a valid signature without the secret from the DB.
    // But we can check if the endpoint responds.

    console.log('Sending webhook to:', url);

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'mock_signature' // This will fail validation if strict, but we commented out strict validation for now
            },
            body: payload
        });

        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Response:', data);

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
