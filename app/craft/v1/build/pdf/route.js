import pdfController from '@/controllers/pdfController';
import { NextResponse } from 'next/server';

export const POST = async (request) => {
  try {
    const formData = await request.formData();
    const file = formData.get('craftx');
    let disableWatermark = formData.get('disableWatermark');
    disableWatermark = disableWatermark === 'true'? true : false;
    const pdfOptions = await JSON.parse(formData.get('pdfOptions'));
    const { response } = await pdfController.buildPDF(file, disableWatermark, pdfOptions);
    return new NextResponse(response, { status: 200, statusText: 'OK', headers: {
      'Content-Type': 'application/pdf'
    } });
  } catch (err) {
    console.log(err);
    return NextResponse.json({error:err.message},{status: 500});
  }
};
