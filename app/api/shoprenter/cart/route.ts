import { NextRequest, NextResponse } from 'next/server';

interface CartItem {
  sku: string;
  qty: number;
  name: string;
}

export async function POST(request: NextRequest) {
  const apiUser = process.env.SHOPRENTER_API_USER;
  const apiPassword = process.env.SHOPRENTER_API_PASSWORD;
  const apiUrl = process.env.SHOPRENTER_API_URL;

  if (!apiUser || !apiPassword || !apiUrl) {
    return NextResponse.json({ error: 'Shoprenter API not configured' }, { status: 500 });
  }

  const auth = Buffer.from(`${apiUser}:${apiPassword}`).toString('base64');

  try {
    const { items }: { items: CartItem[] } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    // SKU-k feloldása Shoprenter product ID-kra
    const resolvedItems: Array<{ productId: number; qty: number; name: string; sku: string }> = [];
    const failedItems: Array<{ name: string; sku: string; reason: string }> = [];

    for (const item of items) {
      if (!item.sku) {
        failedItems.push({ name: item.name, sku: '', reason: 'Nincs SKU hozzárendelve' });
        continue;
      }

      try {
        const response = await fetch(`https://${apiUrl}/products?sku=${encodeURIComponent(item.sku)}&full=1`, {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          failedItems.push({ name: item.name, sku: item.sku, reason: `API hiba: ${response.status}` });
          continue;
        }

        const data = await response.json();
        const products = data?.items || [];

        if (products.length === 0) {
          failedItems.push({ name: item.name, sku: item.sku, reason: 'Termék nem található' });
          continue;
        }

        // Product ID kinyerése a resource ID-ból (base64 encoded: "product-product_id=XX")
        const resourceId = products[0]?.id || '';
        const decoded = Buffer.from(resourceId, 'base64').toString('utf-8');
        const match = decoded.match(/product_id=(\d+)/);
        
        if (match) {
          resolvedItems.push({
            productId: parseInt(match[1]),
            qty: item.qty,
            name: item.name,
            sku: item.sku,
          });
        } else {
          failedItems.push({ name: item.name, sku: item.sku, reason: 'Nem sikerült a termék ID kinyerése' });
        }
      } catch (err: any) {
        failedItems.push({ name: item.name, sku: item.sku, reason: err.message });
      }
    }

    // Redirect URL összeállítása
    const cartParams = resolvedItems
      .map(item => `${item.productId}:${item.qty}`)
      .join(',');

    const redirectUrl = resolvedItems.length > 0
      ? `https://www.betonstamp.hu/?kalkulator_cart=${cartParams}`
      : null;

    return NextResponse.json({
      success: true,
      redirectUrl,
      resolvedItems,
      failedItems,
      totalResolved: resolvedItems.length,
      totalFailed: failedItems.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
