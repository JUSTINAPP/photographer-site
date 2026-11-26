import sharp from 'sharp';
export type LogoKit={original:string;dark:string;light:string;icon:string;iconLight:string;note:string};
export async function prepareLogoKit(input:Buffer):Promise<LogoKit>{
 const meta=await sharp(input,{limitInputPixels:16000000}).metadata();if(!['png','jpeg','webp'].includes(meta.format??''))throw Error('Use a PNG, JPEG or WebP logo.');
 const resized=await sharp(input,{limitInputPixels:16000000}).rotate().resize({width:1400,height:400,fit:'inside',withoutEnlargement:true}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const {width,height}=resized.info;const rgba=Buffer.from(resized.data);
 // Preserve existing alpha. For opaque white artwork backgrounds, derive an ink mask;
 // never recolour a coloured logo without showing the proposed result for approval.
 let transparent=false;for(let i=3;i<rgba.length;i+=4){if(rgba[i]<245){transparent=true;break}}
 const edgeLight=(rgba[0]+rgba[1]+rgba[2])/3>128;
 let minX=width,minY=height,maxX=0,maxY=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4;const lum=(rgba[i]+rgba[i+1]+rgba[i+2])/3;
  const alpha=transparent?rgba[i+3]:Math.round((edgeLight?255-lum:lum)*rgba[i+3]/255);
  rgba[i+3]=alpha;if(alpha>25){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y)}
 }
 if(minX>maxX)throw Error('This logo appears blank. Try a higher-contrast file.');
 const box={left:minX,top:minY,width:maxX-minX+1,height:maxY-minY+1};
 const mask=await sharp(rgba,{raw:{width,height,channels:4}}).extract(box).png().toBuffer();
 async function monochrome(white:boolean){const {data,info}=await sharp(mask).raw().toBuffer({resolveWithObject:true});for(let i=0;i<data.length;i+=4){data[i]=data[i+1]=data[i+2]=white?255:20;}return sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).png({palette:true}).toBuffer()}
 const dark=await monochrome(false),light=await monochrome(true);
 // A compact mark is more legible than squeezing a wide wordmark into 32 pixels.
 const iconWidth=Math.min(box.width,box.height);
 const iconSource=await sharp(dark).extract({left:0,top:0,width:iconWidth,height:box.height}).resize(192,192,{fit:'contain',background:'#ffffff00'}).png().toBuffer();
 const iconWhite=await sharp(light).extract({left:0,top:0,width:iconWidth,height:box.height}).resize(192,192,{fit:'contain',background:'#ffffff00'}).png().toBuffer();
 const original=await sharp(input).rotate().resize({width:1400,height:400,fit:'inside',withoutEnlargement:true}).webp({quality:92}).toBuffer();
 const uri=(b:Buffer,mime='png')=>'data:image/'+mime+';base64,'+b.toString('base64');
 return {original:uri(original,'webp'),dark:uri(dark),light:uri(light),icon:uri(iconSource),iconLight:uri(iconWhite),note:box.width>box.height*2?'The browser icon uses a square crop from the left of your logo. Check that it contains your complete symbol; you can upload a separate icon if needed.':'Your browser icon is fitted into a square without stretching.'};
}
