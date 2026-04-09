import { NextResponse } from 'next/server';

export async function GET() {
  const apiUser = process.env.SHOPRENTER_API_USER;
  const apiPassword = process.env.SHOPRENTER_API_PASSWORD;
  const apiUrl = process.env.SHOPRENTER_API_URL;

  if (!apiUser || !apiPassword || !apiUrl) {
    return NextResponse.json({ error: 'Shoprenter API credentials not configured' }, { status: 500 });
  }

  const auth = Buffer.from(`${apiUser}:${apiPassword}`).toString('base64');

  try {
    // Test: lekérjük az első 5 terméket
    const response = await fetch(`https://${apiUrl}/products?limit=5&full=1`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ 
        error: 'Shoprenter API error', 
        status: response.status,
        details: text 
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Shoprenter API connection OK',
      productCount: data?.items?.length || 0,
      sample: data?.items?.slice(0, 2).map((p: any) => ({
        id: p?.id,
        sku: p?.sku,
      })) || []
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Connection failed', 
      details: error.message 
    }, { status: 500 });
  }
}
