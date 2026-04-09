import { NextRequest, NextResponse } from 'next/server';

const PARTNER_GROUP_HREF = 'http://betonstampkft.api.myshoprenter.hu/customerGroups/Y3VzdG9tZXJHcm91cC1jdXN0b21lcl9ncm91cF9pZD05';

export async function POST(request: NextRequest) {
  const apiUser = process.env.SHOPRENTER_API_USER;
  const apiPassword = process.env.SHOPRENTER_API_PASSWORD;
  const apiUrl = process.env.SHOPRENTER_API_URL;

  if (!apiUser || !apiPassword || !apiUrl) {
    return NextResponse.json({ error: 'Shoprenter API not configured' }, { status: 500 });
  }

  const auth = Buffer.from(`${apiUser}:${apiPassword}`).toString('base64');
  const headers = {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Keressük meg az ügyfelet email alapján
    const searchResponse = await fetch(`https://${apiUrl}/customers?email=${encodeURIComponent(email)}&full=1`, {
      headers,
    });

    const searchData = await searchResponse.json();
    const customers = searchData?.items || [];

    if (customers.length > 0) {
      // 2a. Van már fiókja — ellenőrizzük a csoportját
      const customer = customers[0];
      const currentGroupHref = customer?.customerGroup?.href || '';

      if (currentGroupHref === PARTNER_GROUP_HREF) {
        // Már Partner csoportban van
        return NextResponse.json({ 
          status: 'already_partner', 
          message: 'Az ügyfél már a Partner csoportban van.',
          shoprenterId: customer.innerId 
        });
      }

      // Átsoroljuk a Partner csoportba
      const updateResponse = await fetch(`https://${apiUrl}/customers/${customer.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          customerGroup: { href: PARTNER_GROUP_HREF }
        }),
      });

      if (updateResponse.ok) {
        return NextResponse.json({ 
          status: 'updated', 
          message: 'Az ügyfél átsorolva a Partner csoportba.',
          shoprenterId: customer.innerId 
        });
      } else {
        const errText = await updateResponse.text();
        return NextResponse.json({ error: 'Frissítés sikertelen', details: errText }, { status: 500 });
      }
    } else {
      // 2b. Nincs fiókja — létrehozunk egyet a Partner csoportban
      const nameParts = (name || '').split(' ');
      const firstname = nameParts[0] || 'Partner';
      const lastname = nameParts.slice(1).join(' ') || '';

      // Generálunk egy véletlenszerű jelszót (a felhasználó a webshop "elfelejtett jelszó" funkciójával állíthat sajátot)
      const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';

      const createResponse = await fetch(`https://${apiUrl}/customers`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          firstname,
          lastname,
          email,
          password: randomPassword,
          status: '1',
          approved: '1',
          newsletter: '0',
          customerGroup: { href: PARTNER_GROUP_HREF }
        }),
      });

      if (createResponse.ok) {
        const newCustomer = await createResponse.json();
        return NextResponse.json({ 
          status: 'created', 
          message: 'Új webshop fiók létrehozva a Partner csoportban.',
          shoprenterId: newCustomer?.innerId,
          needsPasswordReset: true
        });
      } else {
        const errText = await createResponse.text();
        return NextResponse.json({ error: 'Fiók létrehozás sikertelen', details: errText }, { status: 500 });
      }
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
