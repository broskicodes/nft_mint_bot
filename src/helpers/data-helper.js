const fs = require('fs');
const path = require('path');

const writeData = (data) => {
  const filePath = path.join(__dirname, '..', '..', 'data', 'tx-data.json');
  fs.writeFileSync(filePath, JSON.stringify(data));
}

const readData = (fileName) => {
  const filePath = path.join(__dirname, '..', '..', 'data', fileName);
  const dataBuf = fs.readFileSync(filePath);

  return JSON.parse(dataBuf);
}

module.exports = {
  writeData,
  readData,
}