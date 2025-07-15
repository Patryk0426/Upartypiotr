const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot działa!');
});

function keepAlive() {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`✅ Serwer HTTP działa na porcie ${port}`);
  });
}

module.exports = keepAlive;
