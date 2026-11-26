import sharp from 'sharp';
export async function resizeImagePreview(bytes:Buffer,width:number){
 return sharp(bytes,{limitInputPixels:80000000,animated:false}).rotate().resize({width,height:3840,fit:'inside',withoutEnlargement:true}).webp({quality:80,effort:4}).toBuffer();
}
