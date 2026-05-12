const fs = require('fs'); 
const files = ['visitors.js', 'helpers.js', 'auth.js', 'admin.js']; 
files.forEach(f => { 
  let c = fs.readFileSync('routes/'+f, 'utf8'); 
  c = c.replace(/\.all\(\)/g, ''); 
  c = c.replace(/\.run\(\)/g, ''); 
  c = c.replace(/(?<!await\s)(db\.(select|insert|update|delete))/g, 'await $1'); 
  c = c.replace(/info\.lastInsertRowid/g, 'info[0].insertId'); 
  fs.writeFileSync('routes/'+f, c); 
  console.log('Fixed ' + f); 
});
