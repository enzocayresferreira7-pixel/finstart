import test from 'node:test';
import assert from 'node:assert/strict';
import { conectar } from '../server/database.js';
import { criarServidor } from '../server/index.js';
test('Proxy HTTPS: origem exata, cookie seguro e bloqueio de origem forjada', async () => {
  const db = conectar(':memory:');
  const server = criarServidor({db, secret:'teste-producao-segredo-com-32-caracteres', secure:true, publicOrigin:'https://finstart.example'});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base=`http://127.0.0.1:${server.address().port}`;
  const body={nome:'Teste Proxy',email:'proxy@example.com',senha:'SenhaTeste123!'};
  const post=(path,origin)=>fetch(base+path,{method:'POST',headers:{'content-type':'application/json',origin,'x-forwarded-host':'finstart.example'},body:JSON.stringify(body)});
  try {
    assert.equal((await post('/api/cadastro','https://evil.example')).status,403);
    assert.equal((await post('/api/cadastro','https://finstart.example')).status,201);
    const login=await post('/api/login','https://finstart.example');
    assert.equal(login.status,200);
    const cookie=login.headers.get('set-cookie');
    for(const flag of ['HttpOnly','Secure','SameSite=Strict']) assert.ok(cookie.includes(flag));
    assert.ok(!cookie.includes('Domain='));
    assert.equal((await fetch(base+'/api/me',{headers:{cookie:cookie.split(';')[0]}})).status,200);
  } finally { await new Promise(r=>server.close(r)); db.close(); }
});
