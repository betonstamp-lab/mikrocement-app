import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiUser = process.env.SHOPRENTER_API_USER;
  const apiPassword = process.env.SHOPRENTER_API_PASSWORD;
  const apiUrl = process.env.SHOPRENTER_API_URL;
  
  const sku = request.nextUrl.searchParams.get('sku');
  const mode = request.nextUrl.searchParams.get('mode') || 'sku';

  const auth = Buffer.from(`${apiUser}:${apiPassword}`).toString('base64');

  try {
    // Customer groups mode
    if (mode === 'groups') {
      const response = await fetch(`https://${apiUrl}/customerGroups?full=1`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      const data = await response.json();
      return NextResponse.json({ groups: data?.items || data });
    }

    // Customer search by email
    if (mode === 'customer') {
      const email = request.nextUrl.searchParams.get('email') || '';
      const response = await fetch(`https://${apiUrl}/customers?email=${encodeURIComponent(email)}&full=1`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      const data = await response.json();
      return NextResponse.json({ customers: data?.items || data });
    }

    // Default: SKU lookup
    const searchSku = sku || 'TT01603';
    const response = await fetch(`https://${apiUrl}/products?sku=${encodeURIComponent(searchSku)}&full=1`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    const products = data?.items || [];
    
    const results = products.map((p: any) => {
      const resourceId = p?.id || '';
      const decoded = Buffer.from(resourceId, 'base64').toString('utf-8');
      const match = decoded.match(/product_id=(\d+)/);
      
      return {
        resourceId,
        decoded,
        extractedProductId: match ? parseInt(match[1]) : null,
        sku: p?.sku,
      };
    });

    return NextResponse.json({ searchedSku: searchSku, found: products.length, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
