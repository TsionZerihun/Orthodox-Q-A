import fs from 'fs';
import path from 'path';

export const metadata={title:'Approved design references · Orthodox Q&A'};

export default function ReferencesPage(){
  const dir=path.join(process.cwd(),'public','references');
  const files=fs.existsSync(dir)
    ?fs.readdirSync(dir).filter(f=>/\.(png|jpe?g|webp)$/i.test(f)).sort()
    :[];
  return (
    <main style={{padding:'28px 24px 64px',maxWidth:1200,margin:'0 auto'}}>
      <p><a href="/">← Orthodox Q&A</a></p>
      <h1 style={{fontFamily:'ForumSerif,Georgia,serif',fontSize:36,margin:'12px 0'}}>Approved design references</h1>
      <p style={{color:'#7a8298',maxWidth:640}}>
        Original mockup PNGs for visual comparison. These are design targets, not screenshots of the running app.
      </p>
      {files.length===0?(
        <p role="status">No reference PNGs found yet. Add them under <code>frontend/public/references/</code>.</p>
      ):(
        <div className="reference-grid">
          {files.map(file=>(
            <figure key={file}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/references/${file}`} alt={`Approved reference ${file}`}/>
              <figcaption style={{marginTop:8,fontSize:13,color:'#7a8298'}}>{file}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </main>
  );
}
