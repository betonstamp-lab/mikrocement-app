import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await context.params;
    
    const updatedOption = await prisma.productOption.update({
      where: { id },
      data: {
        price: body.price
      }
    });
    
    return NextResponse.json(updatedOption);
  } catch (error) {
    console.error('Hiba az ár frissítésekor:', error);
    return NextResponse.json(
      { error: 'Nem sikerült frissíteni az árat' },
      { status: 500 }
    );
  }
}