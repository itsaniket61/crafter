import pdfController from '@/controllers/pdfController';
import { NextResponse } from 'next/server';

export const POST = async (request) => {
  try {
    const formData = await request.formData();
    const file = formData.get('craftx');
    const { response } = await pdfController.parseCraftx(file);
    return NextResponse.json(response,{success: 200});
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
