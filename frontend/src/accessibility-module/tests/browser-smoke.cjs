const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const url = process.argv[2];
if (!url) throw Error('Uso: node tests/browser-smoke.cjs http://localhost:5173');
(async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
  try {
    for (const viewport of [{width:320,height:568},{width:1440,height:900}]) {
      const page = await browser.newPage({viewport});
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(url);
      const trigger=page.getByRole('button',{name:'Menu de ferramentas de acessibilidade'});
      await trigger.click();await page.waitForTimeout(350);
      const panel=page.locator('#a11y-panel');
      await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
      for(const menu of [null,'Configurações Visuais','Texto e Leitura','Navegação e Foco','Áudio e Narração (TTS)','Foco e Animações']){
        if(menu)await page.getByRole('button',{name:'Abrir menu de '+menu}).click();
        for(let i=0;i<8;i++){await page.keyboard.press(i%2?'Tab':'Shift+Tab');assert(await page.evaluate(()=>!!document.activeElement?.closest('#a11y-panel')));}
        const violations=await page.evaluate(async()=> (await window.axe.run('#a11y-panel',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
        assert.deepEqual(violations,[]);
        if(menu)await page.getByRole('button',{name:'Voltar',exact:true}).click();
      }
      await page.getByRole('button',{name:'Abrir menu de Texto e Leitura'}).click();
      await page.getByRole('slider',{name:'Tamanho do texto',exact:true}).fill('150');
      await page.keyboard.press('Escape');await page.reload();await trigger.click();
      await page.getByRole('button',{name:'Abrir menu de Texto e Leitura'}).click();
      assert.equal(await page.getByRole('slider',{name:'Tamanho do texto',exact:true}).inputValue(),'150');
      await page.getByRole('button',{name:'Redefinir todas as configurações'}).click();
      await page.keyboard.press('Escape');await page.reload();await trigger.click();
      await page.getByRole('button',{name:'Abrir menu de Texto e Leitura'}).click();
      assert.equal(await page.getByRole('slider',{name:'Tamanho do texto',exact:true}).inputValue(),'100');
      assert.equal(await panel.getAttribute('aria-modal'),'true');
      assert.deepEqual(errors,[]);
      await page.close();console.log(`PASS: smoke teclado/axe/persistência/reset ${viewport.width}x${viewport.height}`);
    }
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
