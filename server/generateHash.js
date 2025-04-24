const bcrypt = require('bcryptjs');

(async () => {
  const plainPassword = '123456'; // Replace with your desired password
  const hash = await bcrypt.hash(plainPassword, 10);
  console.log('HASHED PASSWORD:', hash);
})();
