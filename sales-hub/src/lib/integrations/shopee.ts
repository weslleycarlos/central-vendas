import crypto from 'crypto';

export class ShopeeClient {
    private partnerId: number;
    private partnerKey: string;
    private baseUrl: string;

    constructor(partnerId: number, partnerKey: string, isSandbox = true) {
        this.partnerId = partnerId;
        this.partnerKey = partnerKey;
        this.baseUrl = isSandbox ? 'https://partner.test-stable.shopeemobile.com' : 'https://partner.shopeemobile.com';
    }

    private sign(path: string, query: Record<string, any>) {
        const timestamp = Math.floor(Date.now() / 1000);
        const baseString = `${this.partnerId}${path}${timestamp}`;
        const sign = crypto.createHmac('sha256', this.partnerKey).update(baseString).digest('hex');
        return { ...query, partner_id: this.partnerId, timestamp, sign };
    }

    getAuthUrl(redirectUrl: string) {
        const path = '/api/v2/shop/auth_partner';
        const timestamp = Math.floor(Date.now() / 1000);
        const baseString = `${this.partnerId}${path}${timestamp}`;
        const sign = crypto.createHmac('sha256', this.partnerKey).update(baseString).digest('hex');

        const url = new URL(this.baseUrl + path);
        url.searchParams.append('partner_id', String(this.partnerId));
        url.searchParams.append('timestamp', String(timestamp));
        url.searchParams.append('sign', sign);
        url.searchParams.append('redirect', redirectUrl);

        return url.toString();
    }

    async getToken(code: string, shopId: number) {
        const path = '/api/v2/auth/token/get';
        const timestamp = Math.floor(Date.now() / 1000);
        const body = {
            code,
            shop_id: shopId,
            partner_id: this.partnerId
        };

        const baseString = `${this.partnerId}${path}${timestamp}`;
        const sign = crypto.createHmac('sha256', this.partnerKey).update(baseString).digest('hex');

        const response = await fetch(`${this.baseUrl}${path}?partner_id=${this.partnerId}&timestamp=${timestamp}&sign=${sign}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`Shopee Auth Error: ${response.statusText}`);
        }

        return response.json();
    }

    async publishProduct(product: any, accessToken: string, shopId: string) {
        // Mock implementation
        console.log(`[ShopeeClient] Publishing product ${product.name} to shop ${shopId}`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate success (90%) or failure (10%)
        if (Math.random() > 0.9) {
            throw new Error('Simulated Shopee API Error: Invalid category ID');
        }

        return {
            item_id: 'shopee_item_' + Math.floor(Math.random() * 1000000),
            status: 'NORMAL'
        };
    }
    verifyWebhookSignature(url: string, body: string, signature: string) {
        const baseString = url + '|' + body;
        const generatedSignature = crypto.createHmac('sha256', this.partnerKey).update(baseString).digest('hex');
        return generatedSignature === signature;
    }

    async getOrderDetails(orderSn: string, accessToken: string, shopId: string) {
        // Mock implementation
        console.log(`[ShopeeClient] Fetching details for order ${orderSn}`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            order_sn: orderSn,
            order_status: 'READY_TO_SHIP',
            total_amount: 150.00,
            currency: 'BRL',
            create_time: Math.floor(Date.now() / 1000),
            buyer_user: {
                user_name: 'comprador_teste',
            },
            recipient_address: {
                name: 'João da Silva',
                full_address: 'Rua das Flores, 123, São Paulo, SP',
                phone: '11999999999',
            },
            item_list: [
                {
                    item_id: 12345,
                    item_name: 'Produto Teste',
                    model_quantity_purchased: 1,
                    model_original_price: 150.00,
                }
            ]
        };
    }
}
